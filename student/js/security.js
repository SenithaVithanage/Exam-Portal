// Lockdown behaviour: block context menu and common devtools / copy shortcuts.
document.addEventListener('contextmenu', event => event.preventDefault());

document.onkeydown = function (e) {
    const forbiddenKeys = [9, 116, 123]; // Tab, F5, F12
    if (forbiddenKeys.includes(e.keyCode)) { e.preventDefault(); return false; }
    if (e.altKey && e.keyCode === 9) { e.preventDefault(); return false; }
    if (e.ctrlKey || e.metaKey) {
        const forbiddenCombos = ['s', 'p', 'u', 'i', 'j', 'r', 'c', 'v', 'x', 'a'];
        if (forbiddenCombos.includes(e.key.toLowerCase())) { e.preventDefault(); return false; }
    }
    if (e.ctrlKey && e.shiftKey) {
        const forbiddenShiftCombos = ['i', 'j', 'c', 'k', 'm'];
        if (forbiddenShiftCombos.includes(e.key.toLowerCase())) { e.preventDefault(); return false; }
    }
};

document.getElementById('consent-check').addEventListener('change', (e) => {
    document.getElementById('perm-btn').disabled = !e.target.checked;
});
