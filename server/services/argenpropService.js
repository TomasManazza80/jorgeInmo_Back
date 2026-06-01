import axios from 'axios';

// URL base de la API de Argenprop (usando la de testing/staging como placeholder)
// Reemplazar con la URL final de producción cuando se obtengan credenciales
const ARGENPROP_API_URL = process.env.ARGENPROP_API_URL || 'https://api.argenprop.com/v1';

/**
 * Publicar o actualizar propiedad en Argenprop
 * @param {Object} property Datos de la propiedad local
 */
export async function uploadToArgenprop(property) {
    try {
        console.log(`[Argenprop API] Iniciando sincronización de propiedad ID: ${property.id}...`);

        // Datos requeridos típicamente por Argenprop
        const payload = {
            idOrigen: property.id.toString(),
            titulo: property.title || 'Sin Título',
            descripcion: property.description || '',
            precio: property.marketPrice || 0,
            moneda: property.currency || 'USD',
            // Coordenadas y dirección (Crucial para Argenprop)
            ubicacion: {
                calle: property.street || '',
                altura: property.streetNumber || 'S/N', // Requieren altura
                latitud: property.latitude || 0,
                longitud: property.longitude || 0,
                localidad: property.city || '',
                provincia: property.state || ''
            },
            superficieCubierta: property.units?.[0]?.unitSize || 0,
            superficieTotal: property.lotSize || 0,
            habitaciones: property.units?.[0]?.numOfBedrooms || 0,
            banos: property.units?.[0]?.numOfBathrooms || 0,
            cocheras: property.units?.[0]?.garages || 0,
            // Imágenes
            imagenes: property.images?.map(img => img.imageUrl) || []
        };

        console.log(`[Argenprop API] Payload preparado:`, JSON.stringify(payload, null, 2));

        // Descomentar y ajustar cuando se tengan credenciales reales
        /*
        const response = await axios.post(`${ARGENPROP_API_URL}/avisos`, payload, {
            headers: {
                'Authorization': `Bearer ${process.env.ARGENPROP_TOKEN}`,
                'X-Vendedor-Id': process.env.ARGENPROP_VENDEDOR_ID,
                'Content-Type': 'application/json'
            }
        });
        console.log(`[Argenprop API] Éxito:`, response.data);
        return response.data;
        */
       
        console.log(`[Argenprop API] SIMULACIÓN EXITOSA. La propiedad ${property.id} fue (teóricamente) enviada.`);
        return { status: 'mock_success' };
    } catch (error) {
        console.error(`[Argenprop API] Error publicando propiedad:`, error.response?.data || error.message);
        // Aquí se podría implementar una lógica de reintentos o colas (ej. BullMQ)
        throw error;
    }
}

/**
 * Dar de baja propiedad en Argenprop
 * @param {string|number} propertyId ID de la propiedad local
 */
export async function deleteFromArgenprop(propertyId) {
    try {
        console.log(`[Argenprop API] Eliminando propiedad ID: ${propertyId}...`);
        
        /*
        await axios.delete(`${ARGENPROP_API_URL}/avisos/${propertyId}`, {
             headers: {
                'Authorization': `Bearer ${process.env.ARGENPROP_TOKEN}`,
                'X-Vendedor-Id': process.env.ARGENPROP_VENDEDOR_ID
            }
        });
        */
       
        console.log(`[Argenprop API] SIMULACIÓN EXITOSA. Propiedad dada de baja.`);
        return { status: 'mock_deleted' };
    } catch (error) {
         console.error(`[Argenprop API] Error eliminando propiedad:`, error.response?.data || error.message);
    }
}
