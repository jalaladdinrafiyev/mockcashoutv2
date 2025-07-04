const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/withdrawals';

async function testEndpoints() {
  try {
    // 1. Reserve
    const reserveRes = await axios.post(`${BASE_URL}/reserve`, {
      wallet_id: '12345',
      amount: 5
    });
    console.log('Reserve response:', reserveRes.data);
    const withdrawal_id = reserveRes.data.withdrawal_id;

    // 2. Process
    const processRes = await axios.post(`${BASE_URL}/process`, {
      withdrawal_id,
      amount: 5
    });
    console.log('Process response:', processRes.data);

    // 3. Finalize
    const finalizeRes = await axios.post(`${BASE_URL}/finalize`, {
      withdrawal_id,
      withdrawal_status: 'full',
      amount: 5
    });
    console.log('Finalize response:', finalizeRes.data);
  } catch (err) {
    if (err.response) {
      console.error('Error response:', err.response.data);
    } else {
      console.error('Error:', err.message);
    }
  }
}

testEndpoints(); 
