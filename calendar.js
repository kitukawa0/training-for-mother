// calendar.js — построение календаря и определение состояния каждого дня

let currentCalendarDate = getToday();

/**
 * Состояния дня:
 *  completed   — выполнен (🟢)
 *  today       — сегодня, доступен (🟡)
 *  catch-up    — пропущенный день ждёт своей очереди (его нужно сделать, чтобы открыть дальнейшие)
 *  before-start— дата раньше, чем пользователь начал пользоваться приложением
 *  future      — день ещё не наступил
 *  locked      — день уже наступил, но предыдущий день не завершён
 */
function getDayStatus(dateKey) {
  const today = getToday();
  const date = keyToDate(dateKey);
  const state = getState();

  if (isDayCompleted(dateKey)) return 'completed';
  if (date < keyToDate(state.startDate)) return 'before-start';

  const nextUnlocked = getNextUnlockedDateKey();
  if (dateKey === nextUnlocked && date <= today) {
    return isSameDay(date, today) ? 'today' : 'catch-up';
  }
  if (date > today) return 'future';
  return 'locked';
}

function renderCalendar() {
  const grid = qs('#calendarGrid');
  const monthLabel = qs('#calendarMonthLabel');
  grid.innerHTML = '';

  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  monthLabel.textContent = `${MONTH_NAMES_RU[month]} ${year}`;

  WEEKDAY_NAMES_RU.forEach(name => {
    grid.appendChild(createEl('div', 'calendar-weekday', name));
  });

  const leadingEmpty = getFirstWeekdayMonday(year, month);
  for (let i = 0; i < leadingEmpty; i++) {
    grid.appendChild(createEl('div', 'calendar-day calendar-day--empty'));
  }

  const daysInMonth = getDaysInMonth(year, month);
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = dateToKey(new Date(year, month, day));
    grid.appendChild(buildDayCell(day, dateKey, getDayStatus(dateKey)));
  }

  updateStatsUI();
}

function buildDayCell(day, dateKey, status) {
  const cell = createEl('button', `calendar-day calendar-day--${status}`);
  cell.type = 'button';
  cell.dataset.date = dateKey;

  const isClickable = status === 'today' || status === 'catch-up' || status === 'completed';
  cell.disabled = !isClickable;

  let icon = '';
  if (status === 'completed') icon = '✅';
  else if (status === 'catch-up') icon = '⏳';
  else if (status === 'future' || status === 'locked') icon = '🔒';

  cell.innerHTML = `<span class="calendar-day__number">${day}</span><span class="calendar-day__icon">${icon}</span>`;

  if (isClickable) {
    cell.addEventListener('click', () => onDayClick(dateKey, status));
  }
  return cell;
}

function changeCalendarMonth(delta) {
  currentCalendarDate = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + delta, 1);
  renderCalendar();
}

function goToCurrentMonth() {
  currentCalendarDate = getToday();
  renderCalendar();
}

function updateStatsUI() {
  const stats = getStats();
  qs('#statTotal').textContent = stats.totalWorkouts;
  qs('#statStreak').textContent = stats.currentStreak;
  qs('#statBest').textContent = stats.bestStreak;
  qs('#statLast').textContent = stats.lastWorkoutLabel;
  qs('#streakBadgeValue').textContent = stats.currentStreak;

  const percent = getMonthProgressPercent(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());
  qs('#progressBarFill').style.width = `${percent}%`;
  qs('#progressBarLabel').textContent = `${percent}%`;
}
