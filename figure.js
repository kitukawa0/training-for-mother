/**
 * figure.js — иллюстрация упражнения.
 * Если у упражнения указан gifUrl — показываем картинку.
 * Иначе рисуем собственную анимированную фигурку (см. cat-* классы в style.css),
 * чтобы карточка не зависела от внешних серверов с GIF.
 */

function renderExerciseFigure(container, category, gifUrl) {
  if (gifUrl) {
    container.innerHTML = `<img src="${gifUrl}" alt="Анимация упражнения" loading="lazy">`;
    return;
  }

  container.innerHTML = `
    <svg viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg">
      <g class="fig-all">
        <circle class="fig-breath" cx="50" cy="58" r="30" fill="none" stroke="#8EA478" stroke-width="3" opacity="0.4"></circle>
        <g class="fig-upper">
          <circle class="fig-head" cx="50" cy="24" r="14" fill="#F0C08A"></circle>
          <rect x="38" y="36" width="24" height="46" rx="12" fill="#8EA478"></rect>
          <rect class="fig-arm-left" x="24" y="40" width="10" height="38" rx="5" fill="#F0C08A"
                style="transform-origin:29px 42px;"></rect>
          <rect class="fig-arm-right" x="66" y="40" width="10" height="38" rx="5" fill="#F0C08A"
                style="transform-origin:71px 42px;"></rect>
          <circle class="fig-joint-dot" cx="29" cy="78" r="4" fill="#E9A23B"></circle>
          <circle class="fig-joint-dot" cx="71" cy="78" r="4" fill="#E9A23B"></circle>
        </g>
        <rect class="fig-leg-left" x="39" y="80" width="10" height="46" rx="5" fill="#66805A"
              style="transform-origin:44px 82px;"></rect>
        <rect class="fig-leg-right" x="51" y="80" width="10" height="46" rx="5" fill="#66805A"
              style="transform-origin:56px 82px;"></rect>
        <circle class="fig-joint-dot" cx="44" cy="128" r="4" fill="#E9A23B"></circle>
        <circle class="fig-joint-dot" cx="56" cy="128" r="4" fill="#E9A23B"></circle>
      </g>
    </svg>
  `;
}
