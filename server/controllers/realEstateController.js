import { AppDataSource } from '../database.js';
import {generateMultiUnitIdentifier, generateSingleUnitIdentifier} from "../util/generateUnitIdentifier.js";
import { uploadToArgenprop, deleteFromArgenprop } from '../services/argenpropService.js';
import { uploadToGvamax, deleteFromGvamax } from '../services/gvamaxService.js';
import { addPropertySyncJob } from '../queues/gvamaxQueue.js';



export async function getProperties(req, res) {
    try {
        const propertyRepo = AppDataSource.getRepository('RealEstateObject');
        const properties = await propertyRepo.createQueryBuilder('property')
            .leftJoinAndSelect('property.units', 'unit')
            .leftJoinAndSelect('property.images', 'image')
            .leftJoin('property.realtor', 'realtor')
            .where('realtor.userId = :userId', { userId: req.user.userId })
            .orderBy('property.createdAt', 'DESC')
            .getMany();
        res.status(200).json({data: properties });
    }
    catch (error) {
        res.status(500).json({ message: "Error getting properties" });
    }
}

export async function createProperty(req, res) {
    try {
        for (let key in req.body) {
            if (req.body[key] === "") req.body[key] = null;
        }

        if (req.body.metareal_url && !req.body.metareal_url.trim().startsWith('<iframe')) {
            try {
                new URL(req.body.metareal_url);
            } catch (e) {
                return res.status(400).json({ message: "La URL del recorrido 3D no tiene un formato válido." });
            }
        }

        const propertyTitle = req.body.title;
        let index = 0;
        for (let unit of req.body.units) {
            index++;
            for (let key in unit) {
                if (unit[key] === "") unit[key] = null;
            }
            unit.unitIdentifier = req.body.units.length > 1 ? generateMultiUnitIdentifier(propertyTitle, unit.unitNumber || index) : generateSingleUnitIdentifier(propertyTitle);
        }

        if (!req.body.images || req.body.images.length === 0) {
            req.body.images = [{
                imageUrl: "https://img.onmanorama.com/content/dam/mm/en/lifestyle/decor/images/2023/6/1/house-middleclass.jpg",
                userId: req.user.userId
            }]
        } else {
            req.body.images = req.body.images.map(image => {
                if (typeof image === 'string') {
                    return { url: image, userId: req.user.userId };
                }
                return { ...image, userId: req.user.userId };
            });
        }
        
        let newProperty;
        await AppDataSource.transaction(async manager => {
            let realtor = await manager.findOne('Realtor', { where: { userId: req.user.userId } });
            
            // Si el usuario no tiene perfil de Realtor, crearlo automáticamente
            if (!realtor) {
                realtor = manager.create('Realtor', {
                    userId: req.user.userId,
                    experience: 0,
                    licenseNumber: `LIC-${req.user.userId}`,
                    specialization: 'General'
                });
                await manager.save('Realtor', realtor);
            }
            
            const propertyToCreate = manager.create('RealEstateObject', {
                ...req.body,
                realtorId: realtor.id
            });
            delete propertyToCreate.units;
            delete propertyToCreate.images;
            
            newProperty = await manager.save('RealEstateObject', propertyToCreate);
            
            if (req.body.units && req.body.units.length > 0) {
                const unitsToCreate = req.body.units.map(unit => manager.create('Unit', { ...unit, realEstateObjectId: newProperty.id }));
                await manager.save('Unit', unitsToCreate);
            }
            
            if (req.body.images && req.body.images.length > 0) {
                const imagesToCreate = req.body.images.map(image => {
                    const imgUrl = typeof image === 'string' ? image : (image.url || image);
                    const imgFileId = typeof image === 'object' && image.fileId ? image.fileId : null;
                    return manager.create('Image', { imageUrl: imgUrl, fileId: imgFileId, realEstateObjectId: newProperty.id, userId: req.user.userId });
                });
                await manager.save('Image', imagesToCreate);
            }
            
            newProperty = await manager.findOne('RealEstateObject', { where: { id: newProperty.id }, relations: { units: true } });
        });

        try {
            await addPropertySyncJob(newProperty.id);
            if (newProperty.argenprop_enabled) {
                uploadToArgenprop(newProperty.id).catch(err => console.error(`Fallo Argenprop en background para ID ${newProperty.id}:`, err));
            }
        } catch (error) {
            console.error("Error al encolar trabajos de sincronización:", error);
        }

        res.status(200).json({data: newProperty });
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error creating property" });
    }
}

