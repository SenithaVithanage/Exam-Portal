import { ref, update, onDisconnect } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";
import { db, APP_ID, apiKey } from './firebase.js';
import { state } from './state.js';
import { showError, showStep } from './ui.js';
import { setupMicMeter } from './media.js';
import { pushLiveFeed, runAICheck, logIncident } from './proctor.js';

window.requestPermissions = async () => {
    const btn = document.getElementById('perm-btn');
    if (!document.getElementById('consent-check').checked) return;
    showError("");
    btn.disabled = true;
    try {
        const camStream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { max: 15 } },
            audio: true
        });
        document.getElementById('video-feed').srcObject = camStream;
        setupMicMeter(camStream);

        let screenStream = null;
        if (!state.isMobile && navigator.mediaDevices.getDisplayMedia) {
            try {
                screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: { displaySurface: "monitor" }
                });
                if (screenStream.getVideoTracks()[0].getSettings().displaySurface !== 'monitor') {
                    throw new Error("You MUST share 'Entire Screen'.");
                }
                document.getElementById('screen-feed').srcObject = screenStream;
                screenStream.getVideoTracks()[0].addEventListener('ended', () => {
                    if (state.isExamActive) logIncident("SCREEN_SHARE_STOPPED", "Candidate stopped sharing their screen.");
                });
            } catch (screenErr) {
                camStream.getTracks().forEach(t => t.stop());
                throw screenErr;
            }
        } else if (state.isMobile) {
            logIncident("MOBILE_SESSION", "Student is using a mobile device. Screen proctoring disabled.");
        }

        if (!state.isMobile) await document.documentElement.requestFullscreen().catch(() => {});

        document.getElementById('exam-frame').src = state.targetExam.formUrl;
        document.getElementById('student-display').textContent = `ID: ${state.admissionNo}`;
        document.getElementById('student-display').classList.remove('hidden');
        document.getElementById('status-badge').classList.remove('hidden');

        state.isExamActive = true;
        showStep('exam');

        if (apiKey) state.proctorInterval = setInterval(() => { if (state.isExamActive) runAICheck(); }, 60000);
        state.liveFeedInterval = setInterval(() => { if (state.isExamActive) pushLiveFeed(); }, 8000);
        pushLiveFeed();
    } catch (e) {
        showError(e.message || "Permissions denied.");
        btn.disabled = false;
    }
};

window.handleExitClick = () => {
    document.getElementById('exit-modal').classList.remove('hidden');
};

window.closeExitModal = () => {
    document.getElementById('exit-modal').classList.add('hidden');
};

window.dismissFlagged = () => {
    document.getElementById('flagged-modal').classList.add('hidden');
};

window.submitExam = async (userInitiated = true) => {
    const btn = document.getElementById('submit-btn');
    if (btn) btn.disabled = true;
    state.isExamActive = false;
    clearInterval(state.proctorInterval);
    clearInterval(state.liveFeedInterval);
    if (state.audioMeterFrame) cancelAnimationFrame(state.audioMeterFrame);
    try {
        const regRef = ref(db, `artifacts/${APP_ID}/public/data/registrations/${state.admissionNo}`);
        onDisconnect(regRef).cancel();
        await update(regRef, { status: 'completed', endTime: new Date().toISOString(), exitType: userInitiated ? 'manual_exit' : 'auto_exit' });
        if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
        alert("Exam session submitted successfully.");
        window.location.reload();
    } catch (e) { showError("Database error during submission."); if (btn) btn.disabled = false; }
};

window.dismissWarning = () => {
    document.getElementById('warning-modal').classList.add('hidden');
    if (!document.fullscreenElement && state.isExamActive && !state.isMobile) {
        document.documentElement.requestFullscreen().catch(() => {});
    }
};
