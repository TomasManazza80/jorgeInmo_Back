import { EntitySchema } from 'typeorm';
import * as enums from './enums.js';

export const LeaseSchema = new EntitySchema({
  name: 'Lease',
  tableName: 'lease',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    createdAt: { name: 'created_at', type: 'timestamptz', createDate: true },
    updatedAt: { name: 'updated_at', type: 'timestamptz', updateDate: true },
    startDate: { name: 'start_date', type: 'timestamp', nullable: true },
    endDate: { name: 'end_date', type: 'timestamp', nullable: true },
    rentalPrice: { name: 'rental_price', type: 'float', nullable: true },
    status: { type: 'enum', enum: enums.LeaseStatus, default: 'ACTIVE', nullable: true },
    paymentFrequency: { name: 'payment_frequency', type: 'enum', enum: enums.PaymentFrequency, nullable: true },
    notes: { type: 'text', nullable: true },
    specialTerms: { name: 'special_terms', type: 'text', nullable: true },
    currency: { type: 'varchar', default: 'USD', nullable: true },
    totalRentDue: { name: 'total_rent_due', type: 'float', nullable: true },
    rentPaid: { name: 'rent_paid', type: 'float', nullable: true },
    tenantId: { name: 'tenant_id', type: 'int', nullable: true },
    unitId: { name: 'unit_id', type: 'int', nullable: true },
    realtorId: { name: 'realtor_id', type: 'int', nullable: true },
  },
  relations: {
    documents: { target: 'Document', type: 'one-to-many', inverseSide: 'lease' },
    tenant: { target: 'Tenant', type: 'many-to-one', joinColumn: { name: 'tenant_id' }, inverseSide: 'leases' },
    unit: { target: 'Unit', type: 'many-to-one', joinColumn: { name: 'unit_id' }, onDelete: 'CASCADE', inverseSide: 'leases' },
    realtor: { target: 'Realtor', type: 'many-to-one', joinColumn: { name: 'realtor_id' }, onDelete: 'CASCADE', inverseSide: 'leases' },
    expenses: { target: 'Expense', type: 'one-to-many', inverseSide: 'lease' },
    rentPayments: { target: 'RentPayment', type: 'one-to-many', inverseSide: 'lease' },
    paymentSchedule: { target: 'LeasePaymentSchedule', type: 'one-to-many', inverseSide: 'lease' },
  }
});
