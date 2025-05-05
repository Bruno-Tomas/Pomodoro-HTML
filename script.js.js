document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const timerDisplay = document.getElementById('timer');
    const timerMode = document.getElementById('timer-mode');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const skipBtn = document.getElementById('skip-btn');
    const resetBtn = document.getElementById('reset-btn');
    const progressBar = document.getElementById('progress-bar');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const saveSettingsBtn = document.getElementById('save-settings');
    const closeSettingsBtn = document.getElementById('close-settings');
    const pomodoroTimeInput = document.getElementById('pomodoro-time');
    const breakTimeInput = document.getElementById('break-time');
    const alarmSound = document.getElementById('alarm-sound');
    const currentDate = document.getElementById('current-date');
    const currentTime = document.getElementById('current-time');
    const themeBtn = document.getElementById('theme-btn');
    const body = document.body;

    // Variables de estado
    let pomodoroTime = 25 * 60;
    let breakTime = 5 * 60;
    let timeLeft = pomodoroTime;
    let timerInterval;
    let isRunning = false;
    let isPomodoro = true;
    let totalTime = pomodoroTime;
    let isDarkTheme = false;

    // Inicializar
    updateDisplay();
    updateDateTime();
    setInterval(updateDateTime, 1000);
    checkThemePreference();

    // Event listeners
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    skipBtn.addEventListener('click', skipTimer);
    resetBtn.addEventListener('click', resetTimer);
    settingsBtn.addEventListener('click', openSettings);
    saveSettingsBtn.addEventListener('click', saveSettings);
    closeSettingsBtn.addEventListener('click', closeSettings);
    themeBtn.addEventListener('click', toggleTheme);

    function updateDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const progress = (timeLeft / totalTime) * 100;
        progressBar.style.width = `${progress}%`;
    }

    function startTimer() {
        if (!isRunning) {
            isRunning = true;
            startBtn.classList.add('active');
            pauseBtn.classList.remove('active');
            
            timerInterval = setInterval(() => {
                timeLeft--;
                updateDisplay();
                
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    isRunning = false;
                    startBtn.classList.remove('active');
                    alarmSound.play();
                    showNotification();
                    switchMode();
                }
            }, 1000);
        }
    }

    function pauseTimer() {
        if (isRunning) {
            clearInterval(timerInterval);
            isRunning = false;
            startBtn.classList.remove('active');
            pauseBtn.classList.add('active');
        }
    }

    function skipTimer() {
        clearInterval(timerInterval);
        isRunning = false;
        startBtn.classList.remove('active');
        pauseBtn.classList.remove('active');
        alarmSound.play();
        showNotification();
        switchMode();
    }

    function resetTimer() {
        pauseTimer();
        isPomodoro = true;
        timeLeft = pomodoroTime;
        totalTime = pomodoroTime;
        updateModeDisplay();
        updateDisplay();
    }

    function switchMode() {
        isPomodoro = !isPomodoro;
        timeLeft = isPomodoro ? pomodoroTime : breakTime;
        totalTime = timeLeft;
        updateModeDisplay();
        updateDisplay();
        if (isRunning) {
            startTimer();
        }
    }

    function updateModeDisplay() {
        timerMode.textContent = isPomodoro ? 'Pomodoro' : 'Descanso';
        if (isPomodoro) {
            body.classList.remove('break-mode');
            body.classList.add('pomodoro-mode');
        } else {
            body.classList.remove('pomodoro-mode');
            body.classList.add('break-mode');
        }
    }

    function openSettings() {
        pauseTimer();
        pomodoroTimeInput.value = pomodoroTime / 60;
        breakTimeInput.value = breakTime / 60;
        settingsModal.style.display = 'flex';
    }

    function closeSettings() {
        settingsModal.style.display = 'none';
    }

    function saveSettings() {
        const newPomodoroTime = parseInt(pomodoroTimeInput.value) * 60;
        const newBreakTime = parseInt(breakTimeInput.value) * 60;
        
        if (newPomodoroTime > 0 && newBreakTime > 0) {
            pomodoroTime = newPomodoroTime;
            breakTime = newBreakTime;
            
            if (isPomodoro) {
                timeLeft = pomodoroTime;
                totalTime = pomodoroTime;
            }
            
            updateDisplay();
            closeSettings();
        }
    }

    function showNotification() {
        const title = isPomodoro ? '¡Pomodoro completado!' : '¡Descanso terminado!';
        const options = {
            body: isPomodoro ? 'Es hora de un descanso.' : 'Es hora de volver al trabajo.',
            icon: 'https://cdn-icons-png.flaticon.com/512/2829/2829033.png'
        };
        
        if (Notification.permission === 'granted') {
            new Notification(title, options);
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification(title, options);
                }
            });
        }
    }

    function updateDateTime() {
        const now = new Date();
        
        // Ajustar a la hora de Argentina (UTC-3)
        const argentinaOffset = -3 * 60;
        const localOffset = now.getTimezoneOffset();
        const argentinaTime = new Date(now.getTime() + (localOffset + argentinaOffset) * 60000);
        
        const optionsDate = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        const optionsTime = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        
        currentDate.textContent = argentinaTime.toLocaleDateString('es-AR', optionsDate);
        currentTime.textContent = argentinaTime.toLocaleTimeString('es-AR', optionsTime);
    }

    function toggleTheme() {
        isDarkTheme = !isDarkTheme;
        if (isDarkTheme) {
            body.classList.add('dark-theme');
            body.classList.remove('light-theme');
            themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            body.classList.add('light-theme');
            body.classList.remove('dark-theme');
            themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
        }
        localStorage.setItem('themePreference', isDarkTheme ? 'dark' : 'light');
    }

    function checkThemePreference() {
        const savedTheme = localStorage.getItem('themePreference');
        if (savedTheme === 'dark') {
            isDarkTheme = true;
            body.classList.add('dark-theme');
            body.classList.remove('light-theme');
            themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            isDarkTheme = false;
            body.classList.add('light-theme');
            body.classList.remove('dark-theme');
            themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }

    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
});