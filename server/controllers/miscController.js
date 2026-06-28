import { AppDataSource } from '../database.js';

export async function createDocument(req, res) {
    try {
        const {documentType, documentName, documentUrl, realEstateObjectId, leaseId} = req.body;
        const userId = req.user.userId;

        const documentRepo = AppDataSource.getRepository('Document');

        let newDocument = documentRepo.create({
            documentType: documentType,
            documentName: documentName,
            documentUrl: documentUrl,
            userId: userId,
            realEstateObjectId: realEstateObjectId || null,
            leaseId: leaseId || null
        });

        await documentRepo.save(newDocument);

        res.status(200).json({data: newDocument });
    }
    catch (error) {
        res.status(500).json({ message: "Error creating document" });
    }
}

export async function setCurrency(req, res) {
    try {
        const {currency} = req.body;
        const userId = req.user.userId;

        const userRepo = AppDataSource.getRepository('User');
        await userRepo.update(userId, { currencyCode: currency });
        const updatedUser = await userRepo.findOne({ where: { id: userId } });

        res.status(200).json({data: updatedUser });
    }
    catch (error) {
        res.status(500).json({ message: "Error setting currency" });
    }
}


export async function createImage(req, res) {
    try {
        const {imageUrl, realEstateObjectId, leaseId} = req.body;
        const userId = req.user.userId;

        const imageRepo = AppDataSource.getRepository('Image');

        let newImage = imageRepo.create({
            imageUrl: imageUrl,
            userId: userId,
            realEstateObjectId: realEstateObjectId || null,
            leaseId: leaseId || null
        });

        await imageRepo.save(newImage);

        res.status(200).json({data: newImage });
    }
    catch (error) {
        res.status(500).json({ message: "Error creating image" });
    }
}
