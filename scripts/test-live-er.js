const axios = require('axios');
const chalk = require('chalk');

const RELAYER_URL = process.env.RELAYER_URL || 'http://localhost:3005';

async function testLiveER() {
    console.log(chalk.bold.cyan(`\n==================================================================`));
    console.log(chalk.bold.cyan(`TESTING HYDRX PROTOCOL ON MAGICBLOCK EPHEMERAL ROLLUP`));
    console.log(chalk.cyan(`• Target: ${RELAYER_URL}`));
    console.log(chalk.bold.cyan(`==================================================================\n`));

    try {
        // 1. Check stats
        console.log(chalk.blue(`1. Fetching Relayer Proxy Stats...`));
        const statsRes = await axios.get(`${RELAYER_URL}/api/stats`);
        console.log(chalk.green(`[OK] Relayer online. Program: ${statsRes.data.programId}`));
        console.log(`• Network: ${statsRes.data.network}`);
        console.log(`• Total Liters: ${statsRes.data.totalLitersTracked} L`);

        // 2. Delegate account
        console.log(chalk.blue(`\n2. Delegating Meter HYDRX-NODE-101 to Ephemeral Rollup...`));
        const delegateRes = await axios.post(`${RELAYER_URL}/api/delegate`, {
            deviceId: 'HYDRX-NODE-101'
        });
        console.log(chalk.green(`[OK] Delegation Status: ${delegateRes.data.message || 'Active'}`));

        // 3. Send high-speed telemetry pulse to ER
        console.log(chalk.blue(`\n3. Sending High-Speed IoT Telemetry Pulse to MagicBlock ER...`));
        const t0 = Date.now();
        const pulseRes = await axios.post(`${RELAYER_URL}/api/telemetry`, {
            deviceId: 'HYDRX-NODE-101',
            litersUsed: 0.25,
            timestamp: Math.floor(Date.now() / 1000),
            signature: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
            status: 'CONSERVING'
        });
        const elapsed = Date.now() - t0;
        console.log(chalk.green(`[OK] Pulse Confirmed on MagicBlock ER in ${elapsed}ms!`));
        console.log(`• Signature: ${pulseRes.data.data.txHash}`);
        console.log(`• Volume: ${pulseRes.data.data.litersRecorded} L`);
        console.log(`• Execution Layer: ${pulseRes.data.data.executionLayer}`);

        // 4. Commit checkpoint to Base Layer
        console.log(chalk.blue(`\n4. Triggering Checkpoint Commit from ER to Solana L1...`));
        const commitRes = await axios.post(`${RELAYER_URL}/api/commit`, {
            deviceId: 'HYDRX-NODE-101'
        });
        console.log(chalk.green(`[OK] State Committed to Base Layer! Tx: ${commitRes.data.txHash}`));

        console.log(chalk.bold.green(`\n[SUCCESS] ALL MAGICBLOCK EPHEMERAL ROLLUP OPERATIONS PASSED!\n`));
    } catch (err) {
        console.error(chalk.red(`[ERROR] Test failed: ${err.message}`));
    }
}

testLiveER();
