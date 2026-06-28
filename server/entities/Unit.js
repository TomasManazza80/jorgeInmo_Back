import { EntitySchema } from 'typeorm';
import * as enums from './enums.js';

export const UnitSchema = new EntitySchema({
  name: 'Unit',
  tableName: 'unit',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    createdAt: { name: 'created_at', type: 'timestamptz', createDate: true },
    updatedAt: { name: 'updated_at', type: 'timestamptz', updateDate: true },
    unitIdentifier: { name: 'unit_identifier', type: 'varchar', nullable: true },
    unitNumber: { name: 'unit_number', type: 'varchar', nullable: true },
    floor: { type: 'int', nullable: true },
    unitSize: { name: 'unit_size', type: 'float', nullable: true },
    numOfFloors: { name: 'num_of_floors', type: 'int', nullable: true },
    numOfRooms: { name: 'num_of_rooms', type: 'int', nullable: true },
    numOfBedrooms: { name: 'num_of_bedrooms', type: 'int', nullable: true },
    numOfBathrooms: { name: 'num_of_bathrooms', type: 'int', nullable: true },
    garages: { type: 'int', nullable: true },
    rentalPrice: { name: 'rental_price', type: 'float', nullable: true },
    currency: { type: 'varchar', default: 'USD', nullable: true },
    status: { type: 'enum', enum: enums.ListingStatus, default: 'ACTIVE', nullable: true },
    realEstateObjectId: { name: 'real_estate_object_id', type: 'int' },
    tenantId: { name: 'tenant_id', type: 'int', nullable: true },
  },
  relations: {
    amenities: { target: 'AmenitiesOnRealEstate', type: 'one-to-many', inverseSide: 'unit' },
    documents: { target: 'Document', type: 'one-to-many', inverseSide: 'unit' },
    images: { target: 'Image', type: 'one-to-many', inverseSide: 'unit' },
    maintenanceRequests: { target: 'MaintenanceRequest', type: 'one-to-many', inverseSide: 'unit' },
    realEstateObject: { target: 'RealEstateObject', type: 'many-to-one', joinColumn: { name: 'real_estate_object_id' }, onDelete: 'CASCADE', inverseSide: 'units' },
    tenant: { target: 'Tenant', type: 'many-to-one', joinColumn: { name: 'tenant_id' }, inverseSide: 'units' },
    leases: { target: 'Lease', type: 'one-to-many', inverseSide: 'unit' },
    expenses: { target: 'Expense', type: 'one-to-many', inverseSide: 'unit' },
  }
});
