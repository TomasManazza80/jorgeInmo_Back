import prisma from '../prisma.js';
import bcrypt from 'bcryptjs';

export async function getAllUsers() {
    return prisma.user.findMany({
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            name: true,
            role: true,
            status: true,
            civilStatus: true,
            occupation: true,
            income: true,
            creditScore: true,
            createdAt: true,
            updatedAt: true,
        }
    });
}

export async function getUserById(id) {
    return prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            name: true,
            role: true,
            status: true,
            civilStatus: true,
            occupation: true,
            income: true,
            creditScore: true,
            createdAt: true,
            updatedAt: true,
        }
    });
}

export async function createUser(userData) {
    const { email, password, firstName, lastName, role, civilStatus, occupation, income, creditScore } = userData;
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    const name = firstName + ' ' + (lastName || '');

    const data = {
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
    };

    if (role === 'REALTOR') {
        data.realtor = { create: {} };
    } else if (role === 'TENANT') {
        data.tenant = { create: {} };
    }

    return prisma.user.create({
        data,
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            civilStatus: true,
            occupation: true,
            income: true,
            creditScore: true,
        }
    });
}

export async function updateUserRole(id, role) {
    return prisma.user.update({
        where: { id },
        data: { role },
        select: {
            id: true,
            email: true,
            role: true,
        }
    });
}

export async function updateUser(id, updateData) {
    // Exclude sensitive fields from being updated directly here if needed
    delete updateData.password;
    delete updateData.salt;
    delete updateData.role; // Role should be updated via updateUserRole
    delete updateData.id;
    
    return prisma.user.update({
        where: { id },
        data: updateData,
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            name: true,
            role: true,
            civilStatus: true,
            occupation: true,
            income: true,
            creditScore: true,
        }
    });
}

export async function deleteUser(id) {
    return prisma.user.delete({
        where: { id },
    });
}
