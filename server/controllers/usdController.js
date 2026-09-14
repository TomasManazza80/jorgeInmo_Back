import { AppDataSource } from '../database.js';
import { MoreThanOrEqual, Between } from 'typeorm';

const getStartDate = (timeRange) => {
  const now = new Date();
  if (timeRange === 'day') {
    now.setHours(0, 0, 0, 0);
    return now;
  }
  if (timeRange === 'week') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    now.setDate(diff);
    now.setHours(0, 0, 0, 0);
    return now;
  }
  if (timeRange === 'month') {
    now.setDate(1);
    now.setHours(0, 0, 0, 0);
    return now;
  }
  return null; // 'all' or undefined
};

export const getClients = async (req, res) => {
  try {
    const clientRepo = AppDataSource.getRepository('UsdClient');
    const clients = await clientRepo.find({ relations: { usdTransactions: true } });
    res.json({ status: 'success', data: clients });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createClient = async (req, res) => {
  try {
    const clientRepo = AppDataSource.getRepository('UsdClient');
    const newClient = clientRepo.create(req.body);
    const savedClient = await clientRepo.save(newClient);
    res.status(201).json({ status: 'success', data: savedClient });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createTransaction = async (req, res) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const { clientId, type, amountUsd, exchangeRate, amountLocal, notes } = req.body;
    
    const clientRepo = queryRunner.manager.getRepository('UsdClient');
    const txRepo = queryRunner.manager.getRepository('UsdTransaction');

    const client = await clientRepo.findOne({ where: { id: clientId } });
    if (!client) throw new Error("Client not found");

    const newTx = txRepo.create({
      clientId,
      type,
      amountUsd: amountUsd || 0,
      exchangeRate: exchangeRate || 1,
      amountLocal: amountLocal || 0,
      notes
    });

    if (type === 'INGRESO_ARS') {
      client.balanceArs += parseFloat(amountLocal || 0);
    } else if (type === 'EGRESO_ARS') {
      client.balanceArs -= parseFloat(amountLocal || 0);
    } else if (type === 'COMPRA_USD') {
      client.balanceUsd += parseFloat(amountUsd || 0);
      client.balanceArs -= parseFloat(amountLocal || 0);
    } else if (type === 'VENTA_USD') {
      client.balanceUsd -= parseFloat(amountUsd || 0);
      client.balanceArs += parseFloat(amountLocal || 0);
    }

    await clientRepo.save(client);
    const savedTx = await txRepo.save(newTx);

    await queryRunner.commitTransaction();
    res.status(201).json({ status: 'success', data: savedTx });
  } catch (error) {
    await queryRunner.rollbackTransaction();
    res.status(500).json({ status: 'error', message: error.message });
  } finally {
    await queryRunner.release();
  }
};

export const getTransactions = async (req, res) => {
  try {
    const { timeRange, startDate, endDate } = req.query;
    const txRepo = AppDataSource.getRepository('UsdTransaction');
    
    const whereClause = {};
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      whereClause.createdAt = Between(start, end);
    } else {
      const calculatedStartDate = getStartDate(timeRange);
      if (calculatedStartDate) {
        whereClause.createdAt = MoreThanOrEqual(calculatedStartDate);
      }
    }

    const txs = await txRepo.find({ 
      where: whereClause,
      relations: { client: true }, 
      order: { createdAt: 'DESC' } 
    });
    res.json({ status: 'success', data: txs });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getMetrics = async (req, res) => {
  try {
    const { timeRange } = req.query;
    const txRepo = AppDataSource.getRepository('UsdTransaction');
    
    const whereClause = {};
    const startDate = getStartDate(timeRange);
    if (startDate) {
      whereClause.createdAt = MoreThanOrEqual(startDate);
    }

    const txs = await txRepo.find({ where: whereClause });
    
    let totalUsdVolume = 0;
    let totalArsVolume = 0;
    let comprasUsd = 0;
    let ventasUsd = 0;

    txs.forEach(tx => {
      if (tx.type === 'COMPRA_USD' || tx.type === 'VENTA_USD') {
        totalUsdVolume += tx.amountUsd;
      }
      totalArsVolume += tx.amountLocal;
      
      if (tx.type === 'COMPRA_USD') comprasUsd++;
      if (tx.type === 'VENTA_USD') ventasUsd++;
    });

    res.json({ 
      status: 'success', 
      data: { totalUsdVolume, totalArsVolume, comprasUsd, ventasUsd } 
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateTransaction = async (req, res) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const { id } = req.params;
    const { type, amountUsd, exchangeRate, amountLocal, notes } = req.body;
    
    const clientRepo = queryRunner.manager.getRepository('UsdClient');
    const txRepo = queryRunner.manager.getRepository('UsdTransaction');

    const tx = await txRepo.findOne({ where: { id }, relations: { client: true } });
    if (!tx) throw new Error("Transaction not found");

    const client = tx.client;

    // 1. Revert old transaction effects
    if (tx.type === 'INGRESO_ARS') {
      client.balanceArs -= parseFloat(tx.amountLocal || 0);
    } else if (tx.type === 'EGRESO_ARS') {
      client.balanceArs += parseFloat(tx.amountLocal || 0);
    } else if (tx.type === 'COMPRA_USD') {
      client.balanceUsd -= parseFloat(tx.amountUsd || 0);
      client.balanceArs += parseFloat(tx.amountLocal || 0);
    } else if (tx.type === 'VENTA_USD') {
      client.balanceUsd += parseFloat(tx.amountUsd || 0);
      client.balanceArs -= parseFloat(tx.amountLocal || 0);
    }

    // 2. Apply new transaction effects
    const newAmountUsd = parseFloat(amountUsd || 0);
    const newAmountLocal = parseFloat(amountLocal || 0);
    
    if (type === 'INGRESO_ARS') {
      client.balanceArs += newAmountLocal;
    } else if (type === 'EGRESO_ARS') {
      client.balanceArs -= newAmountLocal;
    } else if (type === 'COMPRA_USD') {
      client.balanceUsd += newAmountUsd;
      client.balanceArs -= newAmountLocal;
    } else if (type === 'VENTA_USD') {
      client.balanceUsd -= newAmountUsd;
      client.balanceArs += newAmountLocal;
    }

    // 3. Update tx fields
    tx.type = type;
    tx.amountUsd = newAmountUsd;
    tx.exchangeRate = parseFloat(exchangeRate || 1);
    tx.amountLocal = newAmountLocal;
    tx.notes = notes;

    await clientRepo.save(client);
    const savedTx = await txRepo.save(tx);

    await queryRunner.commitTransaction();
    res.status(200).json({ status: 'success', data: savedTx });
  } catch (error) {
    await queryRunner.rollbackTransaction();
    res.status(500).json({ status: 'error', message: error.message });
  } finally {
    await queryRunner.release();
  }
};
