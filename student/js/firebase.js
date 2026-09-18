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
    appId: "1:242074333727:web:5efbad35e96137a559db2a",
    measurementId: "G-JFFWKR2MPR"
};

export const APP_ID = "secure-exam-portal"; // fixed to match the admin console

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

// Optional: Gemini API key for AI behavior scanning. Leave blank to disable.
export const apiKey = "";
