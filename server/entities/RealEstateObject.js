import { EntitySchema } from 'typeorm';
import * as enums from './enums.js';

export const RealEstateObjectSchema = new EntitySchema({
  name: 'RealEstateObject',
  tableName: 'real_estate_object',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    createdAt: { name: 'created_at', type: 'timestamptz', createDate: true },
    updatedAt: { name: 'updated_at', type: 'timestamptz', updateDate: true },
    title: { type: 'varchar', nullable: true },
    description: { type: 'text', nullable: true },
    lotSize: { name: 'lot_size', type: 'float', nullable: true },
    yearBuilt: { name: 'year_built', type: 'int', nullable: true },
    realEstateType: { name: 'real_estate_type', type: 'enum', enum: enums.RealEstateType, nullable: true },
    marketPrice: { name: 'market_price', type: 'float', nullable: true },
    currency: { type: 'varchar', default: 'USD', nullable: true },
    tour_3d_url: { type: 'varchar', nullable: true },
    metareal_url: { type: 'varchar', nullable: true },
    zonaprop_enabled: { type: 'boolean', default: false },
    zonaprop_exposure: { type: 'enum', enum: enums.ZonapropExposure, default: 'SIMPLE' },
    zonaprop_geo_id: { type: 'int', nullable: true },
    argenprop_enabled: { type: 'boolean', default: false },
    argenprop_id: { type: 'varchar', nullable: true },
    gvamax_sync_status: { type: 'enum', enum: enums.SyncStatus, default: 'PENDING' },
    gvamax_sync_error: { type: 'varchar', nullable: true },
    street: { type: 'varchar', nullable: true },
    city: { type: 'varchar', nullable: true },
    state: { type: 'varchar', nullable: true },
    zip: { type: 'varchar', nullable: true },
    country: { type: 'varchar', nullable: true },
    realtorId: { name: 'realtor_id', type: 'int' },
  },
  relations: {
    images: { target: 'Image', type: 'one-to-many', inverseSide: 'realEstateObject' },
    amenities: { target: 'AmenitiesOnRealEstate', type: 'one-to-many', inverseSide: 'realEstateObject' },
    preferences: { target: 'PreferencesOnRealEstate', type: 'one-to-many', inverseSide: 'realEstateObject' },
    documents: { target: 'Document', type: 'one-to-many', inverseSide: 'realEstateObject' },
    realtor: { target: 'Realtor', type: 'many-to-one', joinColumn: { name: 'realtor_id' }, onDelete: 'CASCADE', inverseSide: 'realEstateObjects' },
    units: { target: 'Unit', type: 'one-to-many', inverseSide: 'realEstateObject' },
  }
});
