import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";

// NOTE: Firebase Web API keys are not secret — they identify the project,
// not authorize access. Access control lives in firebase-security-rules.json.
export const firebaseConfig = {
    apiKey: "AIzaSyDz9AxaaBLvmAlxeRGMFh9IgI2MCgmXCqU",
    authDomain: "project-wiz-f33d3.firebaseapp.com",
    databaseURL: "https://project-wiz-f33d3-default-rtdb.firebaseio.com",
    projectId: "project-wiz-f33d3",
    storageBucket: "project-wiz-f33d3.firebasestorage.app",
    messagingSenderId: "242074333727",
    appId: "1:242074333727:web:5efbad35e96137a559db2a"
};

export const APP_ID = "secure-exam-portal";      // must match the student portal's appId
export const EMAIL_DOMAIN = "examportal.internal"; // pseudo-domain for admin logins

export const app = initializeApp(firebaseConfig, "primary");
export const auth = getAuth(app);
export const db = getDatabase(app);

// Secondary app instance so creating a new admin doesn't hijack the current session.
export const secondaryApp = initializeApp(firebaseConfig, "secondary");
export const secondaryAuth = getAuth(secondaryApp);

export const toEmail = (id) => `${id.trim().toLowerCase()}@${EMAIL_DOMAIN}`;
