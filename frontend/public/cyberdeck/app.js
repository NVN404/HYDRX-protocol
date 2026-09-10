const urlParams = new URLSearchParams(window.location.search);
const RELAYER_URL = urlParams.get('relayer') || window.RELAYER_URL || 'http://localhost:3005';

function showDeckFeedback(msg, isError = false) {
  const fb = document.getElementById('deck-feedback');
  if (!fb) return;
  fb.style.display = 'block';
  fb.style.background = isError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0, 240, 255, 0.12)';
  fb.style.borderColor = isError ? 'rgba(239, 68, 68, 0.4)' : 'rgba(0, 240, 255, 0.3)';
  fb.style.color = isError ? '#f87171' : '#5eead4';
  fb.innerHTML = msg;
}

async function fetchStats() {
  try {
    const res = await fetch(`${RELAYER_URL}/api/stats`);
    if (!res.ok) return;
    const data = await res.json();

    // Update Top Stats
    document.getElementById('stat-total-liters').innerText = `${data.totalLitersTracked.toFixed(2)} L`;
    document.getElementById('stat-total-pings').innerText = data.ephemeralPingsCount.toLocaleString();
    document.getElementById('stat-commits-count').innerText = data.baseCommitsCount;
    document.getElementById('stat-active-devices').innerText = `${data.activeDevicesCount} Units`;

    // Update Average ER Latency display
    if (data.avgErLatencyMs) {
      document.getElementById('er-latency-display').innerText = `~${data.avgErLatencyMs} ms`;
    }

    // Render Recent Logs Feed
    const feedContainer = document.getElementById('feed-container');
    if (data.recentLogs && data.recentLogs.length > 0) {
      document.getElementById('feed-count').innerText = `${data.recentLogs.length} recent pulses`;
      feedContainer.innerHTML = data.recentLogs.map(log => {
        const itemClass = log.isCommitEvent
          ? 'feed-item feed-commit'
          : log.isDelegateEvent
          ? 'feed-item feed-delegate'
          : log.isUndelegateEvent
          ? 'feed-item feed-undelegate'
          : 'feed-item';

        const isL1Direct = log.delegated === false && !log.isCommitEvent && !log.isUndelegateEvent && !log.isDelegateEvent;

        const speedBadgeClass = log.isCommitEvent || log.isUndelegateEvent || isL1Direct
          ? 'speed-badge speed-l1'
          : 'speed-badge';

        const flowDisplay = log.isCommitEvent
          ? 'L1 SEAL'
          : log.isDelegateEvent
          ? 'ER DELEGATED'
          : log.isUndelegateEvent
          ? 'L1 SETTLED'
          : `${log.liters.toFixed(2)} L`;

        const committedBadge = log.isCommitEvent
          ? '<span style="background: rgba(217, 70, 239, 0.3); color: #d946ef; padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: 700; border: 1px solid rgba(217, 70, 239, 0.6); letter-spacing: 0.04em;">L1 SEAL</span>'
          : isL1Direct
          ? '<span style="background: rgba(153, 69, 255, 0.25); color: #c084fc; padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: 700; border: 1px solid rgba(153, 69, 255, 0.5); letter-spacing: 0.04em;">SOLANA L1 DIRECT</span>'
          : log.autoCommitted
          ? '<span style="background: rgba(217, 70, 239, 0.25); color: #d946ef; padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: 700; border: 1px solid rgba(217, 70, 239, 0.5); letter-spacing: 0.04em;">L1 COMMITTED</span>'
          : '<span style="background: rgba(0, 240, 255, 0.12); color: #00f0ff; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600;">ER INGEST</span>';

        return `
          <div class="${itemClass}">
            <div class="feed-left">
              <span class="${speedBadgeClass}">${log.latencyMs ? `${log.latencyMs}ms` : '24ms'}</span>
              <span class="feed-device">${log.deviceId}</span>
              <span class="feed-flow">${flowDisplay}</span>
              ${committedBadge}
            </div>
            <div class="feed-right">
              <span>${new Date(log.timestamp).toLocaleTimeString()}</span>
              <a class="feed-tx" href="${log.explorerUrl || '#'}" target="_blank">${(log.txHash || 'sig').slice(0, 10)}... ↗</a>
            </div>
          </div>
        `;
      }).join('');
    }

    // Render Apartment Units Grid
    const unitsContainer = document.getElementById('units-container');
    if (data.devices && data.devices.length > 0) {
      unitsContainer.innerHTML = data.devices.map(d => {
        const isConserving = d.totalLiters / (d.pings || 1) < 0.5;
        const statusClass = isConserving ? 'unit-status' : 'unit-status exceeded';
        const statusText = isConserving ? 'CONSERVING' : 'NORMAL FLOW';
        const isDelegated = d.delegated !== false;
        const delegationTag = isDelegated
          ? '<span style="color: var(--er-green); font-size: 11px;">[ER ACTIVE]</span>'
          : '<span style="color: var(--solana-purple); font-size: 11px;">[SOLANA L1]</span>';

        return `
          <div class="unit-card">
            <div class="unit-top">
              <span class="unit-id">${d.deviceId}</span>
              <div style="display: flex; gap: 6px; align-items: center;">
                ${delegationTag}
                <span class="${statusClass}">${statusText}</span>
              </div>
            </div>
            <div class="unit-stats">
              <span>Total Volume:</span>
              <span class="unit-liters">${d.totalLiters.toFixed(2)} L</span>
            </div>
            <div class="unit-stats">
              <span>Telemetry Pings:</span>
              <span>${d.pings} pulses</span>
            </div>
            <div class="unit-stats">
              <span>Uncommitted ER:</span>
              <span style="color: var(--accent); font-weight: 700;">${d.uncommittedPings || 0} pings</span>
            </div>
          </div>
        `;
      }).join('');
    }
  } catch (err) {
    console.warn('Could not fetch stats from relayer proxy:', err.message);
  }
}

