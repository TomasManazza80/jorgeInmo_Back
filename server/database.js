import { DataSource } from 'typeorm';
import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import { UserSchema } from './entities/User.js';
import { RealtorSchema } from './entities/Realtor.js';
import { TenantSchema } from './entities/Tenant.js';
import { TokenSchema } from './entities/Token.js';
import { RealEstateObjectSchema } from './entities/RealEstateObject.js';
import { UnitSchema } from './entities/Unit.js';
import { AmenitySchema } from './entities/Amenity.js';
import { AmenitiesOnRealEstateSchema } from './entities/AmenitiesOnRealEstate.js';
import { PreferenceSchema } from './entities/Preference.js';
import { PreferencesOnRealEstateSchema } from './entities/PreferencesOnRealEstate.js';
import { LeaseSchema } from './entities/Lease.js';
import { LeasePaymentScheduleSchema } from './entities/LeasePaymentSchedule.js';
import { RentPaymentSchema } from './entities/RentPayment.js';
import { ImageSchema } from './entities/Image.js';
import { DocumentSchema } from './entities/Document.js';
import { MessageSchema } from './entities/Message.js';
import { ExpenseSchema } from './entities/Expense.js';
import { MaintenanceRequestSchema } from './entities/MaintenanceRequest.js';
import { SiteSettingsSchema } from './entities/SiteSettings.js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  synchronize: true, // Use synchronize for development, similar to prisma db push
  logging: false,
  entities: [
    UserSchema,
    RealtorSchema,
    TenantSchema,
    TokenSchema,
    RealEstateObjectSchema,
    UnitSchema,
    AmenitySchema,
    AmenitiesOnRealEstateSchema,
    PreferenceSchema,
    PreferencesOnRealEstateSchema,
    LeaseSchema,
    LeasePaymentScheduleSchema,
    RentPaymentSchema,
    ImageSchema,
    DocumentSchema,
    MessageSchema,
    ExpenseSchema,
    MaintenanceRequestSchema,
    SiteSettingsSchema
  ],
  subscribers: [],
  migrations: [],
});