export async function getProperty(req, res) {
    try {
        const propertyRepo = AppDataSource.getRepository('RealEstateObject');
        const property = await propertyRepo.findOne({
            where: { id: parseInt(req.params.id) },
            relations: { units: true, images: true }
        });
        if (!property) return res.status(404).json({ message: "Property not found" });
        res.status(200).json({data: property });
    }
    catch (error) {
        res.status(500).json({ message: "Error getting property" });
    }
}

export async function deleteProperty(req, res) {
    try {
        const propertyRepo = AppDataSource.getRepository('RealEstateObject');
        const property = await propertyRepo.findOne({ where: { id: parseInt(req.params.id) } });
        
        if (!property) return res.status(404).json({ message: "Property not found" });
        await propertyRepo.delete(property.id);

        if (property.argenprop_enabled) {
            deleteFromArgenprop(property.id).catch(console.error);
        }
        if (property.gvamx) {
            deleteFromGvamax(property.id).catch(console.error);
        }
        res.status(200).json({ message: "Property deleted" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting property" });
    }
}

export async function getUnits(req, res) {
    try {
        const unitRepo = AppDataSource.getRepository('Unit');
        const units = await unitRepo.createQueryBuilder('unit')
            .leftJoinAndSelect('unit.realEstateObject', 'realEstateObject')
            .leftJoinAndSelect('unit.images', 'image')
            .leftJoinAndSelect('unit.leases', 'lease')
            .leftJoin('realEstateObject.realtor', 'realtor')
            .where('realtor.userId = :userId', { userId: req.user.userId })
            .orderBy('unit.createdAt', 'DESC')
            .getMany();
        res.status(200).json({data: units });
    }
    catch (error) {
        res.status(500).json({ message: "Error getting units" });
    }
}

export async function getUnit(req, res) {
    try {
        const unitRepo = AppDataSource.getRepository('Unit');
        const unit = await unitRepo.findOne({
            where: { id: parseInt(req.params.id) },
            relations: { realEstateObject: { images: true, units: true }, images: true, leases: true }
        });
        if (!unit) return res.status(404).json({ message: "Unit not found" });
        res.status(200).json({data: unit });
    }
    catch (error) {
        res.status(500).json({ message: "Error getting unit" });
    }
}

export async function updateUnit(req, res) {
    try {
        const unitRepo = AppDataSource.getRepository('Unit');
        const unit = await unitRepo.createQueryBuilder('unit')
            .leftJoin('unit.realEstateObject', 'realEstateObject')
            .leftJoin('realEstateObject.realtor', 'realtor')
            .where('unit.id = :id', { id: parseInt(req.params.id) })
            .andWhere('realtor.userId = :userId', { userId: req.user.userId })
            .getOne();

        if (!unit) return res.status(404).json({ message: "Unit not found" });

        await unitRepo.update(unit.id, req.body);
        const updatedUnit = await unitRepo.findOne({
            where: { id: unit.id },
            relations: { realEstateObject: true, images: true, leases: true }
        });
        res.status(200).json({data: updatedUnit });
    }
    catch (error) {
        res.status(500).json({ message: "Error updating unit" });
    }
}

export async function getPublicProperties(req, res) {
    try {
        const propertyRepo = AppDataSource.getRepository('RealEstateObject');
        const properties = await propertyRepo.find({
            order: { createdAt: "DESC" },
            relations: { units: true, images: true }
        });
        res.status(200).json({data: properties });
    }
    catch (error) {
        res.status(500).json({ message: "Error getting public properties" });
    }
}

export async function getPublicProperty(req, res) {
    try {
        const propertyRepo = AppDataSource.getRepository('RealEstateObject');
        const property = await propertyRepo.findOne({
            where: { id: parseInt(req.params.id) },
            relations: {
                units: true,
                images: true,
                amenities: {
                    amenity: true
                }
            }
        });
        if (!property) return res.status(404).json({ message: "Property not found" });
        res.status(200).json({data: property });
    }
    catch (error) {
        console.error("Error in getPublicProperty:", error);
        res.status(500).json({ message: "Error getting public property", error: error.message });
    }
}


export const upload3dModel = async (req, res) => {
    try {
        const propertyId = parseInt(req.params.id);
        const tourUrl = req.body.external_url || req.body.metareal_url;
        
        if (!tourUrl) {
            return res.status(400).json({ message: "No se proporcionó una URL." });
        }

        if (!tourUrl.trim().startsWith('<iframe')) {
            try {
                new URL(tourUrl);
            } catch (e) {
                return res.status(400).json({ message: "La URL del recorrido 3D no tiene un formato válido." });
            }
        }
        
        const propertyRepo = AppDataSource.getRepository('RealEstateObject');
        const property = await propertyRepo.findOne({ where: { id: propertyId } });
        
        if (property) {
            property.metareal_url = tourUrl;
            await propertyRepo.save(property);
        }

        try {
            const fs = await import('fs/promises');
            const path = await import('path');
            const modelsDir = path.resolve('public', 'uploads', '3d-models');
            await fs.mkdir(modelsDir, { recursive: true });
            await fs.writeFile(path.join(modelsDir, `${req.params.id}.url.txt`), tourUrl);
        } catch (fsError) {
            console.error("Error saving url.txt file:", fsError);
        }
        
        return res.status(200).json({ data: property || { id: req.params.id }, message: "URL 3D guardada con éxito", tour_3d_url: tourUrl });
    } catch (error) {
        return res.status(500).json({ message: "Error al guardar URL 3D", error: error.message });
    }
};


export async function updateProperty(req, res) {
    try {
        const propertyId = parseInt(req.params.id);
        if (isNaN(propertyId)) return res.status(400).json({ message: "Invalid property ID" });

        let updatedProperty;
        await AppDataSource.transaction(async manager => {
            const property = await manager.findOne('RealEstateObject', {
                where: { id: propertyId },
                relations: { images: true, units: true }
            });
            if (!property) throw new Error("Property not found");

            // Remove related fields to only update primitive ones
            const propertyUpdates = { ...req.body };
            delete propertyUpdates.units;
            delete propertyUpdates.images;

            await manager.update('RealEstateObject', propertyId, propertyUpdates);

            if (req.body.units && Array.isArray(req.body.units)) {
                // To keep it simple, we can update existing units or add new ones
                for (const unit of req.body.units) {
                    if (unit.id) {
                        const { images, ...unitData } = unit;
                        await manager.update('Unit', unit.id, unitData);
                        
                        if (images && Array.isArray(images)) {
                           // Update unit images
                           await manager.delete('Image', { unitId: unit.id });
                           const newImages = images.map(img => {
                               const imgUrl = typeof img === 'string' ? img : (img.url || img);
                               const imgFileId = typeof img === 'object' && img.fileId ? img.fileId : null;
                               return manager.create('Image', { imageUrl: imgUrl, fileId: imgFileId, unitId: unit.id, userId: req.user.userId });
                           });
                           await manager.save('Image', newImages);
                        }
                    } else {
                        const newUnit = manager.create('Unit', { ...unit, realEstateObjectId: propertyId });
                        await manager.save('Unit', newUnit);
                    }
                }
            }

            if (req.body.images && Array.isArray(req.body.images)) {
                // Replace all property images
                await manager.delete('Image', { realEstateObjectId: propertyId, unitId: null });
                const imagesToCreate = req.body.images.map(image => {
                    const imgUrl = typeof image === 'string' ? image : (image.url || image);
                    const imgFileId = typeof image === 'object' && image.fileId ? image.fileId : null;
                    return manager.create('Image', { imageUrl: imgUrl, fileId: imgFileId, realEstateObjectId: propertyId, userId: req.user.userId });
                });
                await manager.save('Image', imagesToCreate);
            }

            updatedProperty = await manager.findOne('RealEstateObject', { where: { id: propertyId }, relations: { units: true, images: true } });
        });

        res.status(200).json({ data: updatedProperty, message: "Property updated successfully" });
    } catch (error) {
        console.error("Error updating property:", error);
        if (error.message === "Property not found") {
            return res.status(404).json({ message: "Property not found" });
        }
        res.status(500).json({ message: "Error updating property" });
    }
}