async function triggerDelegate() {
  const btn = document.getElementById('btn-delegate');
  const origText = btn ? btn.innerText : '';
  if (btn) btn.innerText = 'Delegating...';
  try {
    const res = await fetch(`${RELAYER_URL}/api/delegate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: 'HYDRX-NODE-101' })
    });
    const result = await res.json();
    const shortTx = (result.txHash || 'active').slice(0, 14);
    let msg = `[DELEGATION CONFIRMED] HYDRX-NODE-101 active on MagicBlock Ephemeral Rollup · Solana L1 Tx: <a href="${result.explorerUrl || '#'}" target="_blank" style="color: #67e8f9; text-decoration: underline; font-weight: 700;">${shortTx}... ↗</a>`;
    if (result.erExplorerUrl) {
      msg += ` · Rollup State: <a href="${result.erExplorerUrl}" target="_blank" style="color: #a78bfa; text-decoration: underline;">ER Cluster ↗</a>`;
    }
    showDeckFeedback(msg);
    await fetchStats();
  } catch (err) {
    showDeckFeedback(`[DELEGATION ERROR] ${err.message}`, true);
  } finally {
    if (btn) btn.innerText = origText;
  }
}

async function triggerCommit() {
  const btn = document.getElementById('btn-commit');
  const origText = btn ? btn.innerText : '';
  if (btn) btn.innerText = 'Committing to L1...';
  try {
    const res = await fetch(`${RELAYER_URL}/api/commit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: 'HYDRX-NODE-101' })
    });
    const result = await res.json();
    const shortTx = (result.txHash || 'committed').slice(0, 14);
    let msg = `[L1 CHECKPOINT SEALED] State batch committed to Solana Base Layer! L1 Settlement Tx: <a href="${result.explorerUrl || '#'}" target="_blank" style="color: #d946ef; text-decoration: underline; font-weight: 700;">${shortTx}... ↗</a>`;
    if (result.erTxHash && result.erExplorerUrl) {
      msg += ` · ER Intent: <a href="${result.erExplorerUrl}" target="_blank" style="color: #67e8f9; text-decoration: underline;">${result.erTxHash.slice(0, 8)}... ↗</a>`;
    }
    msg += ` · (${result.pingsSealed || 'All'} pings marked L1 COMMITTED)`;
    showDeckFeedback(msg);
    await fetchStats();
  } catch (err) {
    showDeckFeedback(`[COMMIT ERROR] ${err.message}`, true);
  } finally {
    if (btn) btn.innerText = origText;
  }
}

async function triggerUndelegate() {
  const btn = document.getElementById('btn-undelegate');
  const origText = btn ? btn.innerText : '';
  if (btn) btn.innerText = 'Undelegating...';
  try {
    const res = await fetch(`${RELAYER_URL}/api/undelegate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: 'HYDRX-NODE-101' })
    });
    const result = await res.json();
    const shortTx = (result.txHash || 'undelegated').slice(0, 14);
    let msg = `[UNDELEGATION CONFIRMED] Account state returned to Solana L1 Base Layer · L1 Tx: <a href="${result.explorerUrl || '#'}" target="_blank" style="color: #c084fc; text-decoration: underline; font-weight: 700;">${shortTx}... ↗</a>`;
    if (result.erTxHash && result.erExplorerUrl) {
      msg += ` · ER Intent: <a href="${result.erExplorerUrl}" target="_blank" style="color: #67e8f9; text-decoration: underline;">${result.erTxHash.slice(0, 8)}... ↗</a>`;
    }
    showDeckFeedback(msg);
    await fetchStats();
  } catch (err) {
    showDeckFeedback(`[UNDELEGATION ERROR] ${err.message}`, true);
  } finally {
    if (btn) btn.innerText = origText;
  }
}

// Poll every 1.2 seconds for real-time live feed
setInterval(fetchStats, 1200);
fetchStats();
