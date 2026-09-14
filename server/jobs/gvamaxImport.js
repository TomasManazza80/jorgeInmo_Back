import { syncGvamaxToLocal } from '../services/gvamaxService.js';

export const runGvamaxImport = async () => {
    try {
        console.log('[Cron Job] Starting automated GVAmax import...');
        await syncGvamaxToLocal();
        console.log('[Cron Job] Automated GVAmax import completed successfully.');
    } catch (error) {
        console.error('[Cron Job] Automated GVAmax import failed:', error);
    }
};
