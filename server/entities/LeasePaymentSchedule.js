import { EntitySchema } from 'typeorm';
import * as enums from './enums.js';

export const LeasePaymentScheduleSchema = new EntitySchema({
  name: 'LeasePaymentSchedule',
  tableName: 'lease_payment_schedules',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    createdAt: { name: 'created_at', type: 'timestamptz', createDate: true },
    dueDate: { type: 'timestamp' },
    amountDue: { type: 'float' },
    status: { type: 'enum', enum: enums.PaymentScheduleStatus, default: 'SCHEDULED' },
    leaseId: { name: 'lease_id', type: 'int' },
  },
  relations: {
    lease: { target: 'Lease', type: 'many-to-one', joinColumn: { name: 'lease_id' }, onDelete: 'CASCADE', inverseSide: 'paymentSchedule' },
  }
});
