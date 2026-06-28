import { EntitySchema } from 'typeorm';
import * as enums from './enums.js';

export const RentPaymentSchema = new EntitySchema({
  name: 'RentPayment',
  tableName: 'rent_payment',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    createdAt: { name: 'created_at', type: 'timestamptz', createDate: true },
    updatedAt: { name: 'updated_at', type: 'timestamptz', updateDate: true },
    amount: { type: 'float', nullable: true },
    currency: { type: 'varchar', default: 'USD', nullable: true },
    date: { type: 'timestamp', nullable: true },
    status: { type: 'enum', enum: enums.PaymentStatus, nullable: true },
    notes: { type: 'text', nullable: true },
    paymentMethod: { name: 'payment_method', type: 'varchar', nullable: true },
    submittedBy: { name: 'submitted_by', type: 'int' },
    submissionDate: { name: 'submission_date', type: 'timestamp', nullable: true },
    approvalDate: { name: 'approval_date', type: 'timestamp', nullable: true },
    leaseId: { name: 'lease_id', type: 'int', nullable: true },
    tenantId: { name: 'tenant_id', type: 'int', nullable: true },
  },
  relations: {
    lease: { target: 'Lease', type: 'many-to-one', joinColumn: { name: 'lease_id' }, inverseSide: 'rentPayments' },
    tenant: { target: 'Tenant', type: 'many-to-one', joinColumn: { name: 'tenant_id' }, inverseSide: 'rentPayments' },
  }
});
