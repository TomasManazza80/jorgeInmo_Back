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
    // Convertir el id externo al ID entero correspondiente de nuestra base de datos
    const localPropertyId = parseInt(id_externo, 10);

    const propertyRepo = AppDataSource.getRepository('RealEstateObject');
    // Actualizar base de datos local manteniendo la consistencia de la verdad
    await propertyRepo.update(localPropertyId, {
      marketPrice: parseFloat(precio),
      title: titulo
    });

    return res.status(200).json({ received: true, updated: localPropertyId });
  } catch (error) {
    console.error("Error procesando Webhook entrante de GVAmax:", error.message);
    return res.status(500).json({ error: 'Error interno al actualizar la propiedad' });
  }
});

export default router;
