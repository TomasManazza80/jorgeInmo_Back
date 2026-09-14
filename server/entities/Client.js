import { EntitySchema } from 'typeorm';
import * as enums from './enums.js';

export const ClientSchema = new EntitySchema({
  name: 'Client',
  tableName: 'client',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    createdAt: { name: 'created_at', type: 'timestamptz', createDate: true },
    updatedAt: { name: 'updated_at', type: 'timestamptz', updateDate: true },
    userId: { name: 'user_id', type: 'int', nullable: true },
    firstName: { name: 'first_name', type: 'varchar', nullable: true },
    lastName: { name: 'last_name', type: 'varchar', nullable: true },
    email: { type: 'varchar', nullable: true },
    phone: { type: 'varchar', nullable: true },
    role: { type: 'enum', enum: enums.ClientRole, default: 'BUYER' },
    document: { type: 'varchar', nullable: true },
    notes: { type: 'text', nullable: true },
  },
  relations: {
    user: { target: 'User', type: 'many-to-one', joinColumn: { name: 'user_id' }, onDelete: 'SET NULL', nullable: true },
    dealsAsBuyer: { target: 'Deal', type: 'one-to-many', inverseSide: 'buyer' },
    dealsAsSeller: { target: 'Deal', type: 'one-to-many', inverseSide: 'seller' },
  }
});
