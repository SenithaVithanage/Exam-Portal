# Secure Exam Portal

A lightweight, real-time exam proctoring system built with vanilla JS and Firebase.

Candidates check in with an admission number and sitting code, consent to camera
and microphone monitoring, and take their exam in an embedded form while the app
watches for tab switches, lost focus, and fullscreen exits. Proctors get a live
console showing every participant's status, periodic camera snapshots, a
microphone activity indicator, and a running incident log — with the ability to
flag a session or force-end it on the spot.

## Features

- 🎫 Candidate check-in flow with admission number + sitting code verification
- 📷 Camera and microphone consent + monitoring, with periodic live snapshots
- 🖥️ Desktop screen-share enforcement and mobile-aware fallback
- 🚨 Automatic violation detection: tab switches, focus loss, fullscreen exits
- 🤖 Optional AI-assisted behavior scanning (pluggable via Gemini API key)
- 🛡️ Admin console with participant grid, live feed viewer, flagging, and
  incident log
- 👥 Role-based admin accounts (superadmin can create/remove other admins)
- 🔐 Firebase Realtime Database with security rules included

## Tech stack

- Vanilla HTML/CSS/JS (ES modules, no build step)
- Tailwind CSS (CDN)
- Firebase Authentication + Realtime Database

## Project structure

See the file tree below — the student check-in app and the admin console are
separate front ends under `student/` and `admin/`, each split into focused
modules (auth, state, UI, proctoring, etc.) rather than one large HTML file.

## Getting started

Both apps use ES modules, so they need to be served over HTTP rather than
opened directly as `file://`:

\`\`\`bash
cd secure-exam-portal
python3 -m http.server 8000
# student portal: http://localhost:8000/student/
# admin console:  http://localhost:8000/admin/
\`\`\`

Deploy `firebase-security-rules.json` to your Firebase project's Realtime
Database rules before going live.

## ⚠️ Disclaimer

This is a student/educational project demonstrating browser-based proctoring
techniques (camera/mic access, tab/focus monitoring, screen capture). It is
not a production-grade exam security product — review the privacy, legal,
and accessibility implications of monitoring students before using it in a
real assessment.
