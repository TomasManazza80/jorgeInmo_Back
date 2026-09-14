import express from 'express';
import { AppDataSource } from '../database.js';

const router = express.Router();

router.post('/gvamax', express.json(), async (req, res) => {
  const signature = req.headers['gvamax-signature'];
  
  // Validación básica del origen del Webhook
  if (!signature || signature !== process.env.GVAMAX_WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Firma de webhook inválida o ausente' });
  }

  const { id_externo, precio, operacion, titulo } = req.body;

  try {
    const gvamaxId = parseInt(id_externo, 10);
    const propertyRepo = AppDataSource.getRepository('RealEstateObject');
    
    let existingProp = await propertyRepo.findOne({ where: { gvamax_id: gvamaxId } });

    if (existingProp) {
      await propertyRepo.update(existingProp.id, {
        marketPrice: precio ? parseFloat(precio) : existingProp.marketPrice,
        title: titulo || existingProp.title
      });
      return res.status(200).json({ received: true, updated: existingProp.id });
    } else {
      // Find default realtor to assign the property
      const userRepo = AppDataSource.getRepository('User');
      const realtorRepo = AppDataSource.getRepository('Realtor');
      
      let adminUser = await userRepo.findOne({ where: { role: 'ADMIN' } });
      if (!adminUser) adminUser = await userRepo.findOne({ where: { role: 'REALTOR' } });
      if (!adminUser) adminUser = await userRepo.findOne({ where: { role: 'USER' } });
      
      let targetRealtorId = null;
      if (adminUser) {
          let realtor = await realtorRepo.findOne({ where: { userId: adminUser.id } });
          if (!realtor) {
              realtor = await realtorRepo.save(realtorRepo.create({ userId: adminUser.id }));
          }
          targetRealtorId = realtor.id;
      }

      const newProp = await propertyRepo.save(propertyRepo.create({
          gvamax_id: gvamaxId,
          title: titulo || `Propiedad ${gvamaxId} (Importada)`,
          marketPrice: precio ? parseFloat(precio) : null,
          realtorId: targetRealtorId,
          gvamax_sync_status: 'SUCCESS'
      }));

      // Create a default unit as well since some queries might rely on it
      const unitRepo = AppDataSource.getRepository('Unit');
      await unitRepo.save(unitRepo.create({
          realEstateObjectId: newProp.id,
          rentalPrice: operacion === 'Alquiler' && precio ? parseFloat(precio) : null
      }));

      return res.status(200).json({ received: true, created: newProp.id });
    }
  } catch (error) {
    console.error("Error procesando Webhook entrante de GVAmax:", error.message);
    return res.status(500).json({ error: 'Error interno al procesar la propiedad' });
  }
});

export default router;
