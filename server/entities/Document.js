import { EntitySchema } from 'typeorm';
import * as enums from './enums.js';

export const DocumentSchema = new EntitySchema({
  name: 'Document',
  tableName: 'document',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    documentType: { name: 'document_type', type: 'varchar', nullable: true },
    filePath: { name: 'file_path', type: 'varchar', nullable: true },
    createdAt: { name: 'created_at', type: 'timestamptz', createDate: true },
    updatedAt: { name: 'updated_at', type: 'timestamptz', updateDate: true },
    userId: { name: 'user_id', type: 'int' },
    realEstateObjectId: { name: 'real_estate_object_id', type: 'int', nullable: true },
    leaseId: { name: 'lease_id', type: 'int', nullable: true },
    unitId: { name: 'unit_id', type: 'int', nullable: true },
  },
  relations: {
    user: { target: 'User', type: 'many-to-one', joinColumn: { name: 'user_id' }, onDelete: 'CASCADE', inverseSide: 'documents' },
    realEstateObject: { target: 'RealEstateObject', type: 'many-to-one', joinColumn: { name: 'real_estate_object_id' }, inverseSide: 'documents' },
    lease: { target: 'Lease', type: 'many-to-one', joinColumn: { name: 'lease_id' }, inverseSide: 'documents' },
    unit: { target: 'Unit', type: 'many-to-one', joinColumn: { name: 'unit_id' }, inverseSide: 'documents' },
  }
});
