import { AppDataSource } from '../database.js';

export const getOffers = async (req, res) => {
  try {
    const offerRepository = AppDataSource.getRepository('Offer');
    const offers = await offerRepository.find({ relations: ['deal'] });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createOffer = async (req, res) => {
  try {
    const offerRepository = AppDataSource.getRepository('Offer');
    const newOffer = offerRepository.create(req.body);
    const savedOffer = await offerRepository.save(newOffer);
    res.status(201).json(savedOffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOfferStatus = async (req, res) => {
  try {
    const offerRepository = AppDataSource.getRepository('Offer');
    const { id } = req.params;
    const { status } = req.body;
    await offerRepository.update(id, { status });
    const updatedOffer = await offerRepository.findOneBy({ id: parseInt(id) });
    res.json(updatedOffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
