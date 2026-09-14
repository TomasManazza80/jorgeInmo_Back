import { EntitySchema } from 'typeorm';

export const UsdClientSchema = new EntitySchema({
  name: 'UsdClient',
  tableName: 'usd_client',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    createdAt: { name: 'created_at', type: 'timestamptz', createDate: true },
    updatedAt: { name: 'updated_at', type: 'timestamptz', updateDate: true },
    firstName: { name: 'first_name', type: 'varchar', nullable: true },
    lastName: { name: 'last_name', type: 'varchar', nullable: true },
    email: { type: 'varchar', nullable: true },
    phone: { type: 'varchar', nullable: true },
    document: { type: 'varchar', nullable: true },
    notes: { type: 'text', nullable: true },
    balanceUsd: { name: 'balance_usd', type: 'float', default: 0 },
    balanceArs: { name: 'balance_ars', type: 'float', default: 0 },
  },
  relations: {
    usdTransactions: { target: 'UsdTransaction', type: 'one-to-many', inverseSide: 'client' },
  }
});
