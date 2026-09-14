import { AppDataSource } from './server/database.js';

async function run() {
  try {
    await AppDataSource.initialize();
    const txRepo = AppDataSource.getRepository('UsdTransaction');
    const txs = await txRepo.find({ relations: ['client'], order: { createdAt: 'DESC' } });
    console.log("Transactions from TypeORM:", JSON.stringify(txs, null, 2));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await AppDataSource.destroy();
  }
}
run();
