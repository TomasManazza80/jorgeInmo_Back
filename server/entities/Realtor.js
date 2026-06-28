import { EntitySchema } from 'typeorm';

export const RealtorSchema = new EntitySchema({
  name: 'Realtor',
  tableName: 'realtor',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    createdAt: { name: 'created_at', type: 'timestamptz', createDate: true },
    updatedAt: { name: 'updated_at', type: 'timestamptz', updateDate: true },
    userId: { name: 'user_id', type: 'int', unique: true },
  },
  relations: {
    user: { target: 'User', type: 'one-to-one', joinColumn: { name: 'user_id' }, onDelete: 'CASCADE' },
    realEstateObjects: { target: 'RealEstateObject', type: 'one-to-many', inverseSide: 'realtor' },
    maintenanceRequests: { target: 'MaintenanceRequest', type: 'one-to-many', inverseSide: 'realtor' },
    leases: { target: 'Lease', type: 'one-to-many', inverseSide: 'realtor' },
    expenses: { target: 'Expense', type: 'one-to-many', inverseSide: 'realtor' },
  }
});
