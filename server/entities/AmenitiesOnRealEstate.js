import { EntitySchema } from 'typeorm';

export const AmenitiesOnRealEstateSchema = new EntitySchema({
  name: 'AmenitiesOnRealEstate',
  tableName: 'AmenitiesOnRealEstate', // prisma uses Capitalized name for relations unless specified
  columns: {
    amenityId: { primary: true, name: 'amenity_id', type: 'int' },
    realEstateObjectId: { primary: true, name: 'real_estate_object_id', type: 'int' },
    assignedAt: { type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' },
    assignedBy: { type: 'varchar' },
    unitId: { name: 'unitId', type: 'int', nullable: true },
  },
  relations: {
    amenity: { target: 'Amenity', type: 'many-to-one', joinColumn: { name: 'amenity_id' }, inverseSide: 'realEstateObjects' },
    realEstateObject: { target: 'RealEstateObject', type: 'many-to-one', joinColumn: { name: 'real_estate_object_id' }, inverseSide: 'amenities' },
    unit: { target: 'Unit', type: 'many-to-one', joinColumn: { name: 'unitId' }, nullable: true },
  }
});
