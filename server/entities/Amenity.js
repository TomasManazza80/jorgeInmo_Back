import { EntitySchema } from 'typeorm';
import * as enums from './enums.js';

export const AmenitySchema = new EntitySchema({
  name: 'Amenity',
  tableName: 'amenity',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    createdAt: { name: 'created_at', type: 'timestamp', createDate: true },
    updatedAt: { name: 'updated_at', type: 'timestamp', updateDate: true },
    name: { type: 'varchar', unique: true },
    description: { type: 'text', nullable: true },
    category: { type: 'enum', enum: enums.AmenityCategory, nullable: true },
  },
  relations: {
    realEstateObjects: { target: 'AmenitiesOnRealEstate', type: 'one-to-many', inverseSide: 'amenity' },
  }
});
