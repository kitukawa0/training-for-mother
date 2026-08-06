/**
 * exercises.js — база упражнений и генератор тренировки на конкретный день.
 *
 * Про поле gifUrl: по умолчанию оно пустое. Если оставить его пустым,
 * приложение само рисует лёгкую CSS-анимацию по категории упражнения —
 * это сделано специально, чтобы приложение не зависело от чужих серверов
 * с GIF (они часто перестают открываться или показывают рекламу) и
 * гарантированно работало на GitHub Pages без интернета для картинок.
 * Если захотите вставить настоящую GIF-анимацию — просто впишите ссылку
 * в gifUrl нужного упражнения, и карточка покажет именно её.
 */

const CATEGORY_META = {
  march:   { label: 'Ходьба на месте', icon: '🚶' },
  arms:    { label: 'Руки и плечи',     icon: '🙆' },
  torso:   { label: 'Корпус',           icon: '🔄' },
  knees:   { label: 'Колени',           icon: '🦵' },
  squat:   { label: 'Ноги',             icon: '🪑' },
  breathe: { label: 'Дыхание',          icon: '🌬️' },
  calf:    { label: 'Стопы и голени',   icon: '👣' },
  neck:    { label: 'Шея',              icon: '🙂' },
  joints:  { label: 'Суставы',          icon: '✨' },
  stretch: { label: 'Растяжка',         icon: '🧘' },
};

