import { ref, update, push } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";
import { db, APP_ID } from './firebase.js';
import { state } from './state.js';

window.openFlag = (admNo) => {
    state.flagTarget = admNo;
    document.getElementById('flag-target-label').textContent = admNo;
    document.getElementById('flag-reason').value = '';
    document.getElementById('flag-modal').classList.remove('hidden');
};
window.closeFlagModal = () => document.getElementById('flag-modal').classList.add('hidden');

window.confirmFlag = async () => {
    const reason = document.getElementById('flag-reason').value.trim() || 'Flagged by proctor.';
    if (!state.flagTarget) return;
    await update(ref(db, `artifacts/${APP_ID}/public/data/registrations/${state.flagTarget}`), {
        flagged: true, flagReason: reason, flaggedBy: state.currentAdmin.adminId, flaggedAt: new Date().toISOString()
    });
    await push(ref(db, `artifacts/${APP_ID}/public/data/incidents`), {
        admissionNo: state.flagTarget, type: 'ADMIN_FLAG', reason,
        timestamp: new Date().toISOString(), source: 'admin', adminId: state.currentAdmin.adminId
    });
    window.closeFlagModal();
};
