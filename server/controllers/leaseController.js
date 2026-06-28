import { AppDataSource } from '../database.js';
import {createLeaseWithPaymentSchedule} from "../services/leaseService.js";

export async function getLeases(req, res) {
    const {unitId, tenantId} = req.query;

    try {
        const leaseRepo = AppDataSource.getRepository('Lease');
        const qb = leaseRepo.createQueryBuilder('lease')
            .leftJoinAndSelect('lease.tenant', 'tenant')
            .leftJoinAndSelect('lease.unit', 'unit')
            .leftJoinAndSelect('lease.paymentSchedule', 'paymentSchedule')
            .leftJoinAndSelect('lease.rentPayments', 'rentPayments')
            .leftJoinAndSelect('lease.expenses', 'expenses')
            .leftJoin('lease.realtor', 'realtor')
            .where('realtor.userId = :userId', { userId: req.user.userId });
            
        if (unitId) {
            qb.andWhere('lease.unitId = :unitId', { unitId: parseInt(unitId) });
        }
        if (tenantId) {
            qb.andWhere('lease.tenantId = :tenantId', { tenantId: parseInt(tenantId) });
        }

        qb.orderBy('lease.createdAt', 'DESC');
        
        const leases = await qb.getMany();
        res.status(200).json({data: leases });
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error getting leases" });
    }
}

export async function getLease(req, res) {
    try {
        const leaseRepo = AppDataSource.getRepository('Lease');
        const lease = await leaseRepo.createQueryBuilder('lease')
            .leftJoinAndSelect('lease.tenant', 'tenant')
            .leftJoinAndSelect('lease.unit', 'unit')
            .leftJoinAndSelect('lease.paymentSchedule', 'paymentSchedule')
            .leftJoin('lease.realtor', 'realtor')
            .where('lease.id = :id', { id: parseInt(req.params.id) })
            .andWhere('realtor.userId = :userId', { userId: req.user.userId })
            .getOne();

        if (!lease) {
            return res.status(404).json({ message: "Lease not found" });
        }
        res.status(200).json({data: lease });
    }
    catch (error) {
        res.status(500).json({ message: "Error getting lease" });
    }
}

export async function createLease(req, res) {
    try {
        const lease = await createLeaseWithPaymentSchedule(req.body,  req.user.userId);
        res.status(200).json({data: lease });
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error creating lease" });
    }
}

export async function updateLease(req, res) {
    try {
        const leaseRepo = AppDataSource.getRepository('Lease');
        const realtorRepo = AppDataSource.getRepository('Realtor');
        
        const realtor = await realtorRepo.findOne({ where: { userId: req.user.userId } });
        
        const leaseToUpdate = await leaseRepo.findOne({ where: { id: parseInt(req.params.id), realtorId: realtor.id } });
        
        if (!leaseToUpdate) {
            return res.status(404).json({ message: "Lease not found" });
        }
        
        await leaseRepo.update(leaseToUpdate.id, req.body);
        
        const lease = await leaseRepo.findOne({
            where: { id: leaseToUpdate.id },
            relations: { tenant: true, unit: true, paymentSchedule: true }
        });
        res.status(200).json({data: lease });
    }
    catch (error) {
        res.status(500).json({ message: "Error updating lease" });
    }
}

export async function deleteLease(req, res) {
    try {
        const leaseRepo = AppDataSource.getRepository('Lease');
        const realtorRepo = AppDataSource.getRepository('Realtor');
        
        const realtor = await realtorRepo.findOne({ where: { userId: req.user.userId } });
        const leaseToDelete = await leaseRepo.findOne({ where: { id: parseInt(req.params.id), realtorId: realtor.id } });
        
        if (leaseToDelete) {
            await leaseRepo.delete(leaseToDelete.id);
        }
        res.status(200).json({data: leaseToDelete });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting lease" });
    }
}

export async function updateManyLeases(req, res) {
    try {
        const leaseRepo = AppDataSource.getRepository('Lease');
        const realtorRepo = AppDataSource.getRepository('Realtor');
        const realtor = await realtorRepo.findOne({ where: { userId: req.user.userId } });
        
        const updatedLeases = [];
        await AppDataSource.transaction(async (manager) => {
            for (const leaseData of req.body) {
                const id = leaseData.id;
                delete leaseData.id;
                await manager.update('Lease', { id, realtorId: realtor.id }, leaseData);
                const l = await manager.findOne('Lease', { where: { id }});
                updatedLeases.push(l);
            }
        });
        res.status(200).json({data: updatedLeases });
    }
    catch (error) {
        res.status(500).json({ message: "Error updating leases" });
    }
}

export async function deleteManyLeases(req, res) {
    try {
        const leaseRepo = AppDataSource.getRepository('Lease');
        const realtorRepo = AppDataSource.getRepository('Realtor');
        const realtor = await realtorRepo.findOne({ where: { userId: req.user.userId } });
        
        const deletedLeases = [];
        await AppDataSource.transaction(async (manager) => {
            for (const leaseData of req.body) {
                const lease = await manager.findOne('Lease', { where: { id: leaseData.id, realtorId: realtor.id } });
                if (lease) {
                    deletedLeases.push(lease);
                    await manager.delete('Lease', { id: lease.id });
                }
            }
        });
        res.status(200).json({data: deletedLeases });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting leases" });
    }
}