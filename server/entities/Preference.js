import { EntitySchema } from 'typeorm';

export const PreferenceSchema = new EntitySchema({
  name: 'Preference',
  tableName: 'preference',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    name: { type: 'varchar', unique: true },
    enabled: { type: 'boolean', nullable: true },
  },
  relations: {
    realEstateObjects: { target: 'PreferencesOnRealEstate', type: 'one-to-many', inverseSide: 'preference' },
  }
});
