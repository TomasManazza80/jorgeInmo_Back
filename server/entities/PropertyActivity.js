import { EntitySchema } from 'typeorm';

export const PropertyActivitySchema = new EntitySchema({
    name: 'PropertyActivity',
    tableName: 'property_activities',
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true,
        },
        visitorId: {
            type: 'varchar',
            length: 255,
        },
        realEstateObjectId: {
            type: 'int',
        },
        eventType: {
            type: 'varchar',
            length: 50, // VIEW_PROPERTY, VIEW_PHOTOS, VIEW_MAP, TIME_ON_PAGE_1MIN, TIME_ON_PAGE_3MIN
        },
        scoreAwarded: {
            type: 'int',
            default: 0,
        },
        createdAt: {
            type: 'timestamp',
            createDate: true,
        },
    },
    relations: {
        visitor: {
            target: 'Visitor',
            type: 'many-to-one',
            joinColumn: { name: 'visitorId' },
            onDelete: 'CASCADE',
        },
        realEstateObject: {
            target: 'RealEstateObject',
            type: 'many-to-one',
            joinColumn: { name: 'realEstateObjectId' },
            onDelete: 'CASCADE',
        },
    },
});
