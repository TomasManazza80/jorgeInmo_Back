import { AppDataSource } from '../database.js';

export const getDeals = async (req, res) => {
  try {
    const dealRepository = AppDataSource.getRepository('Deal');
    const deals = await dealRepository.find({
      relations: ['realEstateObject', 'buyer', 'seller', 'realtor', 'offers'],
    });
    res.json(deals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createDeal = async (req, res) => {
  try {
    const dealRepository = AppDataSource.getRepository('Deal');
    const newDeal = dealRepository.create(req.body);
    const savedDeal = await dealRepository.save(newDeal);
    res.status(201).json(savedDeal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDealStage = async (req, res) => {
  try {
    const dealRepository = AppDataSource.getRepository('Deal');
    const { id } = req.params;
    const { stage } = req.body;
    await dealRepository.update(id, { stage });
    const updatedDeal = await dealRepository.findOneBy({ id: parseInt(id) });
    res.json(updatedDeal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
