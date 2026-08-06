/**
 * utils.js — небольшие независимые помощники.
 * Ничего не знает про DOM, localStorage и т.д.
 */

/** Приводит Date к ключу вида "2026-08-06" в локальном часовом поясе. */
function dateToKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Сегодняшняя дата в виде ключа "YYYY-MM-DD". */
function todayKey() {
  return dateToKey(new Date());
}

/** Ключ даты, отстоящей от переданной на offsetDays дней (может быть отрицательным). */
function shiftKey(key, offsetDays) {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + offsetDays);
  return dateToKey(date);
}

/** Сравнивает два ключа дат: -1, 0, 1. */
function compareKeys(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Человекочитаемая дата на русском, например "6 августа". */
function formatHumanDate(key) {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
  ];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

const WEEKDAY_NAMES_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

/** Возвращает 0..6 где 0 = понедельник (в отличие от Date#getDay, где 0 = воскресенье). */
function mondayIndex(date) {
  return (date.getDay() + 6) % 7;
}

/** Быстрый детерминированный хэш строки в 32-битное число. */
function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Простой seeded PRNG (mulberry32). Возвращает функцию, генерирующую числа [0,1). */
function createSeededRandom(seed) {
  let a = seed >>> 0;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Детерминированная перестановка Фишера-Йетса на основе seeded random. */
function seededShuffle(array, random) {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Форматирует секунды в "мм:сс". */
function formatSeconds(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Ограничивает число диапазоном. */
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
