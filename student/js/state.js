export const state = {
    admissionNo: '',
    targetExam: null,
    warnings: 0,
    currentUser: null,
    proctorInterval: null,
    liveFeedInterval: null,
    audioMeterFrame: null,
    isExamActive: false,
    focusCheckTimeout: null,
    isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
    audioContext: null,
    analyser: null,
    micSource: null,
    micDataArray: null
};
