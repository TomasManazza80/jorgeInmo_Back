async function run() {
  try {
    const res = await fetch('http://localhost:10000/api/usd/transactions');
    const text = await res.text();
    console.log("HTTP Response:", res.status, text);
  } catch (error) {
    console.error("HTTP Error:", error);
  }
}
run();
