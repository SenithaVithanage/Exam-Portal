import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { ref, get, onValue } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";
import { auth, db, APP_ID, toEmail } from './firebase.js';
import { state } from './state.js';
import { renderExams } from './exams.js';
import { renderParticipants } from './participants.js';
import { renderIncidents } from './incidents.js';
import { renderAdmins } from './admins.js';

window.doLogin = async () => {
    const id = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value;
    const errBox = document.getElementById('login-error');
    errBox.classList.add('hidden');
    if (!id || !pass) return;
    const btn = document.getElementById('login-btn');
    btn.disabled = true;
    try {
        const cred = await signInWithEmailAndPassword(auth, toEmail(id), pass);
        const snap = await get(ref(db, `admins/${cred.user.uid}`));
        if (!snap.exists()) {
            await signOut(auth);
            throw new Error("This account is not registered as an admin.");
        }
        state.currentAdmin = { uid: cred.user.uid, ...snap.val() };
    } catch (e) {
        errBox.textContent = "Login failed: " + (e.message || "check your credentials.");
        errBox.classList.remove('hidden');
    }
    btn.disabled = false;
};

window.doLogout = () => signOut(auth);

onAuthStateChanged(auth, async (user) => {
    if (user && user.uid !== undefined) {
        const snap = await get(ref(db, `admins/${user.uid}`));
        if (snap.exists()) {
            state.currentAdmin = { uid: user.uid, ...snap.val() };
            enterApp();
            return;
        }
    }
    state.currentAdmin = null;
    document.getElementById('app-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
});

function enterApp() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app-screen').classList.remove('hidden');
    document.getElementById('whoami').textContent = `${state.currentAdmin.adminId} · ${state.currentAdmin.role}`;
    document.getElementById('admins-tab-btn').classList.toggle('hidden', state.currentAdmin.role !== 'superadmin');
    attachListeners();
}

function attachListeners() {
    const base = `artifacts/${APP_ID}/public/data`;
    onValue(ref(db, `${base}/exams`), (s) => { state.exams = s.val() || {}; renderExams(); renderParticipants(); });
    onValue(ref(db, `${base}/registrations`), (s) => { state.registrations = s.val() || {}; renderParticipants(); });
    onValue(ref(db, `${base}/incidents`), (s) => { state.incidents = s.val() || {}; renderIncidents(); });
    onValue(ref(db, `${base}/liveFeed`), (s) => { state.liveFeed = s.val() || {}; renderParticipants(); });
    onValue(ref(db, `admins`), (s) => { state.admins = s.val() || {}; renderAdmins(); });
}

setInterval(() => { if (state.currentAdmin) renderParticipants(); }, 5000);
