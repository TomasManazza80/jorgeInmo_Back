import { AppDataSource } from './server/database.js';
import { syncGvamaxToLocal } from './server/services/gvamaxService.js';

async function run() {
    await AppDataSource.initialize();
    await syncGvamaxToLocal();
    console.log("Done");
    process.exit(0);
}

run();