// duration — в секундах.
const EXERCISES = [
  // ── Ходьба на месте ──────────────────────────────────────────────
  { id: 'march-1', category: 'march', duration: 45,
    name: 'Ходьба на месте',
    description: 'Спокойно шагайте на месте, руки двигаются свободно в такт шагам.' },
  { id: 'march-2', category: 'march', duration: 40,
    name: 'Ходьба с высоким подъёмом бедра',
    description: 'Шагайте на месте, поднимая колени чуть выше обычного, в комфортном темпе.' },
  { id: 'march-3', category: 'march', duration: 40,
    name: 'Ходьба с лёгким покачиванием рук',
    description: 'Шагайте на месте, плавно покачивая расслабленными руками вперёд и назад.' },
  { id: 'march-4', category: 'march', duration: 45,
    name: 'Медленный марш для разогрева',
    description: 'Очень медленная ходьба на месте, чтобы разогреть тело перед тренировкой.' },
  { id: 'march-5', category: 'march', duration: 40,
    name: 'Ходьба с касанием колена',
    description: 'Шагая на месте, слегка касайтесь ладонью поднятого колена — для координации.' },
  { id: 'march-6', category: 'march', duration: 45,
    name: 'Ходьба под спокойное дыхание',
    description: 'Шагайте на месте, дыша ровно: 4 шага — вдох, 4 шага — выдох.' },

  // ── Руки и плечи (бережно к левому плечу) ───────────────────────
  { id: 'arms-1', category: 'arms', duration: 30,
    name: 'Мягкие круги плечами',
    description: 'Небольшие круговые движения плечами вперёд и назад, без подъёма рук вверх.' },
  { id: 'arms-2', category: 'arms', duration: 30,
    name: 'Круги кистями',
    description: 'Вращайте кистями рук по кругу в обе стороны, руки опущены и расслаблены.' },
  { id: 'arms-3', category: 'arms', duration: 30,
    name: 'Лёгкие круги локтями',
    description: 'Согните руки в локтях у груди и сделайте несколько плавных кругов локтями.' },
  { id: 'arms-4', category: 'arms', duration: 30,
    name: 'Маятник руками',
    description: 'Свободно покачивайте прямыми руками вперёд-назад в комфортной амплитуде.' },
  { id: 'arms-5', category: 'arms', duration: 30,
    name: 'Сведение лопаток',
    description: 'Слегка сведите лопатки вместе и расслабьте — без подъёма рук выше груди.' },
  { id: 'arms-6', category: 'arms', duration: 30,
    name: 'Объятия себя',
    description: 'Скрещивайте руки на груди и мягко разводите их в стороны, без резких движений.' },

  // ── Корпус ────────────────────────────────────────────────────
  { id: 'torso-1', category: 'torso', duration: 40,
    name: 'Повороты корпуса',
    description: 'Стоя, руки на поясе, плавно поворачивайте корпус влево и вправо.' },
  { id: 'torso-2', category: 'torso', duration: 35,
    name: 'Лёгкие наклоны в стороны',
    description: 'Наклоняйте корпус вправо и влево, скользя рукой вдоль тела.' },
  { id: 'torso-3', category: 'torso', duration: 40,
    name: 'Повороты с взмахом рук',
    description: 'Поворачивайте корпус в стороны, свободно взмахивая расслабленными руками.' },
  { id: 'torso-4', category: 'torso', duration: 30,
    name: 'Мягкие круги тазом',
    description: 'Сделайте несколько плавных круговых движений тазом в обе стороны.' },
  { id: 'torso-5', category: 'torso', duration: 30,
    name: 'Лёгкий наклон вперёд',
    description: 'Наклонитесь вперёд с прямой спиной ровно настолько, насколько комфортно.' },
  { id: 'torso-6', category: 'torso', duration: 40,
    name: 'Скручивание сидя',
    description: 'Сидя на стуле, мягко поворачивайте верхнюю часть тела влево и вправо.' },

  // ── Колени и ноги (баланс) ───────────────────────────────────
  { id: 'knees-1', category: 'knees', duration: 35,
    name: 'Подъём колен стоя',
    description: 'Стоя у опоры, поочерёдно поднимайте согнутые колени на комфортную высоту.' },
  { id: 'knees-2', category: 'knees', duration: 30,
    name: 'Колено к животу у стула',
    description: 'Держась за спинку стула, аккуратно подтягивайте колено к животу.' },
  { id: 'knees-3', category: 'knees', duration: 30,
    name: 'Лёгкие махи ногой назад',
    description: 'Держась за опору, плавно отводите прямую ногу немного назад поочерёдно.' },
  { id: 'knees-4', category: 'knees', duration: 35,
    name: 'Подъём колена с касанием',
    description: 'Поднимая колено, слегка касайтесь его противоположной ладонью для баланса.' },
  { id: 'knees-5', category: 'knees', duration: 30,
    name: 'Отведение ноги в сторону',
    description: 'Держась за опору, мягко отводите ногу в сторону и возвращайте обратно.' },

  // ── Лёгкие приседания ─────────────────────────────────────────
  { id: 'squat-1', category: 'squat', duration: 40,
    name: 'Полуприсед у стула',
    description: 'Держась за спинку стула, сделайте несколько неглубоких приседаний.' },
  { id: 'squat-2', category: 'squat', duration: 40,
    name: 'Приседания с опорой',
    description: 'Опираясь руками на устойчивую поверхность, приседайте на небольшую глубину.' },
  { id: 'squat-3', category: 'squat', duration: 30,
    name: 'Лёгкий "стульчик" у стены',
    description: 'Слегка прислонитесь спиной к стене и немного согните колени, задержитесь.' },
  { id: 'squat-4', category: 'squat', duration: 40,
    name: 'Встать со стула без рук',
    description: 'Медленно вставайте со стула и садитесь обратно, стараясь не помогать руками.' },
  { id: 'squat-5', category: 'squat', duration: 35,
    name: 'Полуприсед в широкой стойке',
    description: 'Поставьте ноги чуть шире плеч и выполните несколько плавных полуприседов.' },

  // ── Дыхание ────────────────────────────────────────────────────
  { id: 'breathe-1', category: 'breathe', duration: 45,
    name: 'Дыхание животом',
    description: 'Положите руку на живот и дышите глубоко, ощущая, как живот поднимается.' },
  { id: 'breathe-2', category: 'breathe', duration: 45,
    name: 'Дыхание 4-7-8',
    description: 'Вдох на 4 счёта, задержка на 7 счётов, медленный выдох на 8 счётов.' },
  { id: 'breathe-3', category: 'breathe', duration: 40,
    name: 'Дыхание с поднятием рук',
    description: 'На вдохе слегка поднимите руки перед собой, на выдохе — опустите.' },
  { id: 'breathe-4', category: 'breathe', duration: 45,
    name: 'Спокойное дыхание сидя',
    description: 'Сидя удобно, дышите ровно и медленно, ни на чём не концентрируясь, кроме дыхания.' },
  { id: 'breathe-5', category: 'breathe', duration: 30,
    name: 'Дыхательная пауза',
    description: 'Закройте глаза и просто понаблюдайте за своим естественным дыханием.' },
  { id: 'breathe-6', category: 'breathe', duration: 40,
    name: 'Дыхание с удлинённым выдохом',
    description: 'Вдохните через нос и выдыхайте медленнее и дольше, чем вдыхали.' },

  // ── Стопы и голени ───────────────────────────────────────────
  { id: 'calf-1', category: 'calf', duration: 35,
    name: 'Подъёмы на носки',
    description: 'Держась за опору, плавно поднимайтесь на носки и опускайтесь обратно.' },
  { id: 'calf-2', category: 'calf', duration: 30,
    name: 'Перекаты с пятки на носок',
    description: 'Медленно перекатывайтесь с пятки на носок и обратно, стоя на месте.' },
  { id: 'calf-3', category: 'calf', duration: 35,
    name: 'Подъём на носки с паузой',
    description: 'Поднимитесь на носки и задержитесь на пару секунд перед тем, как опуститься.' },
  { id: 'calf-4', category: 'calf', duration: 30,
    name: 'Поочерёдные подъёмы стоп',
    description: 'Медленно поднимайте на носок то одну, то другую ногу поочерёдно.' },
  { id: 'calf-5', category: 'calf', duration: 30,
    name: 'Круги стопой сидя',
    description: 'Сидя на стуле, приподнимите стопу и сделайте несколько кругов в воздухе.' },

  // ── Шея ────────────────────────────────────────────────────────
  { id: 'neck-1', category: 'neck', duration: 30,
    name: 'Наклоны головы вперёд-назад',
    description: 'Очень мягко наклоняйте голову вперёд и слегка назад, без резких движений.' },
  { id: 'neck-2', category: 'neck', duration: 30,
    name: 'Наклоны головы к плечу',
    description: 'Плавно наклоняйте голову к правому и левому плечу поочерёдно.' },
  { id: 'neck-3', category: 'neck', duration: 30,
    name: 'Повороты головы в стороны',
    description: 'Медленно поворачивайте голову влево и вправо, насколько комфортно.' },
  { id: 'neck-4', category: 'neck', duration: 25,
    name: 'Полукруг подбородком',
    description: 'Плавно "нарисуйте" подбородком небольшой полукруг перед собой.' },
  { id: 'neck-5', category: 'neck', duration: 25,
    name: 'Мягкое вытяжение шеи',
    description: 'Слегка потянитесь макушкой вверх, ощущая лёгкое вытяжение шеи.' },

  // ── Разминка суставов ─────────────────────────────────────────
  { id: 'joints-1', category: 'joints', duration: 25,
    name: 'Круги кистями',
    description: 'Вращайте кистями рук по небольшому кругу в обе стороны.' },
  { id: 'joints-2', category: 'joints', duration: 25,
    name: 'Круги стопами',
    description: 'Приподняв стопу, сделайте несколько круговых движений в голеностопе.' },
  { id: 'joints-3', category: 'joints', duration: 20,
    name: 'Разминка пальцев рук',
    description: 'Сгибайте и разгибайте пальцы рук, мягко сжимая и раскрывая ладони.' },
  { id: 'joints-4', category: 'joints', duration: 25,
    name: 'Мягкие круги коленями',
    description: 'Слегка согнув колени и сведя стопы вместе, сделайте несколько лёгких кругов.' },
  { id: 'joints-5', category: 'joints', duration: 25,
    name: 'Вращение локтями',
    description: 'Согните руки в локтях и сделайте несколько плавных вращательных движений.' },
  { id: 'joints-6', category: 'joints', duration: 20,
    name: 'Разминка пальцев ног',
    description: 'Сидя, пошевелите пальцами ног, а затем слегка растопырьте и соберите их.' },

  // ── Растяжка без боли ──────────────────────────────────────────
  { id: 'stretch-1', category: 'stretch', duration: 35,
    name: 'Растяжка бока сидя',
    description: 'Сидя на стуле, потянитесь одной рукой вверх и слегка в сторону, затем другой.' },
  { id: 'stretch-2', category: 'stretch', duration: 40,
    name: 'Растяжка задней поверхности бедра',
    description: 'Сидя на краю стула, выпрямите одну ногу и мягко наклонитесь вперёд.' },
  { id: 'stretch-3', category: 'stretch', duration: 35,
    name: 'Растяжка икры у стены',
    description: 'Обопритесь руками о стену, отставьте ногу назад и мягко потяните голень.' },
  { id: 'stretch-4', category: 'stretch', duration: 35,
    name: 'Растяжка спины "кошка" сидя',
    description: 'Сидя на стуле, мягко округлите, а затем прогните спину, следя за ощущениями.' },
  { id: 'stretch-5', category: 'stretch', duration: 25,
    name: 'Растяжка предплечий',
    description: 'Вытяните руку вперёд и мягко потяните пальцы на себя другой рукой.' },
  { id: 'stretch-6', category: 'stretch', duration: 35,
    name: 'Растяжка спины сидя',
    description: 'Сидя, мягко наклонитесь вперёд, обхватив голени руками, насколько комфортно.' },
];

