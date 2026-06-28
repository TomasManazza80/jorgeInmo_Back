import { EntitySchema } from 'typeorm';
import * as enums from './enums.js';

export const MaintenanceRequestSchema = new EntitySchema({
  name: 'MaintenanceRequest',
  tableName: 'maintenance_request',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    createdAt: { name: 'created_at', type: 'timestamptz', createDate: true },
    resolvedAt: { name: 'resolved_at', type: 'timestamptz', nullable: true },
    title: { type: 'varchar' },
    status: { type: 'enum', enum: enums.MaintenanceStatus, nullable: true },
    priority: { type: 'enum', enum: enums.Priority, nullable: true },
    category: { type: 'varchar', nullable: true },
    notes: { type: 'text', nullable: true },
    realtorId: { name: 'realtor_id', type: 'int' },
    reporterId: { name: 'reporter_id', type: 'int', nullable: true },
    unitId: { name: 'unit_id', type: 'int', nullable: true },
  },
  relations: {
    realtor: { target: 'Realtor', type: 'many-to-one', joinColumn: { name: 'realtor_id' }, onDelete: 'CASCADE', inverseSide: 'maintenanceRequests' },
    reporter: { target: 'Tenant', type: 'many-to-one', joinColumn: { name: 'reporter_id' }, inverseSide: 'maintenanceRequests' },
    unit: { target: 'Unit', type: 'many-to-one', joinColumn: { name: 'unit_id' }, inverseSide: 'maintenanceRequests' },
    expenses: { target: 'Expense', type: 'one-to-many', inverseSide: 'maintenanceRequest' },
  }
});
