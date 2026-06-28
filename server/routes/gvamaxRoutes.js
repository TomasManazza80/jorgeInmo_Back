import express from 'express';
import * as gvamaxController from '../controllers/gvamaxController.js';
import { authenticateToken } from '../controllers/authController.js';
import { requireRoles } from '../util/roleMiddleware.js';

const router = express.Router();

// --- Rutas Públicas (Búsqueda de inmuebles, tipos, ubicaciones, etc.) ---
router.get('/inmuebles', gvamaxController.getInmuebles);
router.get('/tipos-inmuebles', gvamaxController.getTiposInmuebles);
router.get('/ubicaciones', gvamaxController.getFullLocation);
router.get('/barrios', gvamaxController.getBarrios);
router.get('/localidades', gvamaxController.getLocalidades);
router.get('/provincias', gvamaxController.getProvincias);
router.get('/zonas', gvamaxController.getZonas);
router.get('/zonas-limites', gvamaxController.getLimitesZona);
router.get('/emprendimientos', gvamaxController.getEmprendimientos);

// --- Rutas Privadas (CRM) ---
// Requieren estar autenticado, y puedes restringirlo por roles si lo deseas. 
// Aquí lo dejo accesible para roles ADMIN y REALTOR.
const crmRoles = requireRoles(['ADMIN', 'REALTOR']);

router.get('/crm/list', authenticateToken, crmRoles, gvamaxController.getCrmList);
router.get('/crm/usuarios', authenticateToken, crmRoles, gvamaxController.getCrmUsuarios);
router.get('/crm/carpetas', authenticateToken, crmRoles, gvamaxController.getCrmCarpetas);
router.get('/crm/grupos', authenticateToken, crmRoles, gvamaxController.getCrmGrupos);
router.get('/crm/ciclos', authenticateToken, crmRoles, gvamaxController.getCrmCiclos);
router.get('/crm/addlead', authenticateToken, gvamaxController.addCrmLead); // Quizás cualquier usuario autenticado puede agregar un lead (o puedes restringirlo)

export default router;
