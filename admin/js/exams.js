import { ref, set, remove } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";
import { db, APP_ID } from './firebase.js';
import { state } from './state.js';
import { escapeHtml } from './helpers.js';

window.addExam = async () => {
    const name = document.getElementById('e-name').value.trim();
    const code = document.getElementById('e-code').value.trim().toUpperCase();
    const url = document.getElementById('e-url').value.trim();
    const msg = document.getElementById('exam-form-msg');
    if (!name || !code || !url) { msg.textContent = "All fields are required."; msg.className = "text-xs text-red-600"; return; }
    try {
        await set(ref(db, `artifacts/${APP_ID}/public/data/exams/${code}`), {
            examName: name, accessCode: code, formUrl: url,
            createdAt: new Date().toISOString(), createdBy: state.currentAdmin.adminId
        });
        msg.textContent = "Exam created."; msg.className = "text-xs text-green-600";
        document.getElementById('e-name').value = '';
        document.getElementById('e-code').value = '';
        document.getElementById('e-url').value = '';
    } catch (e) { msg.textContent = e.message; msg.className = "text-xs text-red-600"; }
};

window.deleteExam = async (code) => {
    if (!confirm(`Delete exam "${code}"? This does not delete existing registrations.`)) return;
    await remove(ref(db, `artifacts/${APP_ID}/public/data/exams/${code}`));
};

export function renderExams() {
    const wrap = document.getElementById('exams-list');
    const codes = Object.keys(state.exams);
    if (!codes.length) { wrap.innerHTML = `<p class="text-sm" style="color:var(--ink-soft)">No exams yet.</p>`; return; }
    wrap.innerHTML = codes.map(code => {
        const e = state.exams[code];
        const count = Object.values(state.registrations).filter(r => r.examCode === code).length;
        return `<div class="panel-card p-5 rounded-2xl space-y-2">
      <div class="flex justify-between items-start">
        <div>
          <h4 class="font-semibold text-sm">${escapeHtml(e.examName || '')}</h4>
          <p class="font-data text-xs" style="color:var(--teal)">${escapeHtml(code)}</p>
        </div>
        <button onclick="deleteExam('${code}')" class="text-xs font-semibold hover:underline" style="color:var(--brick)">Delete</button>
      </div>
      <a href="${escapeHtml(e.formUrl || '#')}" target="_blank" class="text-[10px] underline break-all block" style="color:var(--ink-soft)">${escapeHtml(e.formUrl || '')}</a>
      <p class="text-[10px]" style="color:var(--ink-soft)">${count} registration(s)</p>
    </div>`;
    }).join('');
}
