import { AppDataSource } from '../database.js';
import {createLeaseWithPaymentSchedule} from "../services/leaseService.js";
import bcrypt from 'bcryptjs';

export async function createTenant(req, res) {
    const {leaseId} = req.query;
    const tenantData = {...req.body};
    const unitId = tenantData.unitId;
    delete tenantData.lease;
    delete tenantData.unitId;

    const { email, firstName, lastName, phone, civilStatus, occupation, income, creditScore } = tenantData;
    
    delete tenantData.civilStatus;
    delete tenantData.occupation;
    delete tenantData.income;
    delete tenantData.creditScore;

    let newTenant = null;
    let lease = null;
    let user = null;

    try {
        const userRepo = AppDataSource.getRepository('User');
        const tenantRepo = AppDataSource.getRepository('Tenant');
        const unitRepo = AppDataSource.getRepository('Unit');

        if (email) {
            user = await userRepo.findOne({ where: { email } });
            if (!user) {
                const salt = await bcrypt.genSalt(12);
                const hashedPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), salt);
                
                user = userRepo.create({
                    email,
                    firstName,
                    lastName,
                    name: `${firstName} ${lastName}`,
                    phone,
                    password: hashedPassword,
                    salt,
                    role: 'TENANT',
                    civilStatus,
                    occupation,
                    income: income ? parseFloat(income) : null,
                    creditScore: creditScore ? parseInt(creditScore) : null
                });
                await userRepo.save(user);
            } else {
                await userRepo.update({ email }, {
                    firstName: firstName || undefined,
                    lastName: lastName || undefined,
                    phone: phone || undefined,
                    civilStatus: civilStatus || undefined,
                    occupation: occupation || undefined,
                    income: income ? parseFloat(income) : undefined,
                    creditScore: creditScore ? parseInt(creditScore) : undefined
                });
                user = await userRepo.findOne({ where: { email } });
            }
            tenantData.userId = user.id;
        }

        if (user) {
            newTenant = await tenantRepo.findOne({ where: { userId: user.id } });
        }

        if (newTenant) {
            // Actualizar el inquilino existente
            Object.assign(newTenant, tenantData);
            await tenantRepo.save(newTenant);
        } else {
            // Crear uno nuevo
            newTenant = tenantRepo.create({
                ...tenantData
            });
            await tenantRepo.save(newTenant);
        }

        if (unitId) {
            await unitRepo.update(parseInt(unitId), { tenantId: newTenant.id });
        }
        
        if (leaseId) {
            const leaseRepo = AppDataSource.getRepository('Lease');
            await leaseRepo.update(parseInt(leaseId), { tenantId: newTenant.id });
        }
        
        newTenant = await tenantRepo.findOne({
            where: { id: newTenant.id },
            relations: { leases: true, units: true }
        });
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error creating tenant" });
        return;
    }

    try {
        if (!leaseId && req.body?.lease) {
            const leaseBody = req.body?.lease;
            leaseBody.tenantId = newTenant?.id;
            lease = await createLeaseWithPaymentSchedule(leaseBody, req.user.userId);
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error creating lease" });
        return;
    }

    res.status(200).json({data: {
            ...newTenant,
            leases: [lease].filter(Boolean)
        } });

}

export async function getTenants(req, res) {
    try {
        const tenantRepo = AppDataSource.getRepository('Tenant');
        const tenants = await tenantRepo.createQueryBuilder('tenant')
            .leftJoinAndSelect('tenant.leases', 'lease')
            .leftJoinAndSelect('tenant.units', 'unit')
            .leftJoin('lease.realtor', 'realtor')
            .where('realtor.userId = :userId', { userId: req.user.userId })
            .orderBy('tenant.createdAt', 'DESC')
            .getMany();

        res.status(200).json({data: tenants });
    }
    catch (error) {
        res.status(500).json({ message: "Error getting tenants" });
    }
}

export async function getTenant(req, res) {
    try {
        const tenantRepo = AppDataSource.getRepository('Tenant');
        const tenant = await tenantRepo.createQueryBuilder('tenant')
            .leftJoinAndSelect('tenant.leases', 'lease')
            .leftJoinAndSelect('tenant.units', 'unit')
            .leftJoinAndSelect('tenant.maintenanceRequests', 'maintenanceRequests')
            .leftJoinAndSelect('tenant.rentPayments', 'rentPayments')
            .leftJoin('lease.realtor', 'realtor')
            .where('tenant.id = :id', { id: parseInt(req.params.id) })
            .andWhere('realtor.userId = :userId', { userId: req.user.userId })
            .getOne();

        if (!tenant) {
            return res.status(404).json({ message: "Tenant not found" });
        }

        res.status(200).json({data: tenant });
    }
    catch (error) {
        res.status(500).json({ message: "Error getting tenant" });
    }
}

export async function deleteTenant(req, res) {
    try {
        const tenantRepo = AppDataSource.getRepository('Tenant');
        const leaseRepo = AppDataSource.getRepository('Lease');
        
        const tenant = await tenantRepo.findOne({
            where: { id: parseInt(req.params.id) },
            relations: { leases: true }
        });

        if (!tenant) {
            return res.status(404).json({ message: "Tenant not found" });
        }

        // Disconnect the tenant from each lease
        for (const lease of tenant.leases) {
            await leaseRepo.update(lease.id, { tenantId: null });
        }

        // Delete the tenant
        await tenantRepo.delete(tenant.id);

        res.status(200).json({data: tenant });
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error deleting tenant" });
    }
}

export async function updateTenant(req, res) {
    const tenantData = {...req.body};
    const { email, firstName, lastName, phone, civilStatus, occupation, income, creditScore } = tenantData;

    delete tenantData.civilStatus;
    delete tenantData.occupation;
    delete tenantData.income;
    delete tenantData.creditScore;

    try {
        const tenantRepo = AppDataSource.getRepository('Tenant');
        const userRepo = AppDataSource.getRepository('User');
        
        const tenantToUpdate = await tenantRepo.findOne({
            where: { id: parseInt(req.params.id) }
        });

        if (tenantToUpdate && tenantToUpdate.userId) {
            await userRepo.update(tenantToUpdate.userId, {
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                phone: phone || undefined,
                civilStatus: civilStatus || undefined,
                occupation: occupation || undefined,
                income: income ? parseFloat(income) : undefined,
                creditScore: creditScore ? parseInt(creditScore) : undefined
            });
        }

        await tenantRepo.update(parseInt(req.params.id), tenantData);
        
        const updatedTenant = await tenantRepo.findOne({
            where: { id: parseInt(req.params.id) },
            relations: { leases: true }
        });

        res.status(200).json({data: updatedTenant });
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error updating tenant" });
    }
}

export async function assignTenantToUnit(req, res) {
    const unitId = req.params.id;
    const tenantId = req.body.tenantId;

    try {
        const unitRepo = AppDataSource.getRepository('Unit');
        const tenantRepo = AppDataSource.getRepository('Tenant');
        
        if (!tenantId) {
            await unitRepo.update(parseInt(unitId), { tenantId: null });
            const unit = await unitRepo.findOne({ where: { id: parseInt(unitId) }, relations: { tenant: true } });
            return res.status(200).json({data: unit });
        }

        await unitRepo.update(parseInt(unitId), { tenantId: parseInt(tenantId) });

        const updatedTenant = await tenantRepo.findOne({
            where: { id: parseInt(tenantId) },
            relations: { leases: true, units: true }
        });

        res.status(200).json({data: updatedTenant });
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error updating tenant" });
    }
}