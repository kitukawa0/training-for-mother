// storage.js — сохранение и чтение прогресса из LocalStorage.
// Всё хранится локально в браузере пользователя, без сервера.

const STORAGE_KEY = 'homeWorkoutCalendar_v1';

function getDefaultState() {
  return {
    startDate: dateToKey(getToday()),
    completedDays: {}, // { 'YYYY-MM-DD': { difficulty, exerciseIds, completedAt } }
    bestStreak: 0,
    soundEnabled: true,
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const fresh = getDefaultState();
      saveState(fresh);
      return fresh;
    }
    return { ...getDefaultState(), ...JSON.parse(raw) };
  } catch (err) {
    console.error('Не удалось прочитать сохранённые данные, начинаем заново.', err);
    return getDefaultState();
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Не удалось сохранить прогресс.', err);
  }
}

let appState = loadState();

function getState() {
  return appState;
}

function isDayCompleted(dateKey) {
  return Boolean(appState.completedDays[dateKey]);
}

function completeDay(dateKey, difficulty, exerciseIds) {
  appState.completedDays[dateKey] = { difficulty, exerciseIds, completedAt: new Date().toISOString() };
  const streak = calculateCurrentStreak(appState.completedDays);
  if (streak > appState.bestStreak) appState.bestStreak = streak;
  saveState(appState);
}

function getCompletedDatesSorted() {
  return Object.keys(appState.completedDays).sort();
}

function getTotalWorkouts() {
  return Object.keys(appState.completedDays).length;
}

/** Самый ранний ещё не выполненный день, начиная со старта использования приложения.
 *  Пока он не сделан — все дни после него остаются закрытыми (в т.ч. "сегодня"). */
function getNextUnlockedDateKey() {
  const today = getToday();
  let cursor = keyToDate(appState.startDate);
  while (isDayCompleted(dateToKey(cursor)) && cursor < today) {
    cursor = addDays(cursor, 1);
  }
  if (isDayCompleted(dateToKey(cursor)) && isSameDay(cursor, today)) {
    cursor = addDays(cursor, 1); // сегодня уже сделано — следующий день откроется завтра
  }
  return dateToKey(cursor);
}

/** Серия всегда считается заново из сохранённых дней — без ручных сбросов и рассинхронизации */
function calculateCurrentStreak(completedDays) {
  const today = getToday();
  let cursor = completedDays[dateToKey(today)] ? today : addDays(today, -1);
  let streak = 0;
  while (completedDays[dateToKey(cursor)]) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

function getStats() {
  const completedDays = appState.completedDays;
  const currentStreak = calculateCurrentStreak(completedDays);
  if (currentStreak > appState.bestStreak) {
    appState.bestStreak = currentStreak;
    saveState(appState);
  }
  const dates = getCompletedDatesSorted();
  const lastDateKey = dates.length ? dates[dates.length - 1] : null;
  return {
    totalWorkouts: getTotalWorkouts(),
    currentStreak,
    bestStreak: appState.bestStreak,
    lastWorkoutLabel: lastDateKey ? formatReadableDate(keyToDate(lastDateKey)) : '—',
  };
}

function getMonthProgressPercent(year, month) {
  const daysInMonth = getDaysInMonth(year, month);
  let completed = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    if (isDayCompleted(dateToKey(new Date(year, month, day)))) completed++;
  }
  return Math.round((completed / daysInMonth) * 100);
}

function setSoundEnabled(enabled) {
  appState.soundEnabled = enabled;
  saveState(appState);
}
