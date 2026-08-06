/**
 * script.js — точка входа и управление экранами приложения.
 */

const App = {
  currentWorkout: [],
  currentIndex: 0,
  currentDateKey: null,
  timer: null,
  autoAdvanceTimeout: null,
  audioCtx: null,

  init() {
    this.els = {
      calendarContainer: document.getElementById('calendar-container'),
      heroGreeting: document.getElementById('hero-greeting'),
      heroSubtitle: document.getElementById('hero-subtitle'),
      streakValue: document.getElementById('streak-value'),
      statTotal: document.getElementById('stat-total'),
      statStreak: document.getElementById('stat-streak'),
      statBest: document.getElementById('stat-best'),
      statLast: document.getElementById('stat-last'),
      progressFill: document.getElementById('progress-fill'),
      progressPercent: document.getElementById('progress-percent'),
      progressCaption: document.getElementById('progress-caption'),
      screenCalendar: document.getElementById('screen-calendar'),
      screenWorkout: document.getElementById('screen-workout'),
      screenCelebration: document.getElementById('screen-celebration'),
      workoutProgressLabel: document.getElementById('workout-progress-label'),
      workoutProgressFill: document.getElementById('workout-progress-fill'),
      exerciseCard: document.getElementById('exercise-card'),
      workoutBack: document.getElementById('workout-back'),
      soundToggle: document.getElementById('sound-toggle'),
      celebrationContinue: document.getElementById('celebration-continue'),
      confettiCanvas: document.getElementById('confetti-canvas'),
    };

    this.els.workoutBack.addEventListener('click', () => this.exitWorkout());
    this.els.soundToggle.addEventListener('click', () => this.toggleSound());
    this.els.celebrationContinue.addEventListener('click', () => this.showScreen('calendar'));

    this.renderSoundToggle();
    this.renderCalendarScreen();
    this.showScreen('calendar');

    window.addEventListener('resize', () => this.resizeConfettiCanvas());
    this.resizeConfettiCanvas();
  },

  // ── Экраны ────────────────────────────────────────────────────

  showScreen(name) {
    this.els.screenCalendar.classList.toggle('screen--hidden', name !== 'calendar');
    this.els.screenWorkout.classList.toggle('screen--hidden', name !== 'workout');
    this.els.screenCelebration.classList.toggle('screen--hidden', name !== 'celebration');
    if (name === 'calendar') this.renderCalendarScreen();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // ── Главный экран ─────────────────────────────────────────────

  renderCalendarScreen() {
    const streak = Storage.getCurrentStreak();
    const total = Storage.getTotalWorkouts();
    const best = Storage.getBestStreak();
    const last = Storage.getLastWorkoutDate();
    const monthProgress = Storage.getMonthProgress();
    const todayDone = Storage.isDayComplete(todayKey());

    this.els.heroGreeting.textContent = todayDone
      ? 'Сегодняшняя тренировка уже сделана!'
      : 'Доброе утро!';
    this.els.heroSubtitle.textContent = todayDone
      ? 'Вы большая молодец. Возвращайтесь завтра за новой тренировкой.'
      : 'Всего 10–15 минут лёгкой разминки помогут телу почувствовать себя лучше.';
    this.els.streakValue.textContent = `${streak} ${pluralDays(streak)}`;

    this.els.statTotal.textContent = String(total);
    this.els.statStreak.textContent = String(streak);
    this.els.statBest.textContent = String(best);
    this.els.statLast.textContent = last ? formatHumanDate(last) : '—';

    const percent = Math.round(monthProgress.ratio * 100);
    this.els.progressFill.style.width = `${percent}%`;
    this.els.progressPercent.textContent = `${percent}%`;
    this.els.progressCaption.textContent =
      `Выполнено ${monthProgress.completed} из ${monthProgress.total} дней в этом месяце`;

    Calendar.render(this.els.calendarContainer, {
      onDayOpen: (key) => this.openWorkout(key),
    });
  },

  // ── Экран тренировки ──────────────────────────────────────────

  openWorkout(dateKey) {
    if (Storage.isDayComplete(dateKey)) return; // на всякий случай
    this.currentDateKey = dateKey;
    this.currentWorkout = generateWorkoutForDate(dateKey);
    this.currentIndex = 0;
    this.showScreen('workout');
    this.renderCurrentExercise();
  },

  exitWorkout() {
    if (this.timer) this.timer.stop();
    clearTimeout(this.autoAdvanceTimeout);
    if (this.currentIndex > 0 && this.currentIndex < this.currentWorkout.length) {
      const confirmed = confirm('Прервать тренировку? Прогресс за сегодня не сохранится.');
      if (!confirmed) return;
    }
    this.showScreen('calendar');
  },

  renderCurrentExercise() {
    clearTimeout(this.autoAdvanceTimeout);
    const total = this.currentWorkout.length;
    const exercise = this.currentWorkout[this.currentIndex];
    const meta = CATEGORY_META[exercise.category];

    this.els.workoutProgressLabel.textContent = `Упражнение ${this.currentIndex + 1} из ${total}`;
    this.els.workoutProgressFill.style.width = `${((this.currentIndex) / total) * 100}%`;

    this.els.exerciseCard.innerHTML = `
      <div class="exercise-figure-wrap">
        <div class="exercise-figure cat-${exercise.category}" id="exercise-figure"></div>
      </div>
      <div class="exercise-card__category">${meta.icon} ${meta.label}</div>
      <h2 class="exercise-card__name">${exercise.name}</h2>
      <p class="exercise-card__description">${exercise.description}</p>
      <div class="timer-ring-wrap" id="timer-wrap"></div>
      <div class="exercise-controls" id="exercise-controls">
        <button type="button" class="btn btn--ghost" id="btn-pause">⏸ Пауза</button>
        <button type="button" class="btn btn--ghost" id="btn-skip">Пропустить упражнение</button>
      </div>
      <div class="exercise-next-hint" id="next-hint"></div>
    `;

    renderExerciseFigure(document.getElementById('exercise-figure'), exercise.category, exercise.gifUrl);

    const timerWrap = document.getElementById('timer-wrap');
    this.playChime('start');

    this.timer = new CircularTimer(timerWrap, {
      duration: exercise.duration,
      onTick: () => {},
      onComplete: () => this.onExerciseFinished(),
    });
    this.timer.start();

    const btnPause = document.getElementById('btn-pause');
    btnPause.addEventListener('click', () => {
      if (this.timer.paused) {
        this.timer.resume();
        btnPause.textContent = '⏸ Пауза';
      } else {
        this.timer.pause();
        btnPause.textContent = '▶ Продолжить';
      }
    });

    document.getElementById('btn-skip').addEventListener('click', () => {
      this.timer.skip();
    });
  },

  onExerciseFinished() {
    this.playChime('done');
    const isLast = this.currentIndex >= this.currentWorkout.length - 1;
    const controls = document.getElementById('exercise-controls');
    const hint = document.getElementById('next-hint');

    controls.innerHTML = `
      <button type="button" class="btn btn--primary btn--wide" id="btn-next">
        ${isLast ? '🎉 Завершить тренировку' : 'Следующее упражнение →'}
      </button>
    `;
    let secondsLeft = 3;
    hint.textContent = `Автоматически продолжится через ${secondsLeft} сек…`;

    const tick = setInterval(() => {
      secondsLeft -= 1;
      if (secondsLeft > 0) {
        hint.textContent = `Автоматически продолжится через ${secondsLeft} сек…`;
      } else {
        clearInterval(tick);
      }
    }, 1000);

    const goNext = () => {
      clearInterval(tick);
      clearTimeout(this.autoAdvanceTimeout);
      this.advance();
    };

    document.getElementById('btn-next').addEventListener('click', goNext);
    this.autoAdvanceTimeout = setTimeout(goNext, 3000);
  },

  advance() {
    if (this.currentIndex >= this.currentWorkout.length - 1) {
      this.completeWorkout();
      return;
    }
    this.currentIndex += 1;
    this.renderCurrentExercise();
  },

  completeWorkout() {
    const ids = this.currentWorkout.map(e => e.id);
    Storage.markDayComplete(this.currentDateKey, ids);
    this.showCelebration();
  },

  showCelebration() {
    const streak = Storage.getCurrentStreak();
    document.getElementById('celebration-streak').textContent =
      streak > 1 ? `🔥 Серия продолжается: ${streak} ${pluralDays(streak)} подряд!` : '🔥 Серия начата! Так держать.';
    this.showScreen('celebration');
    this.launchConfetti();
    this.playChime('celebrate');
  },

  // ── Звук ──────────────────────────────────────────────────────

  renderSoundToggle() {
    this.els.soundToggle.textContent = Storage.isSoundEnabled() ? '🔊' : '🔈';
  },

  toggleSound() {
    Storage.setSoundEnabled(!Storage.isSoundEnabled());
    this.renderSoundToggle();
  },

  playChime(kind) {
    if (!Storage.isSoundEnabled()) return;
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = this.audioCtx;
      const notesByKind = {
        start: [523.25],
        done: [659.25, 783.99],
        celebrate: [523.25, 659.25, 783.99, 1046.5],
      };
      const notes = notesByKind[kind] || [523.25];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const startTime = ctx.currentTime + i * 0.14;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
        osc.connect(gain).connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.32);
      });
    } catch (err) {
      // Тихо игнорируем — звук необязателен для работы приложения.
    }
  },

  // ── Конфетти ──────────────────────────────────────────────────

  resizeConfettiCanvas() {
    const canvas = this.els.confettiCanvas;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  },

  launchConfetti() {
    const canvas = this.els.confettiCanvas;
    const ctx = canvas.getContext('2d');
    const colors = ['#8EA478', '#E9A23B', '#F3C563', '#D98770', '#66805A'];
    const particles = Array.from({ length: 130 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.4,
      size: 6 + Math.random() * 6,
      speedY: 2 + Math.random() * 3,
      speedX: (Math.random() - 0.5) * 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    const startTime = performance.now();
    const duration = 2600;

    const frame = (now) => {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      });
      if (elapsed < duration) {
        requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    requestAnimationFrame(frame);
  },
};

function pluralDays(n) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'день';
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'дня';
  return 'дней';
}

document.addEventListener('DOMContentLoaded', () => App.init());
