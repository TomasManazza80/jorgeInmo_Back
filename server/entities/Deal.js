import { EntitySchema } from 'typeorm';
import * as enums from './enums.js';

export const DealSchema = new EntitySchema({
  name: 'Deal',
  tableName: 'deal',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    createdAt: { name: 'created_at', type: 'timestamptz', createDate: true },
    updatedAt: { name: 'updated_at', type: 'timestamptz', updateDate: true },
    realEstateObjectId: { name: 'real_estate_object_id', type: 'int' },
    buyerId: { name: 'buyer_id', type: 'int', nullable: true },
    sellerId: { name: 'seller_id', type: 'int', nullable: true },
    realtorId: { name: 'realtor_id', type: 'int', nullable: true },
    agreedPrice: { name: 'agreed_price', type: 'float', nullable: true },
    commissionBuyer: { name: 'commission_buyer', type: 'float', nullable: true },
    commissionSeller: { name: 'commission_seller', type: 'float', nullable: true },
    stage: { type: 'enum', enum: enums.DealStage, default: 'LEAD' },
  },
  relations: {
    realEstateObject: { target: 'RealEstateObject', type: 'many-to-one', joinColumn: { name: 'real_estate_object_id' }, inverseSide: 'deals', onDelete: 'CASCADE' },
    buyer: { target: 'Client', type: 'many-to-one', joinColumn: { name: 'buyer_id' }, inverseSide: 'dealsAsBuyer', nullable: true },
    seller: { target: 'Client', type: 'many-to-one', joinColumn: { name: 'seller_id' }, inverseSide: 'dealsAsSeller', nullable: true },
    realtor: { target: 'User', type: 'many-to-one', joinColumn: { name: 'realtor_id' }, nullable: true },
    offers: { target: 'Offer', type: 'one-to-many', inverseSide: 'deal' },
  }
});
