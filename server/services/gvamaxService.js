import axios from 'axios';

const GVAMAX_API_URL = process.env.GVAMAX_API_URL || 'https://api.gvamax.com/v1';

/**
 * Publicar o actualizar propiedad en GVAmax
 * @param {Object} property Datos de la propiedad local
 */
export async function uploadToGvamax(property) {
    try {
        console.log(`[GVAmax API] Iniciando sincronización de propiedad ID: ${property.id}...`);

        const payload = {
            id: property.id,
            title: property.title || 'Sin Título',
            description: property.description || '',
            price: property.marketPrice || 0,
            currency: property.currency || 'USD',
            address: `${property.street || ''} ${property.streetNumber || ''}`,
            city: property.city || '',
            state: property.state || '',
            country: property.country || '',
            images: property.images?.map(img => img.imageUrl) || []
        };

        console.log(`[GVAmax API] Payload preparado:`, JSON.stringify(payload, null, 2));

        /*
        const response = await axios.post(`${GVAMAX_API_URL}/properties`, payload, {
            headers: {
                'Authorization': `Bearer ${process.env.GVAMAX_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        console.log(`[GVAmax API] Éxito:`, response.data);
        return response.data;
        */
       
        console.log(`[GVAmax API] SIMULACIÓN EXITOSA. La propiedad ${property.id} fue (teóricamente) enviada.`);
        return { status: 'mock_success' };
    } catch (error) {
        console.error(`[GVAmax API] Error publicando propiedad:`, error.response?.data || error.message);
        throw error;
    }
}

/**
 * Dar de baja propiedad en GVAmax
 * @param {string|number} propertyId ID de la propiedad local
 */
export async function deleteFromGvamax(propertyId) {
    try {
        console.log(`[GVAmax API] Eliminando propiedad ID: ${propertyId}...`);
        
        /*
        await axios.delete(`${GVAMAX_API_URL}/properties/${propertyId}`, {
             headers: {
                'Authorization': `Bearer ${process.env.GVAMAX_API_KEY}`,
            }
        });
        */
       
        console.log(`[GVAmax API] SIMULACIÓN EXITOSA. Propiedad dada de baja.`);
        return { status: 'mock_deleted' };
    } catch (error) {
         console.error(`[GVAmax API] Error eliminando propiedad:`, error.response?.data || error.message);
    }
}
