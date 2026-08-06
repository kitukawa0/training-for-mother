/**
 * calendar.js — строит и отрисовывает сетку календаря на месяц.
 * Единственный день, который когда-либо можно открыть, — сегодняшний
 * (и только если он ещё не выполнен). Будущее всегда закрыто на замок,
 * прошлое — это уже история (зелёный день или пропущенный).
 */

const Calendar = {
  /** viewYear/viewMonth — какой месяц сейчас показан (может отличаться от текущего). */
  viewYear: new Date().getFullYear(),
  viewMonth: new Date().getMonth(),

  canGoNext() {
    const real = new Date();
    return !(this.viewYear === real.getFullYear() && this.viewMonth === real.getMonth());
  },

  goPrevMonth() {
    this.viewMonth -= 1;
    if (this.viewMonth < 0) { this.viewMonth = 11; this.viewYear -= 1; }
  },

  goNextMonth() {
    if (!this.canGoNext()) return;
    this.viewMonth += 1;
    if (this.viewMonth > 11) { this.viewMonth = 0; this.viewYear += 1; }
  },

  goToCurrentMonth() {
    const real = new Date();
    this.viewYear = real.getFullYear();
    this.viewMonth = real.getMonth();
  },

  /** Строит массив ячеек дня со статусом для отображаемого месяца. */
  buildDayCells() {
    const year = this.viewYear;
    const month = this.viewMonth;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstOfMonth = new Date(year, month, 1);
    const leadingBlanks = mondayIndex(firstOfMonth);
    const today = todayKey();

    const cells = [];
    for (let i = 0; i < leadingBlanks; i++) {
      cells.push({ blank: true });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const key = dateToKey(new Date(year, month, day));
      const cmp = compareKeys(key, today);
      let status;
      if (cmp > 0) {
        status = 'future';
      } else if (cmp === 0) {
        status = Storage.isDayComplete(key) ? 'completed-today' : 'today';
      } else {
        status = Storage.isDayComplete(key) ? 'completed' : 'missed';
      }
      cells.push({ blank: false, day, key, status });
    }
    return cells;
  },

  /** Отрисовывает календарь внутри containerEl. onDayOpen(key) вызывается по клику на доступный день. */
  render(containerEl, { onDayOpen }) {
    const cells = this.buildDayCells();
    const monthLabel = `${MONTH_NAMES[this.viewMonth]} ${this.viewYear}`;

    const weekdaysHtml = WEEKDAY_NAMES_SHORT
      .map(w => `<div class="calendar-weekday">${w}</div>`)
      .join('');

    const cellsHtml = cells.map(cell => {
      if (cell.blank) return '<div class="calendar-cell calendar-cell--blank"></div>';

      const statusIcons = {
        completed: '✓',
        'completed-today': '✓',
        today: '',
        future: '🔒',
        missed: '',
      };

      const clickable = cell.status === 'today';
      const classes = ['calendar-cell', `calendar-cell--${cell.status}`];
      if (clickable) classes.push('is-clickable');

      return `
        <button type="button" class="${classes.join(' ')}" data-key="${cell.key}" ${clickable ? '' : 'disabled tabindex="-1"'}>
          <span class="calendar-cell__number">${cell.day}</span>
          <span class="calendar-cell__icon">${statusIcons[cell.status]}</span>
        </button>
      `;
    }).join('');

    containerEl.innerHTML = `
      <div class="calendar-header">
        <button type="button" class="calendar-nav" data-nav="prev" aria-label="Предыдущий месяц">‹</button>
        <div class="calendar-title">${monthLabel}</div>
        <button type="button" class="calendar-nav" data-nav="next" aria-label="Следующий месяц" ${this.canGoNext() ? '' : 'disabled'}>›</button>
      </div>
      <div class="calendar-grid calendar-grid--weekdays">${weekdaysHtml}</div>
      <div class="calendar-grid">${cellsHtml}</div>
      <div class="calendar-legend">
        <span><i class="legend-dot legend-dot--completed"></i>Выполнен</span>
        <span><i class="legend-dot legend-dot--today"></i>Сегодня</span>
        <span><i class="legend-dot legend-dot--future"></i>Заблокирован</span>
      </div>
    `;

    containerEl.querySelector('[data-nav="prev"]').addEventListener('click', () => {
      this.goPrevMonth();
      this.render(containerEl, { onDayOpen });
    });
    containerEl.querySelector('[data-nav="next"]').addEventListener('click', () => {
      this.goNextMonth();
      this.render(containerEl, { onDayOpen });
    });
    containerEl.querySelectorAll('.calendar-cell.is-clickable').forEach(btn => {
      btn.addEventListener('click', () => onDayOpen(btn.dataset.key));
    });
  },
};
