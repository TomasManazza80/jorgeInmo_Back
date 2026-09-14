import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: "postgresql://jorge_inmo_dpij_user:R0txJtYUgHL525vMAbCPZaYSYHts8GkC@dpg-d8eq5f7avr4c7391b2m0-a.oregon-postgres.render.com/jorge_inmo_dpij",
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to DB");
    await client.query('TRUNCATE TABLE usd_transaction CASCADE;');
    console.log("Truncated usd_transaction successfully.");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

run();
