import { EntitySchema } from 'typeorm';

export const VisitorSchema = new EntitySchema({
    name: 'Visitor',
    tableName: 'visitors',
    columns: {
        id: {
            primary: true,
            type: 'varchar',
            length: 255, // UUID or custom identifier from frontend
        },
        userId: {
            type: 'int',
            nullable: true,
        },
        name: {
            type: 'varchar',
            nullable: true,
        },
        email: {
            type: 'varchar',
            nullable: true,
        },
        phone: {
            type: 'varchar',
            nullable: true,
        },
        totalScore: {
            type: 'int',
            default: 0,
        },
        createdAt: {
            type: 'timestamp',
            createDate: true,
        },
        updatedAt: {
            type: 'timestamp',
            updateDate: true,
        },
    },
    relations: {
        user: {
            target: 'User',
            type: 'many-to-one',
            joinColumn: { name: 'userId' },
            nullable: true,
        },
        activities: {
            target: 'PropertyActivity',
            type: 'one-to-many',
            inverseSide: 'visitor',
        },
    },
});
