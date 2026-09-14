import { EntitySchema } from 'typeorm';
import * as enums from './enums.js';

export const OfferSchema = new EntitySchema({
  name: 'Offer',
  tableName: 'offer',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    createdAt: { name: 'created_at', type: 'timestamptz', createDate: true },
    updatedAt: { name: 'updated_at', type: 'timestamptz', updateDate: true },
    dealId: { name: 'deal_id', type: 'int' },
    amount: { type: 'float', nullable: true },
    paymentMethod: { name: 'payment_method', type: 'enum', enum: enums.PaymentMethod, default: 'CASH' },
    status: { type: 'enum', enum: enums.OfferStatus, default: 'PENDING' },
    notes: { type: 'text', nullable: true },
  },
  relations: {
    deal: { target: 'Deal', type: 'many-to-one', joinColumn: { name: 'deal_id' }, inverseSide: 'offers', onDelete: 'CASCADE' },
  }
});
