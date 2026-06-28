import { AppDataSource } from '../database.js';

async function createPaymentCore(data, user) {
    try {
        const { leaseId, tenantId } = data;
        const paymentData = { ...data };
        const newLeasePaymentSchedule = paymentData.leasePaymentSchedule;
        delete paymentData.leasePaymentSchedule;
        delete paymentData.leaseId;
        delete paymentData.tenantId;

        const leaseRepo = AppDataSource.getRepository('Lease');
        const paymentRepo = AppDataSource.getRepository('RentPayment');
        const scheduleRepo = AppDataSource.getRepository('LeasePaymentSchedule');
        
        const lease = await leaseRepo.findOne({
            where: { id: leaseId },
            relations: { realtor: true }
        });

        let approvalDate = null;
        if (lease && lease.realtor && lease.realtor.userId === user.userId) {
            approvalDate = new Date();
        }

        let newPayment = paymentRepo.create({
            ...paymentData,
            submittedBy: user.userId,
            submissionDate: new Date(),
            approvalDate: approvalDate,
            leaseId: leaseId
        });
        
        await paymentRepo.save(newPayment);

        if (newLeasePaymentSchedule) {
            const paymentSchedule = await scheduleRepo.findOne({
                where: { id: Number(newLeasePaymentSchedule.id) },
                relations: { lease: { realtor: true } }
            });

            if (!paymentSchedule || !paymentSchedule.lease || !paymentSchedule.lease.realtor || paymentSchedule.lease.realtor.userId !== user.userId) {
                return { status: 403, message: "Unauthorized to update payment" };
            }

            await scheduleRepo.update(newLeasePaymentSchedule.id, {
                status: newLeasePaymentSchedule.status,
                amountDue: newLeasePaymentSchedule.amountDue
            });

            if (newPayment) {
                return { status: 200, data: newPayment };
            }
            else {
                return { status: 500, message: "Error creating payment" };
            }
        }

        return { status: 200, data: newPayment };
    }
    catch (error) {
        console.log(error)
        return { status: 500, message: "Error creating payment" };
    }
}

export async function createPayment(req, res) {
    try {
        const newPayment = await createPaymentCore(req.body, req.user);
        res.status(newPayment.status).json(newPayment);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error creating payment" });
    }
}

export async function getPayments(req, res) {
    try {
        const paymentRepo = AppDataSource.getRepository('RentPayment');
        const payments = await paymentRepo.createQueryBuilder('payment')
            .leftJoinAndSelect('payment.lease', 'lease')
            .leftJoinAndSelect('payment.tenant', 'tenant')
            .leftJoin('lease.realtor', 'realtor')
            .where('realtor.userId = :userId', { userId: req.user.userId })
            .getMany();

        res.status(200).json({data: payments });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error getting payments" });
    }
}

export async function updatePayment(req, res) {
    try {
        const { id } = req.params;
        const paymentData = req.body;

        const paymentRepo = AppDataSource.getRepository('RentPayment');
        const payment = await paymentRepo.findOne({
            where: { id: Number(id) },
            relations: { lease: { realtor: true } }
        });

        if (!payment || (Number(payment.submittedBy) !== req.user.userId && (!payment.lease || !payment.lease.realtor || payment.lease.realtor.userId !== req.user.userId))) {
            res.status(403).json({ message: "Unauthorized to update payment" });
            return;
        }

        await paymentRepo.update(Number(id), paymentData);
        const updatedPayment = await paymentRepo.findOne({ where: { id: Number(id) } });

        res.status(200).json({data: updatedPayment });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating payment" });
    }
}

