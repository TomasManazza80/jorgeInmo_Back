import { EntitySchema } from 'typeorm';

export const SiteSettingsSchema = new EntitySchema({
  name: 'SiteSettings',
  tableName: 'site_settings',
  columns: {
    id: { primary: true, type: 'int', default: 1 },
    heroTitle: { type: 'varchar', nullable: true },
    heroSubtitle: { type: 'varchar', nullable: true },
    heroHighlight: { type: 'varchar', nullable: true },
    heroImageUrl: { type: 'varchar', nullable: true },
    heroRatingText: { type: 'varchar', nullable: true },
    heroRatingStars: { type: 'float', nullable: true },
    heroSlides: { type: 'json', nullable: true },
    heroOverlayOpacity: { type: 'int', default: 50, nullable: true },
  }
});
