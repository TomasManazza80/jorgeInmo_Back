import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Get settings
export const getHeroSettings = async (req, res) => {
    try {
        let settings = await prisma.siteSettings.findUnique({
            where: { id: 1 }
        });
        
        if (!settings) {
            settings = await prisma.siteSettings.create({
                data: {
                    id: 1,
                    heroTitle: "Excelencia y Confianza en el Mercado Inmobiliario Santafesino",
                    heroSubtitle: "Asesoramiento personalizado con más de 30 años de experiencia.",
                    heroHighlight: "Atendido por sus propios dueños.",
                    heroImageUrl: "/images/hero-property.jpg",
                    heroRatingText: "Altamente Recomendado - 3.9 / 28 Opiniones",
                    heroRatingStars: 4
                }
            });
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

        const settings = await prisma.siteSettings.upsert({
            where: { id: 1 },
            update: {
                heroTitle,
                heroSubtitle,
                heroHighlight,
                heroImageUrl,
                heroRatingText,
                heroRatingStars: heroRatingStars ? parseFloat(heroRatingStars) : 4,
                heroSlides: defaultSlides,
                heroOverlayOpacity: parsedOpacity
            },
            create: {
                id: 1,
                heroTitle: heroTitle || "Excelencia y Confianza en el Mercado Inmobiliario Santafesino",
                heroSubtitle: heroSubtitle || "Asesoramiento personalizado con más de 30 años de experiencia.",
                heroHighlight: heroHighlight || "Atendido por sus propios dueños.",
                heroImageUrl: heroImageUrl || "/images/hero-property.jpg",
                heroRatingText: heroRatingText || "Altamente Recomendado - 3.9 / 28 Opiniones",
                heroRatingStars: heroRatingStars ? parseFloat(heroRatingStars) : 4,
                heroSlides: defaultSlides,
                heroOverlayOpacity: parsedOpacity
            }
        });
        
        return res.status(200).json({ success: true, data: settings });
    } catch (error) {
        console.error("Error updating hero settings:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};
