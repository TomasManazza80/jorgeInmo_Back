import * as gvamaxService from '../services/gvamaxService.js';

export const getInmuebles = async (req, res) => {
    try {
        const data = await gvamaxService.getInmuebles(req.query);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching inmuebles from GVAmax", error: error.message });
    }
};

export const getTiposInmuebles = async (req, res) => {
    try {
        const data = await gvamaxService.getTiposInmuebles(req.query);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tipos de inmuebles from GVAmax", error: error.message });
    }
};

export const getFullLocation = async (req, res) => {
    try {
        const data = await gvamaxService.getFullLocation(req.query);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching full location from GVAmax", error: error.message });
    }
};

export const getBarrios = async (req, res) => {
    try {
        const data = await gvamaxService.getBarrios(req.query);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching barrios from GVAmax", error: error.message });
    }
};

export const getLocalidades = async (req, res) => {
    try {
        const data = await gvamaxService.getLocalidades(req.query);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching localidades from GVAmax", error: error.message });
    }
};

export const getProvincias = async (req, res) => {
    try {
        const data = await gvamaxService.getProvincias(req.query);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching provincias from GVAmax", error: error.message });
    }
};

export const getZonas = async (req, res) => {
    try {
        const data = await gvamaxService.getZonas(req.query);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching zonas from GVAmax", error: error.message });
    }
};

export const getLimitesZona = async (req, res) => {
    try {
        const data = await gvamaxService.getLimitesZona(req.query);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching limites de zona from GVAmax", error: error.message });
    }
};

export const getEmprendimientos = async (req, res) => {
    try {
        const data = await gvamaxService.getEmprendimientos(req.query);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching emprendimientos from GVAmax", error: error.message });
    }
};

export const getCrmList = async (req, res) => {
    try {
        const data = await gvamaxService.getCrmList(req.query);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching CRM list from GVAmax", error: error.message });
    }
};

export const getCrmUsuarios = async (req, res) => {
    try {
        const data = await gvamaxService.getCrmUsuarios(req.query);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching CRM usuarios from GVAmax", error: error.message });
    }
};

export const getCrmCarpetas = async (req, res) => {
    try {
        const data = await gvamaxService.getCrmCarpetas(req.query);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching CRM carpetas from GVAmax", error: error.message });
    }
};

export const getCrmGrupos = async (req, res) => {
    try {
        const data = await gvamaxService.getCrmGrupos(req.query);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching CRM grupos from GVAmax", error: error.message });
    }
};

export const getCrmCiclos = async (req, res) => {
    try {
        const data = await gvamaxService.getCrmCiclos(req.query);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching CRM ciclos from GVAmax", error: error.message });
    }
};

export const addCrmLead = async (req, res) => {
    try {
        const data = await gvamaxService.addCrmLead(req.query);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Error adding CRM lead to GVAmax", error: error.message });
    }
};
