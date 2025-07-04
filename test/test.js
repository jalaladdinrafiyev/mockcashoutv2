const { spawn } = require('child_process');
const treeKill = require('tree-kill');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const withdrawalIdsFile = path.join(__dirname, '../withdrawal_ids.txt');
if (fs.existsSync(withdrawalIdsFile)) fs.unlinkSync(withdrawalIdsFile);

const BASE_URL = 'http://localhost:3000/api/withdrawals';
const HEALTH_URL = 'http://localhost:3000/health';

let server;
function killServerAndExit(code = 0) {
  if (server && server.pid) {
    treeKill(server.pid, 'SIGKILL', () => process.exit(code));
  } else {
    process.exit(code);
  }
}

async function waitForServer(url, retries = 10) {
  for (let i = 0; i < retries; i++) {
    try {
      await axios.get(url);
      return;
    } catch {
      await new Promise(res => setTimeout(res, 500));
    }
  }
  throw new Error('Server not available');
}

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
    killServerAndExit(1);
  }
}

async function testEndpoints() {
  let withdrawal_id;
  let reserved_amount = 500;
  // 1. Reserve (valid)
  await runTest('Reserve (valid)', async () => {
    const reserveRes = await axios.post(`${BASE_URL}/reserve`, {
      wallet_id: '12345',
      amount: reserved_amount
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

  // 3. Finalize (valid: full)
  await runTest('Finalize (valid: full)', async () => {
    await axios.post(`${BASE_URL}/finalize`, {
      withdrawal_id,
      withdrawal_status: 'full',
      amount: reserved_amount
    });
  });

  // 3b. Finalize (valid: partial)
  await runTest('Finalize (valid: partial)', async () => {
    await axios.post(`${BASE_URL}/finalize`, {
      withdrawal_id,
      withdrawal_status: 'partial',
      amount: reserved_amount - 1
    });
  });

  // 3c. Finalize (valid: released)
  await runTest('Finalize (valid: released)', async () => {
    await axios.post(`${BASE_URL}/finalize`, {
      withdrawal_id,
      withdrawal_status: 'released',
      amount: 0
    });
  });

  // 3d. Finalize (invalid: full, amount != reserved)
  await runTest('Finalize (invalid: full, wrong amount)', async () => {
    try {
      await axios.post(`${BASE_URL}/finalize`, {
        withdrawal_id,
        withdrawal_status: 'full',
        amount: reserved_amount - 1
      });
      throw new Error('Should have failed');
    } catch (err) {
      if (err.response && err.response.status === 400) return;
      throw err;
    }
  });

  // 3e. Finalize (invalid: partial, amount >= reserved)
  await runTest('Finalize (invalid: partial, amount >= reserved)', async () => {
    try {
      await axios.post(`${BASE_URL}/finalize`, {
        withdrawal_id,
        withdrawal_status: 'partial',
        amount: reserved_amount
      });
      throw new Error('Should have failed');
    } catch (err) {
      if (err.response && err.response.status === 400) return;
      throw err;
    }
  });

  // 3f. Finalize (invalid: partial, amount <= 0)
  await runTest('Finalize (invalid: partial, amount <= 0)', async () => {
    try {
      await axios.post(`${BASE_URL}/finalize`, {
        withdrawal_id,
        withdrawal_status: 'partial',
        amount: 0
      });
      throw new Error('Should have failed');
    } catch (err) {
      if (err.response && err.response.status === 400) return;
      throw err;
    }
  });

  // 3g. Finalize (invalid: released, amount != 0)
  await runTest('Finalize (invalid: released, amount != 0)', async () => {
    try {
      await axios.post(`${BASE_URL}/finalize`, {
        withdrawal_id,
        withdrawal_status: 'released',
        amount: 1
      });
      throw new Error('Should have failed');
    } catch (err) {
      if (err.response && err.response.status === 400) return;
      throw err;
    }
  });

  // 3h. Finalize (invalid: withdrawal_status value)
  await runTest('Finalize (invalid: withdrawal_status value)', async () => {
    try {
      await axios.post(`${BASE_URL}/finalize`, {
        withdrawal_id,
        withdrawal_status: 'invalid_status',
        amount: reserved_amount
      });
      throw new Error('Should have failed');
    } catch (err) {
      if (err.response && err.response.status === 400) return;
      throw err;
    }
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

  // 7. Reserve (amount is string)
  await runTest('Reserve (amount is string)', async () => {
    try {
      await axios.post(`${BASE_URL}/reserve`, {
        wallet_id: '12345',
        amount: 'notanumber'
      });
      throw new Error('Should have failed');
    } catch (err) {
      if (err.response && err.response.status === 400) return;
      throw err;
    }
  });

  // 8. Reserve (amount is zero)
  await runTest('Reserve (amount is zero)', async () => {
    try {
      await axios.post(`${BASE_URL}/reserve`, {
        wallet_id: '12345',
        amount: 0
      });
      throw new Error('Should have failed');
    } catch (err) {
      if (err.response && err.response.status === 400) return;
      throw err;
    }
  });

  // 9. Reserve (amount is negative)
  await runTest('Reserve (amount is negative)', async () => {
    try {
      await axios.post(`${BASE_URL}/reserve`, {
        wallet_id: '12345',
        amount: -100
      });
      throw new Error('Should have failed');
    } catch (err) {
      if (err.response && err.response.status === 400) return;
      throw err;
    }
  });

  // 10. Reserve (extra fields)
  await runTest('Reserve (extra fields)', async () => {
    const res = await axios.post(`${BASE_URL}/reserve`, {
      wallet_id: '12345',
      amount: 100,
      extra: 'field'
    });
    if (!res.data.withdrawal_id) throw new Error('withdrawal_id missing');
  });

  // 11. Reserve (empty body)
  await runTest('Reserve (empty body)', async () => {
    try {
      await axios.post(`${BASE_URL}/reserve`, {});
      throw new Error('Should have failed');
    } catch (err) {
      if (err.response && err.response.status === 400) return;
      throw err;
    }
  });

  // 12. Reserve (no body)
  await runTest('Reserve (no body)', async () => {
    try {
      await axios.post(`${BASE_URL}/reserve`);
      throw new Error('Should have failed');
    } catch (err) {
      if (err.response && err.response.status === 400) return;
      throw err;
    }
  });

  // 13. Process (amount is string)
  await runTest('Process (amount is string)', async () => {
    try {
      await axios.post(`${BASE_URL}/process`, {
        withdrawal_id,
        amount: 'notanumber'
      });
      throw new Error('Should have failed');
    } catch (err) {
      if (err.response && err.response.status === 400) return;
      throw err;
    }
  });

  // 14. Process (withdrawal_id is string)
  await runTest('Process (withdrawal_id is string)', async () => {
    try {
      await axios.post(`${BASE_URL}/process`, {
        withdrawal_id: 'notanumber',
        amount: 100
      });
      throw new Error('Should have failed');
    } catch (err) {
      if (err.response && err.response.status === 400) return;
      throw err;
    }
  });

  // 15. Process (amount is zero)
  await runTest('Process (amount is zero)', async () => {
    try {
      await axios.post(`${BASE_URL}/process`, {
        withdrawal_id,
        amount: 0
      });
      throw new Error('Should have failed');
    } catch (err) {
      if (err.response && err.response.status === 400) return;
      throw err;
    }
  });

  // 16. Finalize (withdrawal_status is number)
  await runTest('Finalize (withdrawal_status is number)', async () => {
    try {
      await axios.post(`${BASE_URL}/finalize`, {
        withdrawal_id,
        withdrawal_status: 123,
        amount: 100
      });
      throw new Error('Should have failed');
    } catch (err) {
      if (err.response && err.response.status === 400) return;
      throw err;
    }
  });

  // 17. Finalize (withdrawal_status is boolean)
  await runTest('Finalize (withdrawal_status is boolean)', async () => {
    try {
      await axios.post(`${BASE_URL}/finalize`, {
        withdrawal_id,
        withdrawal_status: true,
        amount: 100
      });
      throw new Error('Should have failed');
    } catch (err) {
      if (err.response && err.response.status === 400) return;
      throw err;
    }
  });

  // 18. Finalize (withdrawal_id is string)
  await runTest('Finalize (withdrawal_id is string)', async () => {
    try {
      await axios.post(`${BASE_URL}/finalize`, {
        withdrawal_id: 'notanumber',
        withdrawal_status: 'full',
        amount: 100
      });
      throw new Error('Should have failed');
    } catch (err) {
      if (err.response && err.response.status === 400) return;
      throw err;
    }
  });

  // 19. Finalize (amount is negative)
  await runTest('Finalize (amount is negative)', async () => {
    try {
      await axios.post(`${BASE_URL}/finalize`, {
        withdrawal_id,
        withdrawal_status: 'full',
        amount: -100
      });
      throw new Error('Should have failed');
    } catch (err) {
      if (err.response && err.response.status === 400) return;
      throw err;
    }
  });

  // 20. Finalize (nonexistent withdrawal_id)
  await runTest('Finalize (nonexistent withdrawal_id)', async () => {
    try {
      await axios.post(`${BASE_URL}/finalize`, {
        withdrawal_id: 9999999999999,
        withdrawal_status: 'full',
        amount: 100
      });
      throw new Error('Should have failed');
    } catch (err) {
      if (err.response && err.response.status === 400) return;
      throw err;
    }
  });

  // 21. Reserve (amount is very large)
  await runTest('Reserve (amount is very large)', async () => {
    const res = await axios.post(`${BASE_URL}/reserve`, {
      wallet_id: '12345',
      amount: Number.MAX_SAFE_INTEGER
    });
    if (!res.data.withdrawal_id) throw new Error('withdrawal_id missing');
  });

  // 22. Malformed JSON (should fail with 400)
  await runTest('Reserve (malformed JSON)', async () => {
    try {
      await axios({
        method: 'post',
        url: `${BASE_URL}/reserve`,
        data: '{ wallet_id: 12345, amount: 100 ', // malformed
        headers: { 'Content-Type': 'application/json' }
      });
      throw new Error('Should have failed');
    } catch (err) {
      if (err.response && err.response.status >= 400) return;
      throw err;
    }
  });

  console.log('All tests passed!');
  killServerAndExit(0);
}

(async () => {
  // Start the server
  server = spawn('node', ['server.js'], {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    shell: process.platform === 'win32'
  });

  process.on('exit', () => killServerAndExit(0));
  process.on('SIGINT', () => killServerAndExit(0));
  process.on('uncaughtException', () => killServerAndExit(1));

  try {
    console.log('Waiting for server to be ready...');
    await waitForServer(HEALTH_URL);
    console.log('Server is ready. Starting tests...');
    await testEndpoints();
  } catch (err) {
    console.error(err);
    killServerAndExit(1);
  }
})(); 
