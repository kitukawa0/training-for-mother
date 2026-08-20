// utils.js — общие вспомогательные функции: работа с датами и DOM

/** Приводит дату к полуночи (обнуляет время), чтобы сравнивать только календарные дни */
function toMidnight(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Сегодняшняя дата, обнулённая до полуночи */
function getToday() {
  return toMidnight(new Date());
}

/** Превращает дату в строковый ключ 'YYYY-MM-DD' для хранения в localStorage */
function dateToKey(date) {
  const d = toMidnight(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Превращает ключ 'YYYY-MM-DD' обратно в объект Date */
function keyToDate(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDay(a, b) {
  return dateToKey(a) === dateToKey(b);
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/** День недели 1-го числа месяца, считая от понедельника (0 = Пн … 6 = Вс) */
function getFirstWeekdayMonday(year, month) {
  const jsDay = new Date(year, month, 1).getDay(); // 0 = Вс … 6 = Сб
  return (jsDay + 6) % 7;
}

const MONTH_NAMES_RU = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const MONTH_NAMES_GENITIVE_RU = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const WEEKDAY_NAMES_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

/** '20 августа' — с месяцем в родительном падеже, как принято при указании дня */
function formatReadableDate(date) {
  const d = new Date(date);
  return `${d.getDate()} ${MONTH_NAMES_GENITIVE_RU[d.getMonth()]}`;
}

function formatMinutesApprox(totalSeconds) {
  const minutes = Math.max(1, Math.round(totalSeconds / 60));
  return `≈ ${minutes} мин`;
}

/* ---------- Небольшие DOM-хелперы ---------- */

function qs(selector, scope = document) {
  return scope.querySelector(selector);
}

function createEl(tag, className, html) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (html !== undefined) el.innerHTML = html;
  return el;
}
