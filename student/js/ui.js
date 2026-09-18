export const showError = (msg) => {
    const box = document.getElementById('error-box');
    if (!msg) { box.classList.add('hidden'); return; }
    document.getElementById('error-msg').textContent = msg;
    box.classList.remove('hidden');
};

export function showStep(name) {
    document.querySelectorAll('.step-container').forEach(el => el.classList.remove('active'));
    const step = document.getElementById('step-' + name);
    if (step) {
        step.classList.add('active');
        if (name === 'exam') {
            const card = document.getElementById('main-card');
            const padding = document.getElementById('content-padding');
            card.classList.replace('max-w-4xl', 'max-w-[98vw]');
            padding.classList.replace('sm:p-12', 'sm:p-4');
            padding.classList.replace('p-6', 'p-2');
        }
    }
}

// Exposed for the inline "Try again" button and for other modules that
// still expect a global (kept for parity with the original single-file app).
window.showStep = showStep;
