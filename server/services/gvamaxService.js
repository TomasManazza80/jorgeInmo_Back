import axios from 'axios';
import { AppDataSource } from '../database.js';

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

const API_URL = process.env.GVAMAX_API_URL || 'https://gvamax.ar/Api/v3';
const ID = process.env.GVAMAX_ID;
const TOKEN = process.env.GVAMAX_TOKEN;

async function fetchGvamax(endpoint, method = 'GET', extraParams = {}) {
    try {
        const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
        const finalEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        
        const url = new URL(`${baseUrl}${finalEndpoint}`);
        
        const params = {
            id: ID,
            token: TOKEN,
            ...extraParams
        };
        
        if (method === 'GET') {
            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        }

        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`GVAmax API Error: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching from GVAmax [${endpoint}]:`, error);
        throw error;
    }
}

// Inmuebles
export const getInmuebles = async (params) => fetchGvamax('/inmuebles', 'GET', params);
export const getTiposInmuebles = async (params) => fetchGvamax('/buscador/Tipos', 'GET', params);
export const getFullLocation = async (params) => fetchGvamax('/buscador/FullLocation', 'GET', params);
export const getBarrios = async (params) => fetchGvamax('/Buscador/Barrios', 'GET', params);
export const getLocalidades = async (params) => fetchGvamax('/Buscador/Localidades', 'GET', params);
export const getProvincias = async (params) => fetchGvamax('/Buscador/Provincias', 'GET', params);
export const getZonas = async (params) => fetchGvamax('/Zonas/', 'GET', params);
export const getLimitesZona = async (params) => fetchGvamax('/Zonas/Limites', 'GET', params);
export const getEmprendimientos = async (params) => fetchGvamax('/empendimientos', 'GET', params);
export const getCrmList = async (params) => fetchGvamax('/CRM/list/', 'GET', params);
export const getCrmUsuarios = async (params) => fetchGvamax('/CRM/usuarios/', 'GET', params);
export const getCrmCarpetas = async (params) => fetchGvamax('/CRM/carpetas/', 'GET', params);
export const getCrmGrupos = async (params) => fetchGvamax('/CRM/grupos/', 'GET', params);
export const getCrmCiclos = async (params) => fetchGvamax('/CRM/ciclos/', 'GET', params);
export const addCrmLead = async (params) => fetchGvamax('/crm/addlead', 'GET', params);

const cleanGvamaxText = (text) => {
    if (!text) return text;
    try {
        let cleaned = Buffer.from(text, 'latin1').toString('utf8');
        if (cleaned.includes('\uFFFD')) {
            cleaned = text; 
        }
        cleaned = cleaned.replace(/<br\s*\/?>/gi, '\n');
        cleaned = cleaned.replace(/<[^>]*>?/gm, '');
        return cleaned;
    } catch (e) {
        return text;
    }
};

