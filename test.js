const axios = require('axios');

const BASE_URL = 'https://mockcashoutv2.onrender.com/api/withdrawals';

async function runTest(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name} passed`);
  } catch (err) {
    if (err.response) {
      console.error(`❌ ${name} failed:`, err.response.data);
    } else {
      console.error(`❌ ${name} failed:`, err.message);
    }
    process.exit(1);
  }
}

async function testEndpoints() {
  let withdrawal_id;
  // 1. Reserve (valid)
  await runTest('Reserve (valid)', async () => {
    const reserveRes = await axios.post(`${BASE_URL}/reserve`, {
      wallet_id: '12345',
      amount: 500
    });
    withdrawal_id = reserveRes.data.withdrawal_id;
  });

  // 2. Process (valid)
  await runTest('Process (valid)', async () => {
    await axios.post(`${BASE_URL}/process`, {
      withdrawal_id,
      amount: 500
    });
  });

  // 3. Finalize (valid)
  await runTest('Finalize (valid)', async () => {
    await axios.post(`${BASE_URL}/finalize`, {
      withdrawal_id,
      withdrawal_status: 'full',
      amount: 500
    });
  });

  // 4. Reserve (missing amount)
  await runTest('Reserve (missing amount)', async () => {
    try {
      await axios.post(`${BASE_URL}/reserve`, {
        wallet_id: '12345'
      });
      throw new Error('Should have failed');
    } catch (err) {
      if (err.response && err.response.status === 400) return;
      throw err;
    }
  });

  // 5. Process (invalid withdrawal_id)
  await runTest('Process (invalid withdrawal_id)', async () => {
    try {
      await axios.post(`${BASE_URL}/process`, {
        withdrawal_id: 9999999999999,
        amount: 500
      });
      throw new Error('Should have failed');
    } catch (err) {
      if (err.response && err.response.status === 400) return;
      throw err;
    }
  });

  // 6. Finalize (missing withdrawal_status)
  await runTest('Finalize (missing withdrawal_status)', async () => {
    try {
      await axios.post(`${BASE_URL}/finalize`, {
        withdrawal_id,
        amount: 500
      });
      throw new Error('Should have failed');
    } catch (err) {
      if (err.response && err.response.status === 400) return;
      throw err;
    }
  });

  console.log('All tests passed!');
  process.exit(0);
}

testEndpoints(); 
