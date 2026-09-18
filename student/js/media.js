import { state } from './state.js';

export function setupMicMeter(stream) {
    try {
        state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        state.analyser = state.audioContext.createAnalyser();
        state.analyser.fftSize = 512;
        state.micSource = state.audioContext.createMediaStreamSource(stream);
        state.micSource.connect(state.analyser);
        state.micDataArray = new Uint8Array(state.analyser.frequencyBinCount);
        tickMicMeter();
    } catch (e) { console.error("Mic meter unavailable:", e); }
}

export function tickMicMeter() {
    if (!state.analyser) return;
    state.analyser.getByteFrequencyData(state.micDataArray);
    const avg = state.micDataArray.reduce((a, b) => a + b, 0) / state.micDataArray.length;
    const pct = Math.min(100, Math.round((avg / 128) * 100));
    const bar = document.getElementById('mic-bar');
    if (bar) bar.style.width = pct + '%';
    state.audioMeterFrame = requestAnimationFrame(tickMicMeter);
}

export function currentMicLevel() {
    if (!state.analyser || !state.micDataArray) return 0;
    state.analyser.getByteFrequencyData(state.micDataArray);
    const avg = state.micDataArray.reduce((a, b) => a + b, 0) / state.micDataArray.length;
    return Math.min(100, Math.round((avg / 128) * 100));
}

export function getFrame(id) {
    const v = document.getElementById(id);
    if (!v || !v.videoWidth) return "";
    const c = document.createElement('canvas');
    const scale = state.isMobile ? 0.1 : 0.25;
    c.width = v.videoWidth * scale;
    c.height = v.videoHeight * scale;
    c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.4).split(',')[1];
}
