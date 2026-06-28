import { create } from 'xmlbuilder2';
import { AppDataSource } from '../database.js';

// Mapeo numérico de exposición exigido por convenios de Zonaprop
const EXPOSURE_MAPPING = {
  SIMPLE: 1,
  DESTACADO: 2,
  SUPER_DESTACADO: 3
};

export const generateZonapropFeed = async (req, res) => {
  try {
    const propertyRepo = AppDataSource.getRepository('RealEstateObject');
    const propiedades = await propertyRepo.find({
      where: { zonaprop_enabled: true },
      relations: { units: true }
    });

    // Raíz rígida del documento XML
    const root = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('Inmuebles');

    propiedades.forEach((prop) => {
      const aviso = root.ele('Aviso');
      const unit = prop.units?.[0] || {};
      
      aviso.ele('idAviso').txt(prop.id.toString());
      aviso.ele('idInmobiliaria').txt(process.env.ZONAPROP_CLIENT_ID || '12345');
      aviso.ele('tipoAviso').txt(EXPOSURE_MAPPING[prop.zonaprop_exposure || 'SIMPLE'].toString());
      
      // Mapeo de Ubicación Geográfica Obligatoria por ID
      aviso.ele('idUbicacion').txt(prop.zonaprop_geo_id ? prop.zonaprop_geo_id.toString() : "0"); 
      
      // Asumiendo 1 para Venta y 2 para Alquiler como en Argenprop
      aviso.ele('tipoOperacion').txt('1'); 
      aviso.ele('tipoPropiedad').txt(prop.realEstateType === 'APARTMENT' ? '1' : '2');
      
      const precioNode = aviso.ele('Precio');
      precioNode.ele('moneda').txt(prop.currency === 'USD' ? '1' : '2');
      precioNode.ele('monto').txt((prop.marketPrice || 0).toString());

      aviso.ele('titulo').txt(prop.title || 'Sin Título');
      aviso.ele('descripcion').txt(prop.description || '');
      
      const caracteristicas = aviso.ele('Caracteristicas');
      caracteristicas.ele('superficieTotal').txt((prop.lotSize || 0).toString());
      caracteristicas.ele('superficieCubierta').txt((unit.unitSize || 0).toString());
      caracteristicas.ele('ambientes').txt((unit.numOfRooms || 0).toString());
      caracteristicas.ele('banos').txt((unit.numOfBathrooms || 0).toString());
    });

    const xml = root.end({ prettyPrint: true });
    
    res.header('Content-Type', 'application/xml');
    return res.status(200).send(xml);
  } catch (error) {
    console.error("Error generando el feed XML de Zonaprop:", error);
    return res.status(500).send("<error>Internal Server Error</error>");
  }
};
