import { signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { ref, get, set, onValue, onDisconnect } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";
import { auth, db, APP_ID } from './firebase.js';
import { state } from './state.js';
import { showError, showStep } from './ui.js';

onAuthStateChanged(auth, (user) => {
    if (user) {
        state.currentUser = user;
        document.getElementById('auth-loader').classList.add('hidden');
        showStep('login');
    } else {
        signInAnonymously(auth).catch(err => {
            document.getElementById('loader-text').textContent = "Offline: " + err.message;
            document.getElementById('retry-auth-btn').classList.remove('hidden');
        });
    }
});

window.handleLogin = async () => {
    const btn = document.getElementById('login-btn');
    state.admissionNo = document.getElementById('admNo').value.trim().toUpperCase();
    if (!state.admissionNo) return showError("Admission Number is required.");

    btn.disabled = true;
    showError("");
    try {
        const regRef = ref(db, `artifacts/${APP_ID}/public/data/registrations/${state.admissionNo}`);
        const snap = await get(regRef);

        if (snap.exists() && snap.val().status === 'completed') {
            showError("Exam session already completed.");
            btn.disabled = false;
            return;
        }

        showStep('code');
    } catch (e) {
        showError(e.message);
        btn.disabled = false;
    }
};

window.handleCode = async () => {
    const btn = document.getElementById('verify-btn');
    const code = document.getElementById('passCode').value.trim().toUpperCase();
    if (!code) return showError("Enter sitting code.");

    btn.disabled = true;
    try {
        const examRef = ref(db, `artifacts/${APP_ID}/public/data/exams/${code}`);
        const snap = await get(examRef);

        if (snap.exists()) {
            state.targetExam = snap.val();

            const regRef = ref(db, `artifacts/${APP_ID}/public/data/registrations/${state.admissionNo}`);
            await set(regRef, {
                admissionNo: state.admissionNo,
                examCode: code,
                startTime: new Date().toISOString(),
                status: 'active',
                violations: 0,
                platform: state.isMobile ? 'mobile' : 'desktop'
            });
            onDisconnect(regRef).update({
                status: 'completed',
                endTime: new Date().toISOString(),
                exitType: 'auto_exit_close'
            });

            listenForFlags();
            showStep('permissions');
        } else {
            showError("Exam sitting not found.");
            btn.disabled = false;
        }
    } catch (e) {
        showError(e.message);
        btn.disabled = false;
    }
};

function listenForFlags() {
    const regRef = ref(db, `artifacts/${APP_ID}/public/data/registrations/${state.admissionNo}`);
    let lastFlagAt = null;
    onValue(regRef, (snap) => {
        const v = snap.val();
        if (v && v.flagged && v.flaggedAt && v.flaggedAt !== lastFlagAt) {
            lastFlagAt = v.flaggedAt;
            document.getElementById('flagged-reason').textContent = v.flagReason || "A proctor has flagged your session.";
            document.getElementById('flagged-modal').classList.remove('hidden');
        }
    });
}
