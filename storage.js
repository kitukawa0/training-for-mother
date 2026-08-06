/**
 * storage.js — вся работа с localStorage спрятана здесь.
 * Остальной код никогда не трогает localStorage напрямую.
 */

const STORAGE_KEY = 'homeWorkoutCalendar.v1';

const DEFAULT_STATE = {
  completedDays: {},   // { "2026-08-06": { completedAt: ISOString, exerciseIds: [...] } }
  bestStreak: 0,
  soundEnabled: true,
};

const Storage = {
  _cache: null,

  /** Загружает состояние из localStorage (с кэшированием на время сессии). */
  load() {
    if (this._cache) return this._cache;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this._cache = structuredCloneState(DEFAULT_STATE);
        return this._cache;
      }
      const parsed = JSON.parse(raw);
      this._cache = { ...structuredCloneState(DEFAULT_STATE), ...parsed };
      return this._cache;
    } catch (err) {
      console.warn('Не удалось прочитать сохранённый прогресс, начинаем заново.', err);
      this._cache = structuredCloneState(DEFAULT_STATE);
      return this._cache;
    }
  },

  /** Сохраняет текущее состояние в localStorage. */
  _persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._cache));
    } catch (err) {
      console.warn('Не удалось сохранить прогресс.', err);
    }
  },

  /** Отмечает день как выполненный со списком упражнений. */
  markDayComplete(dateKey, exerciseIds) {
    const state = this.load();
    state.completedDays[dateKey] = {
      completedAt: new Date().toISOString(),
      exerciseIds,
    };
    const streak = this.getCurrentStreak();
    if (streak > state.bestStreak) state.bestStreak = streak;
    this._persist();
  },

  /** Правда, если конкретный день отмечен выполненным. */
  isDayComplete(dateKey) {
    return Boolean(this.load().completedDays[dateKey]);
  },

  /** Список упражнений, выполненных в конкретный день (или null). */
  getDayRecord(dateKey) {
    return this.load().completedDays[dateKey] || null;
  },

  /**
   * Текущая серия дней подряд.
   * Если сегодняшний день выполнен — считаем от сегодня назад.
   * Если ещё не выполнен — считаем от вчера назад (серия ещё "жива",
   * но сгорит, если сегодня закончится без тренировки).
   */
  getCurrentStreak() {
    const state = this.load();
    const today = todayKey();
    let cursor = state.completedDays[today] ? today : shiftKey(today, -1);
    let streak = 0;
    while (state.completedDays[cursor]) {
      streak += 1;
      cursor = shiftKey(cursor, -1);
    }
    return streak;
  },

  /** Лучшая серия за всё время. */
  getBestStreak() {
    const state = this.load();
    return Math.max(state.bestStreak, this.getCurrentStreak());
  },

  /** Общее количество выполненных тренировок. */
  getTotalWorkouts() {
    return Object.keys(this.load().completedDays).length;
  },

  /** Ключ даты последней выполненной тренировки, либо null. */
  getLastWorkoutDate() {
    const keys = Object.keys(this.load().completedDays).sort();
    return keys.length ? keys[keys.length - 1] : null;
  },

  /** Доля выполненных дней в текущем месяце от уже прошедших дней месяца (0..1). */
  getMonthProgress() {
    const state = this.load();
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysElapsed = today.getDate(); // с 1 числа по сегодня включительно
    let completed = 0;
    for (let d = 1; d <= daysElapsed; d++) {
      const key = dateToKey(new Date(year, month, d));
      if (state.completedDays[key]) completed += 1;
    }
    return { completed, total: daysElapsed, ratio: daysElapsed ? completed / daysElapsed : 0 };
  },

  isSoundEnabled() {
    return this.load().soundEnabled !== false;
  },

  setSoundEnabled(value) {
    const state = this.load();
    state.soundEnabled = value;
    this._persist();
  },
};

function structuredCloneState(obj) {
  return JSON.parse(JSON.stringify(obj));
}