export const syncGvamaxToLocal = async (triggeringUserId = null) => {
    try {
        console.log('[GVAmax Sync] Starting sync from GVA Max to Local DB...');
        const propertyRepo = AppDataSource.getRepository('RealEstateObject');
        const userRepo = AppDataSource.getRepository('User');
        const imageRepo = AppDataSource.getRepository('Image');
        const realtorRepo = AppDataSource.getRepository('Realtor');
        
        let adminUser = null;
        if (triggeringUserId) {
            adminUser = await userRepo.findOne({ where: { id: triggeringUserId } });
        }
        
        if (!adminUser) {
            adminUser = await userRepo.findOne({ where: { role: 'ADMIN' } });
        }
        if (!adminUser) {
            adminUser = await userRepo.findOne({ where: { role: 'REALTOR' } });
        }
        if (!adminUser) {
            adminUser = await userRepo.findOne({ where: { role: 'USER' } });
        }
        if (!adminUser) {
            console.error('[GVAmax Sync] No user found in DB. Cannot assign properties. Aborting.');
            return { status: 'error', message: 'No admin/realtor user found.' };
        }

        let realtor = await realtorRepo.findOne({ where: { userId: adminUser.id } });
        if (!realtor) {
            realtor = await realtorRepo.save(realtorRepo.create({ userId: adminUser.id }));
        }
        const targetRealtorId = realtor.id;

        let currentPage = 1;
        let totalPages = 1;
        let importedCount = 0;
        let updatedCount = 0;

        do {
            console.log(`[GVAmax Sync] Fetching page ${currentPage}...`);
            const data = await getInmuebles({ page: currentPage });
            
            if (data.content && data.content.totalpages) {
                totalPages = data.content.totalpages;
            }

            if (!data.propiedades || !Array.isArray(data.propiedades)) {
                break;
            }

            for (const prop of data.propiedades) {
                try {
                    let cleanedPrice = 0;
                    if (prop.precio) {
                        let p = prop.precio.replace(/[^0-9,.]/g, '');
                        p = p.replace(/\./g, '').replace(',', '.');
                        cleanedPrice = parseFloat(p) || 0;
                    }
                    
                    let reType = 'SINGLE_FAMILY_HOME';
                    if (prop.tipoInmueble) {
                        const t = prop.tipoInmueble.toLowerCase();
                        if (t.includes('depto') || t.includes('departamento')) reType = 'APARTMENT';
                        else if (t.includes('local') || t.includes('comercial')) reType = 'RETAIL';
                        else if (t.includes('galp')) reType = 'WAREHOUSE';
                        else if (t.includes('cochera') || t.includes('garage')) reType = 'GARAGE';
                        else if (t.includes('terreno') || t.includes('lote')) reType = 'LAND';
                        else if (t.includes('oficina')) reType = 'OFFICE';
                    }

                    const isRent = prop.tipoOperacion === 'Alquiler';
                    
                    const propertyData = {
                        gvamax_id: prop.id,
                        title: cleanGvamaxText(prop.tituloComercial || `Propiedad ${prop.id}`),
                        description: cleanGvamaxText(prop.descripcion || ''),
                        marketPrice: !isRent ? cleanedPrice : null,
                        currency: prop.moneda === 'D' ? 'USD' : 'ARS',
                        realEstateType: reType,
                        street: prop.ubicacion?.calle || null,
                        city: prop.ubicacion?.localidad || null,
                        state: prop.ubicacion?.provincia || null,
                        country: prop.ubicacion?.pais || null,
                        lotSize: prop.superficies?.metrosTerreno || prop.superficies?.metrosCubiertos || null,
                        realtorId: targetRealtorId,
                        gvamax_sync_status: 'SUCCESS'
                    };

                    let existingProp = await propertyRepo.findOne({ where: { gvamax_id: prop.id } });

                    if (existingProp) {
                        await propertyRepo.update(existingProp.id, propertyData);
                        updatedCount++;
                    } else {
                        existingProp = await propertyRepo.save(propertyRepo.create(propertyData));
                        importedCount++;
                    }

                    // Sync Unit for beds/baths
                    const unitRepo = AppDataSource.getRepository('Unit');
                    let existingUnit = await unitRepo.findOne({ where: { realEstateObjectId: existingProp.id } });
                    const unitData = {
                        numOfBedrooms: prop.dormitorios || 0,
                        numOfBathrooms: prop.banos || 0,
                        numOfRooms: prop.ambientes || 0,
                        garages: prop.cocheras || 0,
                        floor: prop.piso || null,
                        unitSize: prop.superficies?.metrosCubiertos || null,
                        rentalPrice: isRent ? cleanedPrice : null,
                        currency: prop.moneda === 'D' ? 'USD' : 'ARS',
                        realEstateObjectId: existingProp.id
                    };
                    if (existingUnit) {
                        await unitRepo.update(existingUnit.id, unitData);
                    } else {
                        await unitRepo.save(unitRepo.create(unitData));
                    }

                    // Sync Images
                    // Delete existing images to avoid duplicates, then insert current ones
                    await imageRepo.delete({ realEstateObjectId: existingProp.id });
                    
                    const imagesToInsert = [];
                    if (prop.media && prop.media.fotos) {
                        Object.values(prop.media.fotos).forEach(img => {
                            if (img) imagesToInsert.push(img);
                        });
                    } else if (prop.media && prop.media.images) {
                        Object.values(prop.media.images).forEach(img => {
                            if (img) imagesToInsert.push(img);
                        });
                    } else if (prop.imagenPortada) {
                        imagesToInsert.push(prop.imagenPortada);
                    }

                    for (const imgUrl of imagesToInsert) {
                        await imageRepo.save(imageRepo.create({
                            imageUrl: imgUrl,
                            realEstateObjectId: existingProp.id,
                            userId: adminUser.id
                        }));
                    }
                } catch (err) {
                    console.error(`[GVAmax Sync] Error syncing property ${prop.id}:`, err);
                }
            }

            currentPage++;
        } while (currentPage <= totalPages);

        console.log(`[GVAmax Sync] Sync complete. Imported: ${importedCount}, Updated: ${updatedCount}`);
        return { status: 'success', imported: importedCount, updated: updatedCount };
    } catch (error) {
        console.error('[GVAmax Sync] Fatal error during sync:', error);
        throw error;
    }
};
