import { EntitySchema } from 'typeorm';
import * as enums from './enums.js';

export const UsdTransactionSchema = new EntitySchema({
  name: 'UsdTransaction',
  tableName: 'usd_transaction',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    createdAt: { name: 'created_at', type: 'timestamptz', createDate: true },
    updatedAt: { name: 'updated_at', type: 'timestamptz', updateDate: true },
    clientId: { name: 'client_id', type: 'int' },
    type: { type: 'enum', enum: enums.UsdTransactionType },
    amountUsd: { name: 'amount_usd', type: 'float', default: 0 },
    exchangeRate: { name: 'exchange_rate', type: 'float', default: 1 },
    amountLocal: { name: 'amount_local', type: 'float', default: 0 },
    status: { type: 'enum', enum: enums.UsdTransactionStatus, default: 'COMPLETED' },
    notes: { type: 'text', nullable: true },
  },
  relations: {
    client: { target: 'UsdClient', type: 'many-to-one', joinColumn: { name: 'client_id' }, inverseSide: 'usdTransactions', onDelete: 'CASCADE' },
  }
});
