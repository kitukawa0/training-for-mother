/**
 * timer.js — круговой таймер обратного отсчёта.
 * Рисует SVG-круг сам, ничего не знает о конкретном упражнении.
 */

class CircularTimer {
  /**
   * @param {HTMLElement} container — куда вставить SVG таймера.
   * @param {object} options
   * @param {number} options.duration — длительность в секундах.
   * @param {() => void} options.onTick — вызывается каждую секунду с оставшимся временем.
   * @param {() => void} options.onComplete — вызывается по окончании.
   */
  constructor(container, { duration, onTick, onComplete }) {
    this.container = container;
    this.duration = duration;
    this.remaining = duration;
    this.onTick = onTick || (() => {});
    this.onComplete = onComplete || (() => {});
    this.intervalId = null;
    this.paused = false;
    this.radius = 54;
    this.circumference = 2 * Math.PI * this.radius;

    this._render();
  }

  _render() {
    this.container.innerHTML = `
      <svg class="timer-ring" viewBox="0 0 120 120" role="img" aria-label="Таймер упражнения">
        <circle class="timer-ring__track" cx="60" cy="60" r="${this.radius}"></circle>
        <circle class="timer-ring__progress" cx="60" cy="60" r="${this.radius}"
          stroke-dasharray="${this.circumference}"
          stroke-dashoffset="0"></circle>
      </svg>
      <div class="timer-ring__label">${formatSeconds(this.remaining)}</div>
    `;
    this.progressCircle = this.container.querySelector('.timer-ring__progress');
    this.label = this.container.querySelector('.timer-ring__label');
  }

  _updateVisual() {
    const fraction = this.remaining / this.duration;
    const offset = this.circumference * (1 - fraction);
    this.progressCircle.style.strokeDashoffset = String(offset);
    this.label.textContent = formatSeconds(this.remaining);
  }

  start() {
    this._updateVisual();
    this.intervalId = setInterval(() => {
      if (this.paused) return;
      this.remaining -= 1;
      this._updateVisual();
      this.onTick(this.remaining);
      if (this.remaining <= 0) {
        this.stop();
        this.onComplete();
      }
    }, 1000);
  }

  pause() {
    this.paused = true;
    this.container.classList.add('is-paused');
  }

  resume() {
    this.paused = false;
    this.container.classList.remove('is-paused');
  }

  skip() {
    this.remaining = 0;
    this._updateVisual();
    this.stop();
    this.onComplete();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
