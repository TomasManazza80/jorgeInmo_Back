import prisma from '../prisma.js';
import { create } from 'xmlbuilder2';

export async function generateZonapropFeed(req, res) {
    try {
        // Fetch properties that are marked for Zonaprop
        const properties = await prisma.realEstateObject.findMany({
            where: {
                zonaprop: true,
            },
            include: {
                units: true,
                images: true,
                realtor: {
                    include: {
                        User: true
                    }
                }
            }
        });

        // Structure required by Zonaprop / RealEstateFacil
        const root = create({ version: '1.0', encoding: 'UTF-8' })
            .ele('Inmuebles');

        for (const prop of properties) {
            const inmueble = root.ele('Inmueble');
            inmueble.ele('Id').txt(prop.id.toString()).up();
            inmueble.ele('Referencia').txt(`REF-${prop.id}`).up();
            inmueble.ele('TipoInmueble').txt(prop.realEstateType || 'Casa').up(); // Mapeo real de tipos requerido
            inmueble.ele('Titulo').txt(prop.title || 'Propiedad').up();
            inmueble.ele('Descripcion').txt(prop.description || '').up();
            
            // Ubicación
            const ubicacion = inmueble.ele('Ubicacion');
            ubicacion.ele('Pais').txt(prop.country || 'Argentina').up();
            ubicacion.ele('Provincia').txt(prop.state || '').up();
            ubicacion.ele('Ciudad').txt(prop.city || '').up();
            ubicacion.ele('Direccion').txt(prop.street || '').up();
            ubicacion.up();

            // Precios
            const precio = inmueble.ele('Precio');
            precio.ele('Moneda').txt(prop.currency || 'USD').up();
            precio.ele('Monto').txt(prop.marketPrice ? prop.marketPrice.toString() : '0').up();
            precio.up();

            // Superficies (tomando de prop o de la primera unidad)
            const unit = prop.units && prop.units.length > 0 ? prop.units[0] : null;
            const superficies = inmueble.ele('Superficies');
            superficies.ele('Cubierta').txt(unit?.unitSize ? unit.unitSize.toString() : '0').up();
            superficies.ele('Total').txt(prop.lotSize ? prop.lotSize.toString() : (unit?.unitSize ? unit.unitSize.toString() : '0')).up();
            superficies.up();

            // Ambientes
            const caracteristicas = inmueble.ele('Caracteristicas');
            caracteristicas.ele('Habitaciones').txt(unit?.numOfBedrooms ? unit.numOfBedrooms.toString() : '0').up();
            caracteristicas.ele('Banos').txt(unit?.numOfBathrooms ? unit.numOfBathrooms.toString() : '0').up();
            caracteristicas.ele('Cocheras').txt(unit?.garages ? unit.garages.toString() : '0').up();
            caracteristicas.up();

            // Imágenes
            if (prop.images && prop.images.length > 0) {
                const multimedia = inmueble.ele('Multimedia');
                for (const img of prop.images) {
                    multimedia.ele('Imagen').ele('Url').txt(img.imageUrl).up().up();
                }
                multimedia.up();
            }

            // Anunciante
            const anunciante = inmueble.ele('Anunciante');
            anunciante.ele('Nombre').txt(prop.realtor?.User?.firstName + ' ' + prop.realtor?.User?.lastName).up();
            anunciante.ele('Email').txt(prop.realtor?.User?.email || '').up();
            anunciante.up();

            inmueble.up();
        }

        const xmlString = root.end({ prettyPrint: true });

        res.header('Content-Type', 'application/xml');
        res.status(200).send(xmlString);
    } catch (error) {
        console.error("Error generando Feed de Zonaprop", error);
        res.status(500).json({ message: "Error interno generando feed" });
    }
}
