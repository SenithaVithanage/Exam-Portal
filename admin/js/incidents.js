import { state } from './state.js';
import { escapeHtml } from './helpers.js';

export function renderIncidents() {
    const body = document.getElementById('incidents-body');
    const rows = Object.values(state.incidents).sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
    body.innerHTML = rows.map(i => `<tr style="border-top:1px solid var(--line)">
    <td class="p-3 font-data text-[10px]" style="color:var(--ink-soft)">${new Date(i.timestamp).toLocaleString()}</td>
    <td class="p-3 font-data font-semibold">${escapeHtml(i.admissionNo || '')}</td>
    <td class="p-3"><span class="px-2 py-1 rounded-full text-[9px] font-semibold" style="${i.source === 'admin' ? 'background:#FAF1E1;color:var(--amber)' : 'background:#F2F0E9;color:var(--ink-soft)'}">${escapeHtml(i.type || '')}</span></td>
    <td class="p-3" style="color:var(--ink)">${escapeHtml(i.reason || '')}</td>
    <td class="p-3 text-[10px]" style="color:var(--ink-soft)">${i.source === 'admin' ? 'Admin: ' + escapeHtml(i.adminId || '') : 'System'}</td>
  </tr>`).join('');
}
