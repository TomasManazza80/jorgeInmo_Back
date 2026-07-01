import { AppDataSource } from '../database.js';

// Get settings
export const getHeroSettings = async (req, res) => {
    try {
        const settingsRepo = AppDataSource.getRepository('SiteSettings');
        let settings = await settingsRepo.findOne({
            where: { id: 1 }
        });
        
        if (!settings) {
            settings = settingsRepo.create({
                id: 1,
                heroTitle: "Excelencia y Confianza en el Mercado Inmobiliario Santafesino",
                heroSubtitle: "Asesoramiento personalizado con más de 30 años de experiencia.",
                heroHighlight: "Atendido por sus propios dueños.",
                heroImageUrl: "/images/hero-property.jpg",
                heroRatingText: "Altamente Recomendado - 3.9 / 28 Opiniones",
                heroRatingStars: 4
            });
            try {
                await settingsRepo.save(settings);
            } catch (e) {
                if (e.code === '23505') {
                    settings = await settingsRepo.findOne({ where: { id: 1 } });
                } else {
                    throw e;
                }
            }
        }
        
        return res.status(200).json({ success: true, data: settings });
    } catch (error) {
        console.error("Error fetching hero settings:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const updateHeroSettings = async (req, res) => {
    try {
        const { heroTitle, heroSubtitle, heroHighlight, heroImageUrl, heroRatingText, heroRatingStars, heroSlides, heroOverlayOpacity } = req.body;
        
        // Convert old single fields to a slide if slides are empty
        const defaultSlides = heroSlides && heroSlides.length > 0 ? heroSlides : [
            {
                id: Date.now().toString(),
                imageUrl: heroImageUrl || "/images/hero-property.jpg",
                title: heroTitle || "Excelencia y Confianza en el Mercado Inmobiliario Santafesino",
                subtitle: heroSubtitle || "Asesoramiento personalizado con más de 30 años de experiencia.",
                highlight: heroHighlight || "Atendido por sus propios dueños."
            }
        ];

        const parsedOpacity = heroOverlayOpacity !== undefined ? parseInt(heroOverlayOpacity, 10) : 50;
        const parsedStars = heroRatingStars ? parseFloat(heroRatingStars) : 4;

        const settingsRepo = AppDataSource.getRepository('SiteSettings');
        let settings = await settingsRepo.findOne({ where: { id: 1 } });

        if (settings) {
            settings.heroTitle = heroTitle;
            settings.heroSubtitle = heroSubtitle;
            settings.heroHighlight = heroHighlight;
            settings.heroImageUrl = heroImageUrl;
            settings.heroRatingText = heroRatingText;
            settings.heroRatingStars = parsedStars;
            settings.heroSlides = defaultSlides;
            settings.heroOverlayOpacity = parsedOpacity;
            await settingsRepo.save(settings);
        } else {
            settings = settingsRepo.create({
                id: 1,
                heroTitle: heroTitle || "Excelencia y Confianza en el Mercado Inmobiliario Santafesino",
                heroSubtitle: heroSubtitle || "Asesoramiento personalizado con más de 30 años de experiencia.",
                heroHighlight: heroHighlight || "Atendido por sus propios dueños.",
                heroImageUrl: heroImageUrl || "/images/hero-property.jpg",
                heroRatingText: heroRatingText || "Altamente Recomendado - 3.9 / 28 Opiniones",
                heroRatingStars: parsedStars,
                heroSlides: defaultSlides,
                heroOverlayOpacity: parsedOpacity
            });
            await settingsRepo.save(settings);
        }
        
        return res.status(200).json({ success: true, data: settings });
    } catch (error) {
        console.error("Error updating hero settings:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};
