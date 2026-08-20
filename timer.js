// timer.js — круговой таймер обратного отсчёта для текущего упражнения

const TIMER_RADIUS = 90;
const TIMER_CIRCUMFERENCE = 2 * Math.PI * TIMER_RADIUS;

let timerInterval = null;
let timerState = { remaining: 0, total: 0, paused: false, onComplete: null };

function buildTimerSVG() {
  return `
    <svg class="timer-ring" viewBox="0 0 200 200">
      <circle class="timer-ring__bg" cx="100" cy="100" r="${TIMER_RADIUS}"></circle>
      <circle class="timer-ring__progress" cx="100" cy="100" r="${TIMER_RADIUS}"
        stroke-dasharray="${TIMER_CIRCUMFERENCE}" stroke-dashoffset="0"></circle>
    </svg>
    <div class="timer-ring__label"><span id="timerSeconds">0</span></div>
  `;
}

function startTimer(durationSeconds, onComplete) {
  stopTimer();
  timerState = { remaining: durationSeconds, total: durationSeconds, paused: false, onComplete };
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    if (timerState.paused) return;
    timerState.remaining--;
    updateTimerDisplay();
    if (timerState.remaining <= 0) {
      stopTimer();
      if (typeof timerState.onComplete === 'function') timerState.onComplete();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const { remaining, total } = timerState;
  const progressEl = qs('.timer-ring__progress');
  const secondsEl = qs('#timerSeconds');
  if (progressEl) {
    const fraction = total > 0 ? remaining / total : 0;
    progressEl.style.strokeDashoffset = String(TIMER_CIRCUMFERENCE * (1 - fraction));
  }
  if (secondsEl) secondsEl.textContent = Math.max(0, remaining);
}

function pauseTimer() { timerState.paused = true; }
function resumeTimer() { timerState.paused = false; }
function isTimerPaused() { return timerState.paused; }

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}
