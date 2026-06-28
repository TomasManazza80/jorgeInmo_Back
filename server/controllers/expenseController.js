import { AppDataSource } from '../database.js';

export async function createExpense(req, res) {
    try {
        const userId = req.user.userId;
        const {unitId, leaseId, maintenanceRequestId} = req.body;
        delete req.body.unitId;
        delete req.body.leaseId;
        delete req.body.maintenanceRequestId;

        const unitRepo = AppDataSource.getRepository('Unit');
        const leaseRepo = AppDataSource.getRepository('Lease');
        const maintenanceRepo = AppDataSource.getRepository('MaintenanceRequest');
        const realtorRepo = AppDataSource.getRepository('Realtor');
        const expenseRepo = AppDataSource.getRepository('Expense');

        const realtor = await realtorRepo.findOne({ where: { userId } });
        if (!realtor) return res.status(400).json({ message: "Realtor not found" });

        if (unitId) {
            const unit = await unitRepo.createQueryBuilder('unit')
                .leftJoin('unit.realEstateObject', 'realEstateObject')
                .leftJoin('realEstateObject.realtor', 'realtor')
                .where('unit.id = :id', { id: unitId })
                .andWhere('realtor.userId = :userId', { userId })
                .getOne();
            if (!unit) {
                return res.status(400).json({ message: "Unit not found" });
            }
        }
        if (leaseId) {
            const lease = await leaseRepo.findOne({
                where: { id: leaseId, realtorId: realtor.id }
            });
            if (!lease) {
                return res.status(400).json({ message: "Lease not found" });
            }
        }

        if (maintenanceRequestId) {
            const maintenanceRequest = await maintenanceRepo.findOne({
                where: { id: maintenanceRequestId, realtorId: realtor.id }
            });
            if (!maintenanceRequest) {
                return res.status(400).json({ message: "Maintenance request not found" });
            }
        }

        const newExpense = expenseRepo.create({
            ...req.body,
            realtorId: realtor.id,
            unitId: unitId || null,
            leaseId: leaseId || null,
            maintenanceRequestId: maintenanceRequestId || null
        });

        await expenseRepo.save(newExpense);

        res.status(200).json({data: newExpense });
    }
    catch (e) {
        console.log(e)
        res.status(500).json({ message: "Error creating expense" });
    }
}


export async function getExpenses(req, res){
    try {
        const userId = req.user.userId;
        const expenseRepo = AppDataSource.getRepository('Expense');
        const expenses = await expenseRepo.createQueryBuilder('expense')
            .leftJoin('expense.realtor', 'realtor')
            .where('realtor.userId = :userId', { userId })
            .getMany();

        res.status(200).json({data: expenses });
    }
    catch (e) {
        res.status(500).json({ message: "Error getting expenses" });
    }
}

export async function deleteExpense(req, res){
    try {
        const userId = req.user.userId;
        const expenseId = Number(req.params.id);
        
        const expenseRepo = AppDataSource.getRepository('Expense');
        const expense = await expenseRepo.createQueryBuilder('expense')
            .leftJoin('expense.realtor', 'realtor')
            .where('expense.id = :id', { id: expenseId })
            .andWhere('realtor.userId = :userId', { userId })
            .getOne();

        if (!expense) {
            return res.status(400).json({ message: "Expense not found" });
        }

        await expenseRepo.delete(expenseId);

        res.status(200).json({data: expense });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ message: "Error deleting expense" });
    }
}
