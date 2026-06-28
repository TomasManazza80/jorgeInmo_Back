import { EntitySchema } from 'typeorm';

export const ImageSchema = new EntitySchema({
  name: 'Image',
  tableName: 'Image',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    imageUrl: { type: 'varchar', nullable: true },
    fileId: { type: 'varchar', nullable: true },
    createdAt: { name: 'createdAt', type: 'timestamp', createDate: true },
    realEstateObjectId: { name: 'real_estate_object_id', type: 'int', nullable: true },
    unitId: { name: 'unit_id', type: 'int', nullable: true },
    userId: { name: 'user_id', type: 'int' },
  },
  relations: {
    realEstateObject: { target: 'RealEstateObject', type: 'many-to-one', joinColumn: { name: 'real_estate_object_id' }, inverseSide: 'images' },
    unit: { target: 'Unit', type: 'many-to-one', joinColumn: { name: 'unit_id' }, onDelete: 'CASCADE', inverseSide: 'images' },
    user: { target: 'User', type: 'many-to-one', joinColumn: { name: 'user_id' }, onDelete: 'CASCADE', inverseSide: 'images' },
  }
});
