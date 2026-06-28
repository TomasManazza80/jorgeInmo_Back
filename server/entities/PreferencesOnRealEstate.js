import { EntitySchema } from 'typeorm';

export const PreferencesOnRealEstateSchema = new EntitySchema({
  name: 'PreferencesOnRealEstate',
  tableName: 'PreferencesOnRealEstate',
  columns: {
    preferenceId: { primary: true, name: 'preference_id', type: 'int' },
    realEstateObjectId: { primary: true, name: 'real_estate_object_id', type: 'int' },
    assignedAt: { type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' },
    assignedBy: { type: 'varchar' },
  },
  relations: {
    preference: { target: 'Preference', type: 'many-to-one', joinColumn: { name: 'preference_id' }, inverseSide: 'realEstateObjects' },
    realEstateObject: { target: 'RealEstateObject', type: 'many-to-one', joinColumn: { name: 'real_estate_object_id' }, inverseSide: 'preferences' },
  }
});
