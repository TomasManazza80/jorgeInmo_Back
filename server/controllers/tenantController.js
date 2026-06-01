import prisma from '../prisma.js';
import {createLeaseWithPaymentSchedule} from "../services/leaseService.js";
import bcrypt from 'bcryptjs';


// Creates a tenant, if provided link them to a lease, otherwise create new lease using lease data in body
export async function createTenant(req, res) {
    const {leaseId} = req.query;
    const tenantData = {...req.body};
    const unitId = tenantData.unitId;
    // Remove Lease data from tenantdata
    delete tenantData.lease;
    delete tenantData.unitId;

    const { email, firstName, lastName, phone, civilStatus, occupation, income, creditScore } = tenantData;
    
    // Remove User data from tenantData so Prisma doesn't crash on Tenant creation
    delete tenantData.civilStatus;
    delete tenantData.occupation;
    delete tenantData.income;
    delete tenantData.creditScore;

    let newTenant = null;
    let lease = null;
    let user = null;

    try {
        if (email) {
            user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                const salt = await bcrypt.genSalt(12);
                const hashedPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), salt);
                user = await prisma.user.create({
                    data: {
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
                    }
                });
            } else {
                user = await prisma.user.update({
                    where: { email },
                    data: {
                        firstName: firstName || undefined,
                        lastName: lastName || undefined,
                        phone: phone || undefined,
                        civilStatus: civilStatus || undefined,
                        occupation: occupation || undefined,
                        income: income ? parseFloat(income) : undefined,
                        creditScore: creditScore ? parseInt(creditScore) : undefined
                    }
                });
            }
            tenantData.userId = user.id;
        }

        newTenant = await prisma.tenant.create({
            data: {
                ...tenantData,
                leases: {
                    ...(leaseId ?
                            {connect: {id: parseInt(leaseId)}} : null

                    )
                },
                unit: {
                    ...(unitId ?
                            {connect: {id: parseInt(unitId)}} : null

                    )
                },
            },
            include: {
                leases: true,
                unit: true
            }
        });
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error creating tenant" });
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
    }

    res.status(200).json({data: {
            ...newTenant,
            leases: [lease]
        } });

}

export async function getTenants(req, res) {
    try {
        const tenants = await prisma.tenant.findMany({
            where: {
                leases: {
                    some: {
                        realtor: {
                            userId: req.user.userId
                        }
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            },
            include: {
                leases: true,
                unit: true
            }
        });

        res.status(200).json({data: tenants });
    }
    catch (error) {
        res.status(500).json({ message: "Error getting tenants" });
    }
}

export async function getTenant(req, res) {
    try {
        const tenant = await prisma.tenant.findUnique({
            where: {
                id: parseInt(req.params.id),
                leases: {
                    some: {
                        realtor: {
                            userId: req.user.userId
                        }
                    }
                }
            },
            include: {
                leases: true,
                unit: true,
                maintenanceRequests: true,
                rentPayments: true
            }
        });

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
        const tenant = await prisma.tenant.findUnique({
            where: {
                id: parseInt(req.params.id),
            },
            include: {
                leases: true
            }
        });

        if (!tenant) {
            return res.status(404).json({ message: "Tenant not found" });
        }

        // Disconnect the tenant from each lease
        for (const lease of tenant.leases) {
            await prisma.lease.update({
                where: {
                    id: lease.id
                },

                data: {
                    tenant: {
                        disconnect: {
                            id: tenant.id
                        }
                    }
                }
            });
        }

        // Delete the tenant
        const deletedTenant = await prisma.tenant.delete({
            where: {
                id: tenant.id
            }
        });

        res.status(200).json({data: deletedTenant });
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error deleting tenant" });
    }
}

// Allows realtors to update tenants, but only if the tenant is linked to a lease that the realtor owns.
// If the tenant has created an account of their own, they can update their own tenant data using the same endpoint
export async function updateTenant(req, res) {
    const tenantData = {...req.body};
    const { email, firstName, lastName, phone, civilStatus, occupation, income, creditScore } = tenantData;

    delete tenantData.civilStatus;
    delete tenantData.occupation;
    delete tenantData.income;
    delete tenantData.creditScore;

    try {
        const tenantToUpdate = await prisma.tenant.findUnique({
            where: { id: parseInt(req.params.id) }
        });

        if (tenantToUpdate && tenantToUpdate.userId) {
            await prisma.user.update({
                where: { id: tenantToUpdate.userId },
                data: {
                    firstName: firstName || undefined,
                    lastName: lastName || undefined,
                    phone: phone || undefined,
                    civilStatus: civilStatus || undefined,
                    occupation: occupation || undefined,
                    income: income ? parseFloat(income) : undefined,
                    creditScore: creditScore ? parseInt(creditScore) : undefined
                }
            });
        }

        const updatedTenant = await prisma.tenant.update({
            where: {
                id: parseInt(req.params.id),
                leases: {
                    some: {
                        realtor: {
                            userId: req.user.userId
                        }
                    }
                }

            },
            data: {
                ...tenantData,
            },
            include: {
                leases: true
            }
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
        // If tenantId null, disconnect tenant from unit
        if (!tenantId) {
            const unit = await prisma.unit.update({
                where: {
                    id: parseInt(unitId)
                },
                data: {
                    tenant: {
                        disconnect: true
                    }
                },
                include: {
                    tenant: true
                }
            });

            return res.status(200).json({data: unit });
        }

        const updatedTenant = await prisma.tenant.update({
            where: {
                id: parseInt(tenantId),
                leases: {
                    some: {
                        realtor: {
                            userId: req.user.userId
                        }
                    }
                }
            },
            data: {
                unit: {
                    connect: {
                        id: parseInt(unitId)
                    }
                }
            },
            include: {
                leases: true,
                unit: true
            }
        });

        res.status(200).json({data: updatedTenant });
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error updating tenant" });
    }
}