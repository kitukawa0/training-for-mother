// script.js — точка входа приложения: переключение экранов, ход тренировки, звук, конфетти

const screens = {
  calendar: qs('#screen-calendar'),
  difficulty: qs('#screen-difficulty'),
  workout: qs('#screen-workout'),
  complete: qs('#screen-complete'),
};

let pendingDateKey = null;
let activeWorkout = { dateKey: null, difficulty: null, exercises: [], index: 0, poolSize: 0, roundsTotal: 0 };
let autoAdvanceTimer = null;

function showScreen(name) {
  Object.entries(screens).forEach(([key, el]) => {
    el.classList.toggle('screen--active', key === name);
  });
}

/* ---------- Календарь → выбор сложности ---------- */

function onDayClick(dateKey, status) {
  if (status === 'completed') {
    showCompletedDayInfo(dateKey);
    return;
  }
  pendingDateKey = dateKey;
  qs('#difficultyDateLabel').textContent = formatReadableDate(keyToDate(dateKey));
  qs('#easyDurationHint').textContent = formatMinutesApprox(getWorkoutTotalSeconds(generateWorkout('easy')));
  qs('#hardDurationHint').textContent = formatMinutesApprox(getWorkoutTotalSeconds(generateWorkout('hard')));
  showScreen('difficulty');
}

function showCompletedDayInfo(dateKey) {
  const record = getState().completedDays[dateKey];
  if (!record) return;
  const uniqueNames = [...new Set(record.exerciseIds)]
    .map(id => EXERCISES.find(ex => ex.id === id)?.name)
    .filter(Boolean);
  const diffLabel = record.difficulty === 'hard' ? 'тяжёлая' : 'лёгкая';
  const toast = qs('#toast');
  toast.innerHTML = `✅ <strong>${formatReadableDate(keyToDate(dateKey))}</strong> · ${diffLabel}: ${uniqueNames.join(', ')}`;
  toast.classList.add('toast--visible');
  clearTimeout(showCompletedDayInfo._timer);
  showCompletedDayInfo._timer = setTimeout(() => toast.classList.remove('toast--visible'), 4500);
}

/* ---------- Ход тренировки ---------- */

function chooseDifficulty(difficulty) {
  const exercises = generateWorkout(difficulty);
  activeWorkout = {
    dateKey: pendingDateKey,
    difficulty,
    exercises,
    index: 0,
    poolSize: getDifficultyPool(difficulty).length,
    roundsTotal: ROUNDS[difficulty] || 1,
  };
  showScreen('workout');
  renderCurrentExercise();
}

function renderCurrentExercise() {
  clearInterval(autoAdvanceTimer);
  const { exercises, index, poolSize, roundsTotal } = activeWorkout;
  const exercise = exercises[index];
  const round = Math.floor(index / poolSize) + 1;
  const posInRound = (index % poolSize) + 1;

  qs('#exerciseName').textContent = exercise.name;
  qs('#exerciseDescription').textContent = exercise.description;
  qs('#exerciseCounter').textContent = `Круг ${round} из ${roundsTotal} · Упражнение ${posInRound} из ${poolSize}`;
  qs('#exerciseIconFallback').textContent = exercise.icon || '🏃';

  const equipmentEl = qs('#exerciseEquipment');
  equipmentEl.textContent = exercise.equipment ? `🧰 Понадобится: ${exercise.equipment}` : '';
  equipmentEl.hidden = !exercise.equipment;

  qs('#nextExerciseBtn').classList.remove('is-visible');
  qs('#autoAdvanceHint').textContent = '';

  loadExerciseVideo(exercise);

  qs('#timerContainer').innerHTML = buildTimerSVG();
  qs('#pauseExerciseBtn').textContent = '⏸️ Пауза';
  startTimer(exercise.duration, onExerciseTimerComplete);

  updateWorkoutProgressDots();
}

/** Пробует .mp4, затем .mov — на случай, если видео сохранено прямо с телефона.
 *  Если не нашлось ни одного файла — остаётся иконка-заглушка. */
function loadExerciseVideo(exercise) {
  const video = qs('#exerciseVideo');
  const fallback = qs('#exerciseVideoFallback');
  const candidates = getVideoCandidates(exercise);
  let attempt = 0;

  video.pause();
  video.removeAttribute('src');
  video.classList.remove('is-visible');
  fallback.classList.remove('is-visible');

  video.oncanplay = () => {
    video.classList.add('is-visible');
    fallback.classList.remove('is-visible');
    video.play().catch(() => {});
  };
  video.onerror = tryNextCandidate;

  function tryNextCandidate() {
    if (attempt >= candidates.length) {
      fallback.classList.add('is-visible');
      video.classList.remove('is-visible');
      return;
    }
    video.src = candidates[attempt];
    attempt++;
    video.load();
  }

  tryNextCandidate();
}

