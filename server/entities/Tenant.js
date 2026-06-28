import { EntitySchema } from 'typeorm';

export const TenantSchema = new EntitySchema({
  name: 'Tenant',
  tableName: 'tenant',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    createdAt: { name: 'created_at', type: 'timestamptz', createDate: true },
    updatedAt: { name: 'updated_at', type: 'timestamptz', updateDate: true },
    userId: { name: 'user_id', type: 'int', unique: true, nullable: true },
    firstName: { name: 'first_name', type: 'varchar', nullable: true },
    lastName: { name: 'last_name', type: 'varchar', nullable: true },
    email: { type: 'varchar', unique: true, nullable: true },
    phone: { type: 'varchar', nullable: true },
  },
  relations: {
    user: { target: 'User', type: 'one-to-one', joinColumn: { name: 'user_id' }, onDelete: 'CASCADE', nullable: true },
    leases: { target: 'Lease', type: 'one-to-many', inverseSide: 'tenant' },
    maintenanceRequests: { target: 'MaintenanceRequest', type: 'one-to-many', inverseSide: 'reporter' },
    rentPayments: { target: 'RentPayment', type: 'one-to-many', inverseSide: 'tenant' },
    units: { target: 'Unit', type: 'one-to-many', inverseSide: 'tenant' },
  }
});
