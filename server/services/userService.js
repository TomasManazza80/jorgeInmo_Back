import { AppDataSource } from '../database.js';
import bcrypt from 'bcryptjs';

function getUserRepo() {
    return AppDataSource.getRepository('User');
}

export async function getAllUsers() {
    return getUserRepo().find({
        select: { id: true, email: true, firstName: true, lastName: true, name: true, role: true, status: true, civilStatus: true, occupation: true, income: true, creditScore: true, createdAt: true, updatedAt: true }
    });
}

export async function getUserById(id) {
    return getUserRepo().findOne({
        where: { id },
        select: { id: true, email: true, firstName: true, lastName: true, name: true, role: true, status: true, civilStatus: true, occupation: true, income: true, creditScore: true, createdAt: true, updatedAt: true }
    });
}

export async function createUser(userData) {
    const { email, password, firstName, lastName, role, civilStatus, occupation, income, creditScore } = userData;
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    const name = firstName + ' ' + (lastName || '');

    const userRepo = getUserRepo();

    let newUser = userRepo.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        salt,
        name: name.trim(),
        role: role || 'USER',
        civilStatus,
        occupation,
        income: income ? parseFloat(income) : null,
        creditScore: creditScore ? parseInt(creditScore) : null
    });

    await AppDataSource.transaction(async (transactionalEntityManager) => {
        newUser = await transactionalEntityManager.save('User', newUser);
        
        if (role === 'REALTOR') {
            const realtor = transactionalEntityManager.create('Realtor', { userId: newUser.id });
            await transactionalEntityManager.save('Realtor', realtor);
        } else if (role === 'TENANT') {
            const tenant = transactionalEntityManager.create('Tenant', { userId: newUser.id, email: newUser.email, firstName: newUser.firstName, lastName: newUser.lastName });
            await transactionalEntityManager.save('Tenant', tenant);
        }
    });

    return {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        civilStatus: newUser.civilStatus,
        occupation: newUser.occupation,
        income: newUser.income,
        creditScore: newUser.creditScore
    };
}

export async function updateUserRole(id, role) {
    await getUserRepo().update(id, { role });
    return getUserRepo().findOne({
        where: { id },
        select: { id: true, email: true, role: true }
    });
}

export async function updateUser(id, updateData) {
    delete updateData.password;
    delete updateData.salt;
    delete updateData.role;
    delete updateData.id;
    
    await getUserRepo().update(id, updateData);
    
    return getUserRepo().findOne({
        where: { id },
        select: { id: true, email: true, firstName: true, lastName: true, name: true, role: true, civilStatus: true, occupation: true, income: true, creditScore: true }
    });
}

export async function deleteUser(id) {
    return getUserRepo().delete(id);
}