const MIN_WORKOUT_SECONDS = 8 * 60;
const MAX_WORKOUT_SECONDS = 15 * 60;

/**
 * Строит стабильную тренировку на конкретный день: одна и та же дата
 * всегда даёт одинаковый набор упражнений (пока список EXERCISES не меняется).
 * Тренировка открывается разминкой суставов/шеи и заканчивается
 * дыханием/растяжкой — так безопаснее и приятнее для тела.
 */
function generateWorkoutForDate(dateKey) {
  const random = createSeededRandom(hashString(dateKey));

  const warmupPool = seededShuffle(
    EXERCISES.filter(e => e.category === 'joints' || e.category === 'neck'), random,
  );
  const cooldownPool = seededShuffle(
    EXERCISES.filter(e => e.category === 'breathe' || e.category === 'stretch'), random,
  );
  const mainPool = seededShuffle(
    EXERCISES.filter(e => !['joints', 'neck', 'breathe', 'stretch'].includes(e.category)), random,
  );

  const workout = [];
  let totalSeconds = 0;
  let lastCategory = null;

  const tryAdd = (exercise) => {
    if (!exercise) return false;
    if (totalSeconds + exercise.duration > MAX_WORKOUT_SECONDS) return false;
    workout.push(exercise);
    totalSeconds += exercise.duration;
    lastCategory = exercise.category;
    return true;
  };

  // Разминка: 1-2 упражнения.
  tryAdd(warmupPool[0]);
  tryAdd(warmupPool[1]);

  // Основная часть: чередуем категории, стараясь не повторять подряд.
  let mainIndex = 0;
  const mainQueue = mainPool.slice();
  while (totalSeconds < MIN_WORKOUT_SECONDS && mainIndex < mainQueue.length * 2) {
    const candidate = mainQueue[mainIndex % mainQueue.length];
    mainIndex += 1;
    if (candidate.category === lastCategory) continue;
    if (workout.includes(candidate)) continue;
    tryAdd(candidate);
  }

  // Заминка: дыхание/растяжка.
  tryAdd(cooldownPool[0]);
  if (totalSeconds < MIN_WORKOUT_SECONDS) tryAdd(cooldownPool[1]);
  if (totalSeconds < MIN_WORKOUT_SECONDS) tryAdd(cooldownPool[2]);

  return workout;
}
