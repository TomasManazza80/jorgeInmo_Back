import { EntitySchema } from 'typeorm';
import * as enums from './enums.js';

export const ExpenseSchema = new EntitySchema({
  name: 'Expense',
  tableName: 'expense',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    createdAt: { name: 'created_at', type: 'timestamptz', createDate: true },
    updatedAt: { name: 'updated_at', type: 'timestamptz', updateDate: true },
    title: { type: 'varchar', nullable: true },
    description: { type: 'text', nullable: true },
    amount: { type: 'float', nullable: true },
    currency: { type: 'varchar', default: 'USD', nullable: true },
    date: { type: 'timestamp', nullable: true },
    category: { type: 'varchar', nullable: true },
    status: { type: 'varchar', nullable: true },
    notes: { type: 'text', nullable: true },
    realtorId: { name: 'realtor_id', type: 'int' },
    unitId: { name: 'unit_id', type: 'int', nullable: true },
    leaseId: { name: 'lease_id', type: 'int', nullable: true },
    maintenanceRequestId: { name: 'maintenance_request_id', type: 'int', nullable: true },
  },
  relations: {
    realtor: { target: 'Realtor', type: 'many-to-one', joinColumn: { name: 'realtor_id' }, onDelete: 'CASCADE', inverseSide: 'expenses' },
    unit: { target: 'Unit', type: 'many-to-one', joinColumn: { name: 'unit_id' }, inverseSide: 'expenses' },
    lease: { target: 'Lease', type: 'many-to-one', joinColumn: { name: 'lease_id' }, inverseSide: 'expenses' },
    maintenanceRequest: { target: 'MaintenanceRequest', type: 'many-to-one', joinColumn: { name: 'maintenance_request_id' }, inverseSide: 'expenses' },
  }
});