function updateWorkoutProgressDots() {
  const container = qs('#workoutProgressDots');
  container.innerHTML = '';
  activeWorkout.exercises.forEach((_, i) => {
    const classes = ['progress-dot'];
    if (i < activeWorkout.index) classes.push('progress-dot--done');
    if (i === activeWorkout.index) classes.push('progress-dot--active');
    container.appendChild(createEl('span', classes.join(' ')));
  });
}

function onExerciseTimerComplete() {
  playSound('complete');
  qs('#nextExerciseBtn').classList.add('is-visible');
  let countdown = 3;
  qs('#autoAdvanceHint').textContent = `Далее через ${countdown}…`;
  autoAdvanceTimer = setInterval(() => {
    countdown--;
    if (countdown <= 0) {
      clearInterval(autoAdvanceTimer);
      goToNextExercise();
    } else {
      qs('#autoAdvanceHint').textContent = `Далее через ${countdown}…`;
    }
  }, 1000);
}

function goToNextExercise() {
  clearInterval(autoAdvanceTimer);
  activeWorkout.index++;
  if (activeWorkout.index >= activeWorkout.exercises.length) {
    finishWorkout();
  } else {
    renderCurrentExercise();
  }
}

function skipCurrentExercise() {
  stopTimer();
  goToNextExercise();
}

function exitWorkout() {
  stopTimer();
  clearInterval(autoAdvanceTimer);
  showScreen('calendar');
}

function finishWorkout() {
  stopTimer();
  const ids = activeWorkout.exercises.map(ex => ex.id);
  completeDay(activeWorkout.dateKey, activeWorkout.difficulty, ids);
  playSound('celebrate');
  showScreen('complete');
  launchConfetti();
  renderCalendar();
}

function backToCalendarFromComplete() {
  showScreen('calendar');
  renderCalendar();
}

/* ---------- Звук (генерируется на лету, без внешних файлов) ---------- */

let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playSound(type) {
  if (!getState().soundEnabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const notes = type === 'celebrate' ? [523.25, 659.25, 783.99, 1046.5] : [880, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + i * 0.09);
      gain.gain.linearRampToValueAtTime(0.15, now + i * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.25);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.09);
      osc.stop(now + i * 0.09 + 0.3);
    });
  } catch (err) {
    console.warn('Звук недоступен в этом браузере.', err);
  }
}

function updateSoundToggleUI() {
  qs('#soundToggleBtn').textContent = getState().soundEnabled ? '🔊' : '🔇';
}

function toggleSound() {
  setSoundEnabled(!getState().soundEnabled);
  updateSoundToggleUI();
}

/* ---------- Конфетти при завершении тренировки ---------- */

function launchConfetti() {
  const canvas = qs('#confettiCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const colors = ['#FF8C69', '#6FAE8C', '#FFC94D', '#7EC4CF', '#F4A6A0'];
  const pieces = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height * 0.5,
    size: 6 + Math.random() * 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    speedY: 2 + Math.random() * 3,
    speedX: -1.5 + Math.random() * 3,
    rotation: Math.random() * 360,
    rotationSpeed: -6 + Math.random() * 12,
  }));

  let frame = 0;
  const maxFrames = 220;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.rotationSpeed;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });
    frame++;
    if (frame < maxFrames) {
      requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  draw();
}

/* ---------- Инициализация ---------- */

function toggleTimerPause() {
  if (isTimerPaused()) {
    resumeTimer();
    qs('#pauseExerciseBtn').textContent = '⏸️ Пауза';
  } else {
    pauseTimer();
    qs('#pauseExerciseBtn').textContent = '▶️ Продолжить';
  }
}

function init() {
  qs('#prevMonthBtn').addEventListener('click', () => changeCalendarMonth(-1));
  qs('#nextMonthBtn').addEventListener('click', () => changeCalendarMonth(1));
  qs('#todayBtn').addEventListener('click', goToCurrentMonth);
  qs('#cancelDifficultyBtn').addEventListener('click', () => showScreen('calendar'));
  qs('#chooseEasyBtn').addEventListener('click', () => chooseDifficulty('easy'));
  qs('#chooseHardBtn').addEventListener('click', () => chooseDifficulty('hard'));
  qs('#exitWorkoutBtn').addEventListener('click', exitWorkout);
  qs('#pauseExerciseBtn').addEventListener('click', toggleTimerPause);
  qs('#skipExerciseBtn').addEventListener('click', skipCurrentExercise);
  qs('#nextExerciseBtn').addEventListener('click', goToNextExercise);
  qs('#finishCompleteBtn').addEventListener('click', backToCalendarFromComplete);
  qs('#soundToggleBtn').addEventListener('click', toggleSound);

  updateSoundToggleUI();
  renderCalendar();
}

document.addEventListener('DOMContentLoaded', init);
