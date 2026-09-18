import { ref, update, push } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";
import { db, APP_ID } from './firebase.js';
import { state } from './state.js';
import { escapeHtml, timeAgo } from './helpers.js';

export function renderParticipants() {
    const search = document.getElementById('p-search').value.trim().toUpperCase();
    const statusFilter = document.getElementById('p-status').value;
    const wrap = document.getElementById('participants-grid');
    const empty = document.getElementById('participants-empty');

    let entries = Object.entries(state.registrations);
    if (search) entries = entries.filter(([id]) => id.toUpperCase().includes(search));
    if (statusFilter === 'flagged') entries = entries.filter(([, r]) => r.flagged);
    else if (statusFilter) entries = entries.filter(([, r]) => r.status === statusFilter);

    entries.sort((a, b) => (b[1].startTime || b[1].loginTime || '').localeCompare(a[1].startTime || a[1].loginTime || ''));

    empty.classList.toggle('hidden', entries.length > 0);
    wrap.innerHTML = entries.map(([admNo, r]) => {
        const feed = state.liveFeed[admNo];
        const isActive = r.status === 'active';
        const img = feed && feed.camFrame
            ? `<img class="thumb rounded-t-2xl cursor-pointer" src="data:image/jpeg;base64,${feed.camFrame}" onclick="openViewer('${admNo}')">`
            : `<div class="thumb rounded-t-2xl flex items-center justify-center text-[#8B95A6] text-[10px] font-data" style="background:#1E2A3D">${isActive ? 'Waiting for feed…' : 'No live feed'}</div>`;
        const statusColor = r.flagged ? 'var(--amber)' : (isActive ? 'var(--sage)' : '#9AA1AC');
        return `<div class="panel-card rounded-2xl overflow-hidden">
      ${img}
      <div class="p-4 space-y-2">
        <div class="flex justify-between items-center">
          <span class="font-data font-semibold text-sm">${escapeHtml(admNo)}</span>
          <span class="text-[9px] px-2 py-1 rounded-full text-white font-semibold tracking-wide ${isActive ? 'pulse-dot' : ''}" style="background:${statusColor}">${r.flagged ? 'Flagged' : (r.status || 'unknown')}</span>
        </div>
        <p class="text-[11px]" style="color:var(--ink-soft)">Exam: ${escapeHtml(r.examCode || '—')} · Violations: ${r.violations ?? 0}</p>
        ${feed ? `<p class="text-[10px] font-data" style="color:#B7BFCE">Snapshot: ${timeAgo(feed.timestamp)}</p>` : ''}
        <div class="flex gap-2 pt-1">
          <button onclick="openFlag('${admNo}')" class="flex-1 py-2 rounded-lg text-[10px] font-semibold" style="background:#FAF1E1;color:var(--amber)">Flag</button>
          ${isActive ? `<button onclick="forceEnd('${admNo}')" class="flex-1 py-2 rounded-lg text-[10px] font-semibold" style="background:#FBF1EF;color:var(--brick)">Force end</button>` : ''}
        </div>
      </div>
    </div>`;
    }).join('');
}

window.openViewer = (admNo) => {
    const feed = state.liveFeed[admNo];
    if (!feed || !feed.camFrame) return;
    document.getElementById('viewer-img').src = `data:image/jpeg;base64,${feed.camFrame}`;
    document.getElementById('viewer-caption').textContent = `${admNo} — snapshot ${timeAgo(feed.timestamp)}`;
    document.getElementById('viewer-modal').classList.remove('hidden');
};
window.closeViewer = () => document.getElementById('viewer-modal').classList.add('hidden');

window.forceEnd = async (admNo) => {
    if (!confirm(`Force-end ${admNo}'s session? This immediately submits their exam.`)) return;
    await update(ref(db, `artifacts/${APP_ID}/public/data/registrations/${admNo}`), {
        status: 'completed', endTime: new Date().toISOString(), exitType: 'admin_terminated'
    });
    await push(ref(db, `artifacts/${APP_ID}/public/data/incidents`), {
        admissionNo: admNo, type: 'ADMIN_TERMINATED', reason: `Session force-ended by ${state.currentAdmin.adminId}`,
        timestamp: new Date().toISOString(), source: 'admin', adminId: state.currentAdmin.adminId
    });
};
