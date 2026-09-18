import { createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { ref, set, remove } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";
import { db, secondaryAuth, toEmail } from './firebase.js';
import { state } from './state.js';
import { escapeHtml } from './helpers.js';

window.addAdmin = async () => {
    const id = document.getElementById('a-id').value.trim();
    const pass = document.getElementById('a-pass').value;
    const msg = document.getElementById('admin-form-msg');
    if (state.currentAdmin.role !== 'superadmin') { msg.textContent = "Only the super admin can add admins."; msg.className = "text-xs text-red-600"; return; }
    if (!id || pass.length < 6) { msg.textContent = "ID required; password must be 6+ characters."; msg.className = "text-xs text-red-600"; return; }
    try {
        const cred = await createUserWithEmailAndPassword(secondaryAuth, toEmail(id), pass);
        await set(ref(db, `admins/${cred.user.uid}`), {
            adminId: id, role: 'admin', createdAt: new Date().toISOString(), createdBy: state.currentAdmin.adminId
        });
        await signOut(secondaryAuth);
        msg.textContent = `Admin "${id}" created.`; msg.className = "text-xs text-green-600";
        document.getElementById('a-id').value = ''; document.getElementById('a-pass').value = '';
    } catch (e) { msg.textContent = e.message; msg.className = "text-xs text-red-600"; }
};

window.removeAdmin = async (uid, id) => {
    if (state.currentAdmin.role !== 'superadmin') return;
    if (!confirm(`Remove admin "${id}"? They will lose console access (their login account still exists in Firebase Auth — delete it there too if needed).`)) return;
    await remove(ref(db, `admins/${uid}`));
};

export function renderAdmins() {
    const wrap = document.getElementById('admins-list');
    wrap.innerHTML = Object.entries(state.admins).map(([uid, a]) => `<div class="panel-card p-4 rounded-2xl flex justify-between items-center">
    <div>
      <p class="font-data font-semibold text-sm">${escapeHtml(a.adminId)}</p>
      <p class="text-[10px]" style="color:var(--ink-soft)">${escapeHtml(a.role)}</p>
    </div>
    ${a.role !== 'superadmin' ? `<button onclick="removeAdmin('${uid}','${escapeHtml(a.adminId)}')" class="text-xs font-semibold hover:underline" style="color:var(--brick)">Remove</button>` : ''}
  </div>`).join('');
}