export async function deletePayment(req, res) {
    try {
        const { id } = req.params;

        const paymentRepo = AppDataSource.getRepository('RentPayment');
        const payment = await paymentRepo.findOne({
            where: { id: Number(id) },
            relations: { lease: { realtor: true } }
        });

        if (!payment || (Number(payment.submittedBy) !== req.user.userId && (!payment.lease || !payment.lease.realtor || payment.lease.realtor.userId !== req.user.userId))) {
            res.status(403).json({ message: "Unauthorized to delete payment" });
            return;
        }

        await paymentRepo.delete(Number(id));

        res.status(200).json({ message: "Payment deleted" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error deleting payment" });
    }
}

export async function updatePaymentSchedule(req, res){
    try {
        const { id } = req.params;
        const paymentScheduleData = req.body;

        const scheduleRepo = AppDataSource.getRepository('LeasePaymentSchedule');
        const paymentSchedule = await scheduleRepo.findOne({
            where: { id: Number(id) },
            relations: { lease: { realtor: true } }
        });

        if (!paymentSchedule || !paymentSchedule.lease || !paymentSchedule.lease.realtor || paymentSchedule.lease.realtor.userId !== req.user.userId) {
            res.status(403).json({ message: "Unauthorized to update payment schedule" });
            return;
        }

        await scheduleRepo.update(Number(id), paymentScheduleData);
        const updatedPaymentSchedule = await scheduleRepo.findOne({ where: { id: Number(id) } });

        res.status(200).json({data: updatedPaymentSchedule });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating payment schedule" });
    }
}

export async function deletePaymentSchedule(req, res) {
    try {
        const { id } = req.params;

        const scheduleRepo = AppDataSource.getRepository('LeasePaymentSchedule');
        const paymentSchedule = await scheduleRepo.findOne({
            where: { id: Number(id) },
            relations: { lease: { realtor: true } }
        });

        if (!paymentSchedule || !paymentSchedule.lease || !paymentSchedule.lease.realtor || paymentSchedule.lease.realtor.userId !== req.user.userId) {
            res.status(403).json({ message: "Unauthorized to delete payment schedule" });
            return;
        }

        await scheduleRepo.delete(Number(id));

        res.status(200).json({ message: "Payment Schedule deleted" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error deleting payment schedule" });
    }
}

export async function updateManyPaymentSchedules(req, res) {
    try {
        const updatedPaymentSchedules = [];
        await AppDataSource.transaction(async (manager) => {
            for (const scheduleData of req.body) {
                const id = scheduleData.id;
                delete scheduleData.id;
                await manager.update('LeasePaymentSchedule', id, scheduleData);
                const s = await manager.findOne('LeasePaymentSchedule', { where: { id }});
                updatedPaymentSchedules.push(s);
            }
        });

        res.status(200).json({data: updatedPaymentSchedules });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating payment schedules" });
    }
}

export async function deleteManyPaymentSchedules(req, res) {
    try {
        const deletedPaymentSchedules = [];
        await AppDataSource.transaction(async (manager) => {
            for (const scheduleData of req.body) {
                const s = await manager.findOne('LeasePaymentSchedule', { where: { id: scheduleData.id }});
                if (s) {
                    deletedPaymentSchedules.push(s);
                    await manager.delete('LeasePaymentSchedule', scheduleData.id);
                }
            }
        });

        res.status(200).json({ data: deletedPaymentSchedules });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error deleting payment schedules" });
    }
}

export async function createManyPayments(req, res) {
    let successCount = 0;
    const newPayments =[]

    try {
        for (const payment of req.body) {
            const newPayment = await createPaymentCore(payment, req.user);
            if (newPayment.status === 200) {
                successCount++;
                newPayments.push(newPayment.data);
            }
        }

        res.status(200).json({data: newPayments, message: `${successCount} Payments created successfully`});
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: `${successCount} Payment(s) created successfully, ${req.body.length - successCount} failed.`, data: newPayments });
    }
}

export async function updateManyPayments(req, res) {
    try {
        const updatedPayments = [];
        await AppDataSource.transaction(async (manager) => {
            for (const paymentData of req.body) {
                const id = paymentData.id;
                delete paymentData.id;
                await manager.update('RentPayment', id, paymentData);
                const p = await manager.findOne('RentPayment', { where: { id }});
                updatedPayments.push(p);
            }
        });

        res.status(200).json({data: updatedPayments });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating payments" });
    }
}

export async function deleteManyPayments(req, res) {
    try {
        const deletedPayments = [];
        await AppDataSource.transaction(async (manager) => {
            for (const paymentData of req.body) {
                const p = await manager.findOne('RentPayment', { where: { id: paymentData.id }});
                if (p) {
                    deletedPayments.push(p);
                    await manager.delete('RentPayment', paymentData.id);
                }
            }
        });

        res.status(200).json({ data: deletedPayments });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error deleting payments" });
    }
}