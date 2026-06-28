import { AppDataSource } from '../database.js';

// When report is created by Realtor
export async function createMaintenanceReport(req, res) {
    try {
        const userId = req.user.userId;
        const {unitId, reporterId} = req.body;
        delete req.body.unitId;
        delete req.body.reporterId;
        
        const maintenanceRepo = AppDataSource.getRepository('MaintenanceRequest');
        const realtorRepo = AppDataSource.getRepository('Realtor');
        const realtor = await realtorRepo.findOne({ where: { userId } });
        
        if (!realtor) {
            return res.status(400).json({ message: "Realtor not found" });
        }

        const newMaintenanceReport = maintenanceRepo.create({
            ...req.body,
            realtorId: realtor.id,
            unitId: unitId || null,
            reporterId: reporterId || null
        });

        await maintenanceRepo.save(newMaintenanceReport);

        res.status(200).json({data: newMaintenanceReport });
    }
    catch (e) {
        console.log(e)
        res.status(500).json({ message: "Error creating maintenance report" });
    }
}

export async function deleteMaintenanceReport(req, res) {
    try {
        const { id } = req.params;
        const maintenanceRepo = AppDataSource.getRepository('MaintenanceRequest');
        const report = await maintenanceRepo.findOne({ where: { id: parseInt(id) } });
        
        if (report) {
            await maintenanceRepo.delete(parseInt(id));
        }

        res.status(200).json({data: report });
    }
    catch (e) {
        console.log(e)
        res.status(500).json({ message: "Error deleting maintenance report" });
    }
}

export async function getMaintenanceReports(req, res) {
    try {
        const userId = req.user.userId;
        const maintenanceRepo = AppDataSource.getRepository('MaintenanceRequest');
        
        const maintenanceReports = await maintenanceRepo.createQueryBuilder('maintenance')
            .leftJoin('maintenance.realtor', 'realtor')
            .leftJoin('maintenance.reporter', 'reporter')
            .where('realtor.userId = :userId', { userId })
            .orWhere('reporter.userId = :userId', { userId })
            .getMany();

        res.status(200).json({data: maintenanceReports });
    }
    catch (e) {
        res.status(500).json({ message: "Error getting maintenance reports" });
    }
}