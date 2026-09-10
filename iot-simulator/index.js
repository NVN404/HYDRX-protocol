require('dotenv').config();
const axios = require('axios');
const chalk = require('chalk');

const RELAYER_URL = process.env.RELAYER_URL || 'http://localhost:3005/api/telemetry';
const INTERVAL_MS = parseInt(process.env.PING_INTERVAL_MS) || 1000;

// 8 Apartment Units in the residential complex
const APARTMENTS = [
  { deviceId: 'HYDRX-NODE-101', name: 'Unit 101 (Apt 1A)', status: 'CONSERVING', baseFlow: 0.15 },
  { deviceId: 'HYDRX-NODE-202', name: 'Unit 202 (Apt 2B)', status: 'NORMAL',     baseFlow: 0.35 },
  { deviceId: 'HYDRX-NODE-303', name: 'Unit 303 (Apt 3C)', status: 'EXCEEDED',   baseFlow: 1.45 },
  { deviceId: 'HYDRX-NODE-404', name: 'Unit 404 (Apt 4D)', status: 'IDLE',       baseFlow: 0.00 },
  { deviceId: 'HYDRX-NODE-505', name: 'Unit 505 (Apt 5E)', status: 'TOP_SAVER',  baseFlow: 0.20 },
  { deviceId: 'HYDRX-NODE-606', name: 'Unit 606 (Apt 6F)', status: 'NORMAL',     baseFlow: 0.40 },
  { deviceId: 'HYDRX-NODE-707', name: 'Unit 707 (Apt 7G)', status: 'CONSERVING', baseFlow: 0.10 },
  { deviceId: 'HYDRX-NODE-808', name: 'Unit 808 (Apt 8H)', status: 'CONSERVING', baseFlow: 0.30 }
];

console.log(chalk.bold.cyan(`\n==================================================================`));
console.log(chalk.bold.cyan(`  HYDRX PROTOCOL · MAGICBLOCK EPHEMERAL ROLLUP FIREHOSE SIMULATOR`));
console.log(chalk.cyan(`  • Relayer Target:   ${chalk.bold(RELAYER_URL)}`));
console.log(chalk.cyan(`  • Target Speed:     Sub-50ms Ephemeral Rollup Turnaround`));
console.log(chalk.cyan(`  • Stream Interval:  ${chalk.bold(INTERVAL_MS)} ms per batch`));
console.log(chalk.cyan(`  • Parallel Nodes:   8 Residential Meter Units`));
console.log(chalk.bold.cyan(`==================================================================\n`));

let round = 1;
let totalPingsSent = 0;
let latencySum = 0;

async function sendUnitTelemetry(apt) {
  if (apt.status === 'IDLE') return;

  const jitter = (Math.random() * 0.1) - 0.05;
  const flow = Math.max(0.01, parseFloat((apt.baseFlow + jitter).toFixed(2)));
  
  const payload = {
    deviceId: apt.deviceId,
    litersUsed: flow,
    timestamp: Math.floor(Date.now() / 1000),
    signature: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    status: apt.status
  };

  const startTime = Date.now();
  try {
    const res = await axios.post(RELAYER_URL, payload, { timeout: 20000 });
    const elapsed = Date.now() - startTime;
    totalPingsSent++;
    latencySum += elapsed;
    const avgLatency = Math.round(latencySum / totalPingsSent);

    const tx = res.data.data?.txHash || 'er-simulated';
    const shortTx = tx.length > 16 ? `${tx.slice(0, 8)}...${tx.slice(-6)}` : tx;
    const erLatency = res.data.data?.latencyMs || elapsed;
    const autoCommitted = res.data.data?.autoCommitted;

    const statusTag = apt.status === 'CONSERVING' || apt.status === 'TOP_SAVER'
      ? chalk.green(`[${apt.status}]`)
      : apt.status === 'EXCEEDED'
      ? chalk.red(`[${apt.status}]`)
      : chalk.yellow(`[${apt.status}]`);

    const commitTag = autoCommitted ? chalk.bgMagenta.white(' [L1 COMMIT] ') : '';

    console.log(
      `${chalk.gray(new Date().toLocaleTimeString())} | ` +
      `${chalk.bold.green(`[ER ${erLatency}ms]`)} | ` +
      `${chalk.bold(apt.deviceId)} | ` +
      `Flow: ${chalk.bold(flow.toFixed(2))} L | ${statusTag}${commitTag} | ` +
      `ER Sig: ${chalk.cyan(shortTx)} | ` +
      `Avg: ${chalk.gray(`${avgLatency}ms`)}`
    );
  } catch (err) {
    console.log(chalk.red(`[ERR] ${apt.deviceId}: ${err.message}`));
  }
}

async function cycle() {
  console.log(chalk.magenta(`--- [Batch #${round++}] Streaming Telemetry on MagicBlock ER ---`));
  for (const apt of APARTMENTS) {
    await sendUnitTelemetry(apt);
    await new Promise(r => setTimeout(r, 600));
  }
  setTimeout(cycle, 1500);
}

cycle();
