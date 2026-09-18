import { ref, set, update, push } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";
import { db, APP_ID, apiKey } from './firebase.js';
import { state } from './state.js';
import { getFrame, currentMicLevel } from './media.js';

export async function pushLiveFeed() {
    try {
        const camFrame = getFrame('video-feed');
        if (!camFrame) return;
        await set(ref(db, `artifacts/${APP_ID}/public/data/liveFeed/${state.admissionNo}`), {
            camFrame,
            micLevel: currentMicLevel(),
            timestamp: new Date().toISOString()
        });
    } catch (e) { console.error("live feed push failed:", e); }
}

export const verifyViolation = (type, message) => {
    if (!state.isExamActive) return;
    if (state.focusCheckTimeout) clearTimeout(state.focusCheckTimeout);

    state.focusCheckTimeout = setTimeout(() => {
        const isStillViolating = (type === 'WINDOW_BLUR' && !document.hasFocus()) ||
                                 (type === 'EXIT_FULLSCREEN' && !document.fullscreenElement) ||
                                 (type === 'TAB_SWITCH' && document.hidden);

        if (isStillViolating) {
            logIncident(type, message);
            document.getElementById('warning-reason').textContent = message;
            document.getElementById('warning-modal').classList.remove('hidden');
        }
    }, 2500);
};

document.addEventListener('fullscreenchange', () => { if (state.isExamActive && !state.isMobile) verifyViolation("EXIT_FULLSCREEN", "Fullscreen exit detected."); });
document.addEventListener('visibilitychange', () => { if (document.hidden && state.isExamActive) verifyViolation("TAB_SWITCH", "Tab switch detected."); });
window.addEventListener('blur', () => { if (state.isExamActive) verifyViolation("WINDOW_BLUR", "Focus loss detected."); });

export async function runAICheck() {
    if (!apiKey || !state.isExamActive) return;
    const badge = document.getElementById('status-badge');
    badge.textContent = 'AI SCANNING...';
    try {
        const cam = getFrame('video-feed');
        const scr = !state.isMobile ? getFrame('screen-feed') : null;

        const parts = [
            { text: "AI Proctor: Examine behavior. Respond ONLY JSON: {\"isCheating\": boolean, \"reason\": \"string\"}" },
            { inlineData: { mimeType: "image/jpeg", data: cam } }
        ];
        if (scr) parts.push({ inlineData: { mimeType: "image/jpeg", data: scr } });

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts }] })
        });
        const data = await res.json();
        const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!resultText) return;
        const result = JSON.parse(resultText);
        if (result.isCheating && state.isExamActive) {
            logIncident("AI_DETECTION", result.reason);
            document.getElementById('warning-reason').textContent = result.reason;
            document.getElementById('warning-modal').classList.remove('hidden');
        } else {
            badge.textContent = 'STATUS: SECURE';
            badge.classList.remove('bg-red-500');
            badge.classList.add('bg-green-500');
        }
    } catch (e) { console.error("AI node lag:", e); }
}

export async function logIncident(type, reason) {
    state.warnings++;
    const badge = document.getElementById('status-badge');
    badge.textContent = 'VIOLATION DETECTED';
    badge.classList.remove('bg-green-500');
    badge.classList.add('bg-red-500', 'animate-pulse');
    try {
        await push(ref(db, `artifacts/${APP_ID}/public/data/incidents`), {
            admissionNo: state.admissionNo, type, reason, timestamp: new Date().toISOString(), warningCount: state.warnings, source: 'system'
        });
        await update(ref(db, `artifacts/${APP_ID}/public/data/registrations/${state.admissionNo}`), {
            violations: state.warnings
        });
    } catch (e) { console.error(e); }
}
