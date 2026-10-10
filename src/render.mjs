import content from "./content.mjs";
const escapeHTML = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

const detail = (label, value) =>
  value
    ? `<div class="cv-case-detail"><dt>${escapeHTML(label)}</dt><dd>${escapeHTML(value)}</dd></div>`
    : "";

function renderMedia(item, selectedClips = null, offset = 0) {
  const clips = selectedClips || content.mediaGalleries[item.id];
  return `<div class="media-gallery">${clips
    .map((clip, index) => {
      if (clip.type === "video" && ["language", "multimodal"].includes(item.id))
        return `<figure class="media-clip original-video model-demo"><div class="model-demo-player"><div class="media-frame" style="aspect-ratio:${clip.width || 1900}/${clip.height || 920}"><video data-src="${escapeHTML(clip.src)}" poster="${escapeHTML(clip.poster)}"  loop muted playsinline preload="none" controls width="${clip.width || 1900}" height="${clip.height || 920}" aria-label="${escapeHTML(clip.title)}"></video><noscript><a class="video-fallback" href="${escapeHTML(clip.src)}">Открыть видео ↗</a></noscript></div><div class="video-actions"><button class="video-toggle" data-title="${escapeHTML(clip.title)}" aria-label="Воспроизвести видео: ${escapeHTML(clip.title)}">Воспроизвести</button></div></div><figcaption class="model-demo-copy"><span class="section-index">${item.id === "language" ? "ДОПОЛНИТЕЛЬНАЯ ДЕМОНСТРАЦИЯ" : `КЕЙС / ${String(index + 1).padStart(2, "0")}`}</span><h4>${escapeHTML(clip.title)}</h4>${
          clip.task
            ? `<p class="vlm-case-status">${escapeHTML(clip.status)}</p><dl class="cv-case-details vlm-case-details">${[
                ["ЗАДАЧА", clip.task],
                ["КАК УСТРОЕНО", clip.summary],
                ["МОЙ ВКЛАД", clip.contribution],
                ["РЕЗУЛЬТАТ", clip.result],
              ]
                .map(
                  ([label, value]) =>
                    `<div class="cv-case-detail"><dt>${label}</dt><dd>${escapeHTML(value)}</dd></div>`,
                )
                .join("")}</dl>`
            : `<p class="media-summary">${escapeHTML(clip.summary)}</p>`
        }<div class="card-tags">${(clip.tags || ["Qwen", "MLX", "Local inference", "JSON"]).map((tag) => `<span class="pill">${escapeHTML(tag)}</span>`).join("")}</div></figcaption></figure>`;
      if (clip.type === "video")
        return `<figure class="media-clip original-video"><div class="media-frame" style="aspect-ratio:${clip.width || 1920}/${clip.height || 1080}"><video data-src="${escapeHTML(clip.src)}" poster="${escapeHTML(clip.poster)}"  loop muted playsinline preload="none" controls width="${clip.width || 1920}" height="${clip.height || 1080}" aria-label="${escapeHTML(clip.title)}"></video><noscript><a class="video-fallback" href="${escapeHTML(clip.src)}">Открыть видео ↗</a></noscript></div><figcaption><span class="clip-number">${String(index + offset + 1).padStart(2, "0")}</span><span>${escapeHTML(clip.title)}</span></figcaption>${clip.summary && item.id !== "vision" ? `<p class="media-summary">${escapeHTML(clip.summary)}</p>` : ""}<div class="video-actions"><button class="video-toggle" data-title="${escapeHTML(clip.title)}" aria-label="Воспроизвести видео: ${escapeHTML(clip.title)}">Воспроизвести</button></div></figure>`;
      throw new Error("Unsupported case media type");
    })
    .join("")}</div>`;
}
function renderCV(item) {
  const clips = content.mediaGalleries.vision;
  const tags = (items) =>
    items.map((tag) => `<span class="pill">${escapeHTML(tag)}</span>`).join("");
  return `<section id="vision" class="cv-section theme-vision" aria-labelledby="cv-title">
  <header class="cv-overview cv-overview-compact">
   <div class="card-category">${item.category}<span>/${item.number}</span></div>
   <h3 id="cv-title">${escapeHTML(item.title)}</h3>
   <p class="cv-description">${escapeHTML(item.description)}</p>
   <nav class="cv-contents" aria-label="Кейсы Computer Vision">${clips.map((clip, index) => `<a href="#${clip.id}"><span>${String(index + 1).padStart(2, "0")}</span><strong>${escapeHTML(clip.shortTitle)}</strong><small>СМОТРЕТЬ КЕЙС</small></a>`).join("")}</nav>
  </header>
  <div class="cv-cases">${clips
    .map(
      (
        clip,
        index,
      ) => `<article id="${clip.id}" class="cv-case" aria-labelledby="${clip.id}-title">
   <div class="cv-case-media">${renderMedia(item, [clip], index)}${clip.mediaNote ? `<p class="cv-media-note">${escapeHTML(clip.mediaNote)}</p>` : ""}</div>
   <div class="cv-case-copy">
    <div class="cv-case-meta"><span class="section-index">КЕЙС / ${String(index + 1).padStart(2, "0")}</span><span class="cv-case-status">${escapeHTML(clip.status)}</span></div>
    <h4 id="${clip.id}-title">${escapeHTML(clip.title)}</h4>
    <dl class="cv-case-details">${detail("ЗАДАЧА", clip.task)}${detail("КАК УСТРОЕНО", clip.summary)}${detail("МОЙ ВКЛАД", clip.contribution)}${detail(clip.resultLabel || "РЕЗУЛЬТАТ", clip.result)}</dl>
    <div class="card-tags">${tags(clip.tags)}</div>
   </div>
  </article>`,
    )
    .join("")}</div>
 </section>`;
}
function renderLanguage(item) {
  const projects = [content.languageCase, content.languageDesktopCase];
  const cases = projects
    .map((project, index) => {
      const titleId =
        index === 0 ? "language-case-title" : "language-desktop-case-title";
      const imageAlt =
        project.imageAlt ||
        "AI-помощник на Qwen 3.5 9B: выбор источника и периода, вопрос о числе машин за последний час и ответ со статистикой";
      const tags = project.tags || [
        "Qwen 3.5 9B",
        "JSON",
        "Chat interface",
        "Event analytics",
      ];
      return `<section class="language-case" aria-labelledby="${titleId}">
   <figure class="language-case-image"><a href="${escapeHTML(project.image)}" target="_blank" rel="noopener" aria-label="Открыть скриншот: ${escapeHTML(project.title)}"><img src="${escapeHTML(project.image)}" alt="${escapeHTML(imageAlt)}" width="${index === 0 ? 1806 : 2252}" height="${index === 0 ? 1458 : 1782}" loading="lazy"><span class="image-expand-hint">Открыть в полном размере ↗</span></a><figcaption>${escapeHTML(project.imageCaption)}</figcaption></figure>
   <div class="language-case-copy">
    <div class="language-case-heading"><span class="section-index">КЕЙС / ${String(index + 1).padStart(2, "0")}</span><span class="language-model">${escapeHTML(project.model)}</span></div>
    <h4 id="${titleId}">${escapeHTML(project.title)}</h4>
    <dl class="cv-case-details language-case-details">${detail("ЗАДАЧА", project.task)}${detail("КАК УСТРОЕНО", project.implementation)}${project.contribution ? detail("МОЙ ВКЛАД", project.contribution) : detail("ВОЗМОЖНОСТИ", project.features)}${detail("РЕЗУЛЬТАТ", project.result)}</dl>
    <div class="language-question"><span class="mono">ПРИМЕР ВОПРОСА</span><p>«${escapeHTML(project.example)}»</p></div>
    <div class="card-tags">${tags.map((tag) => `<span class="pill">${escapeHTML(tag)}</span>`).join("")}</div>
    ${project.repository ? `<a class="project-source-link" href="${escapeHTML(project.repository)}" target="_blank" rel="noopener noreferrer">Исходный код на GitHub <span aria-hidden="true">↗</span></a>` : ""}
   </div>
  </section>`;
    })
    .join("");
  return `<article id="language" class="expertise-card expertise-panel theme-language language-section">
  <header class="language-overview">
   <div class="card-category">${item.category}<span>/${item.number}</span></div>
   <h3>${escapeHTML(item.title)}</h3>
   <p>${escapeHTML(item.description)}</p>
  </header>
  ${cases}
 </article>`;
}

function renderMultimodal(item) {
  return `<article id="multimodal" class="expertise-card expertise-panel theme-multimodal vlm-section" aria-labelledby="vlm-title">
  <header class="language-overview">
   <div class="card-category">${item.category}<span>/${item.number}</span></div>
   <h3 id="vlm-title">${escapeHTML(item.title)}</h3>
   <p>${escapeHTML(item.description)}</p>
  </header>
  <div class="vlm-case">${renderMedia(item)}</div>
 </article>`;
}
function renderOCR(item) {
  return `<article id="ocr" class="expertise-card expertise-panel theme-ocr language-section" aria-labelledby="ocr-title">
  <header class="language-overview">
   <div class="card-category">${item.category}<span>/${item.number}</span></div>
   <h3 id="ocr-title">${escapeHTML(item.title)}</h3>
   <p>${escapeHTML(item.description)}</p>
  </header>
  ${content.ocrCases
    .map(
      (
        project,
        index,
      ) => `<section id="${project.id}" class="language-case" aria-labelledby="${project.id}-title">
   <figure class="language-case-image"><a href="${escapeHTML(project.image)}" target="_blank" rel="noopener noreferrer" aria-label="Открыть иллюстрацию: ${escapeHTML(project.title)}"><img src="${escapeHTML(project.image)}" alt="${escapeHTML(project.imageAlt)}" width="1672" height="941" loading="lazy"><span class="image-expand-hint">Открыть в полном размере ↗</span></a><figcaption>${escapeHTML(project.imageCaption)}</figcaption></figure>
   <div class="language-case-copy">
    <div class="language-case-heading"><span class="section-index">КЕЙС / ${String(index + 1).padStart(2, "0")}</span>${project.status ? `<span class="language-model">${escapeHTML(project.status)}</span>` : ""}</div>
    <h4 id="${project.id}-title">${escapeHTML(project.title)}</h4>
    <dl class="cv-case-details language-case-details">${detail("ЗАДАЧА", project.task)}${detail("КАК УСТРОЕНО", project.implementation)}${detail("РЕЗУЛЬТАТ", project.result)}</dl>
    <div class="card-tags">${project.tags.map((tag) => `<span class="pill">${escapeHTML(tag)}</span>`).join("")}</div>
   </div>
  </section>`,
    )
    .join("")}
 </article>`;
}
function renderNLP(item) {
  const project = content.nlpCase;
  return `<article id="nlp" class="expertise-card expertise-panel theme-nlp language-section" aria-labelledby="nlp-title">
  <header class="language-overview">
   <div class="card-category">${item.category}<span>/${item.number}</span></div>
   <h3 id="nlp-title">${escapeHTML(item.title)}</h3>
   <p>${escapeHTML(item.description)}</p>
  </header>
  <section class="language-case" aria-labelledby="nlp-case-title">
   <figure class="language-case-image"><a href="${escapeHTML(project.image)}" target="_blank" rel="noopener noreferrer" aria-label="Открыть облако слов в полном размере"><img src="${escapeHTML(project.image)}" alt="${escapeHTML(project.imageAlt)}" width="1600" height="1000" loading="lazy"><span class="image-expand-hint">Открыть в полном размере ↗</span></a><figcaption>${escapeHTML(project.imageCaption)}</figcaption><p class="nlp-demo-note">${escapeHTML(project.demo)}</p></figure>
   <div class="language-case-copy">
    <div class="language-case-heading"><span class="section-index">КЕЙС / 01</span><span class="language-model">${escapeHTML(project.status)}</span></div>
    <h4 id="nlp-case-title">${escapeHTML(project.title)}</h4>
    <dl class="cv-case-details language-case-details">${detail("ЗАДАЧА", project.task)}${detail("ЧТО ДЕЛАЛ", project.implementation)}${detail("РЕЗУЛЬТАТ", project.result)}</dl>
    <div class="card-tags">${project.tags.map((tag) => `<span class="pill">${escapeHTML(tag)}</span>`).join("")}</div>
   </div>
  </section>
 </article>`;
}
const renderers = {
  vision: renderCV,
  language: renderLanguage,
  multimodal: renderMultimodal,
  ocr: renderOCR,
  nlp: renderNLP,
};
const cards = content.expertise
  .map((item) => renderers[item.id](item))
  .join("");
export const sections = `
 <section id="about" class="section wrap"><div class="section-top"><span class="section-index">01 / ОБО МНЕ</span><span class="mono">ENGINEERING WITH PURPOSE</span></div><div class="about-grid about-profile"><div class="profile-column reveal"><p class="profile-name">Иван Груздев</p><div class="profile-photo">${content.portrait ? `<img src="${escapeHTML(content.portrait)}" alt="Иван Груздев" width="640" height="640">` : ""}</div></div><div class="about-copy reveal"><h2>Модели - это начало.<br><em>Результат - работающая система.</em></h2><p>Я ML Engineer, занимаюсь <strong>компьютерным зрением, обработкой естественного языка, языковыми и мультимодальными моделями</strong>. Разрабатываю решения для промышленности, производства и ритейла.</p><p>Работаю с пятью направлениями: CV, LLM, VLM, OCR и NLP. Обучаю модели компьютерного зрения, развёртываю локальные языковые и мультимодальные модели через Ollama и MLX, интегрирую их в работающие системы.</p><p>Также решал задачи NLP: предобработка и классификация текстов, анализ тональности и эмоций, извлечение сущностей, семантический поиск и кластеризация.</p><p>Использую OpenCV и Tesseract / pytesseract для предобработки изображений и распознавания текста на документах, фотографиях и кадрах с камер.</p><div class="about-tags"><span class="pill">CV</span><span class="pill">LLM</span><span class="pill">VLM</span><span class="pill">OCR</span><span class="pill">NLP</span></div></div></div><div class="fact-strip reveal"><div><div class="fact-number">2024<span> →</span></div><p>В коммерческой ML-разработке с августа</p></div><div><div class="fact-number">End<span>-to-</span>end</div><p>Данные, модели и внедрение</p></div><div><div class="fact-number">5<span> сфер</span></div><p>CV · LLM · VLM · OCR · NLP</p></div></div></section>
 <section id="experience" class="section wrap experience-summary" aria-labelledby="experience-title">
  <div class="section-top"><span class="section-index">02 / ОПЫТ</span><span class="mono">APPLIED IN THE REAL WORLD</span></div>
  <div class="experience-summary-grid">
   <aside class="experience-profile">
    <h2 id="experience-title">Коммерческий<br><em>опыт.</em></h2>
    <p class="experience-context">Работаю над ML-решениями для промышленности, производства и ритейла - от данных и моделей до интеграции и поддержки.</p>
   </aside>
   <article class="job">
    <div class="job-date">АВГУСТ 2024 - НАСТОЯЩЕЕ ВРЕМЯ</div>
    <div class="job-header"><h3>ООО «Smart Solutions»</h3><span class="pill">Москва</span></div>
    <p class="job-role">ML Engineer</p>
    <ul class="job-points">
     <li><strong>Данные и модели.</strong> Подготовка и разметка датасетов, обучение и дообучение моделей детекции, классификации и мультимодального анализа.</li>
     <li><strong>Прикладные пайплайны.</strong> Обработка изображений и RTSP-потоков, трекинг, ROI-зоны, подсчёт объектов и обработка событий.</li>
     <li><strong>Интеграция и поддержка.</strong> Подключение CV-сервисов к базам данных и внешним системам, логирование, мониторинг и восстановление после сбоев.</li>
     <li><strong>Локальные LLM/VLM.</strong> Развёртывание и интеграция моделей, настройка inference под оборудование заказчика, включая Apple Silicon и MLX.</li>
    </ul>
    <a class="experience-cases-link" href="#work">Направления и примеры работ <span aria-hidden="true">↗</span></a>
   </article>
  </div>
 </section>
 <section id="work" class="section wrap"><div class="section-top"><span class="section-index">03 / НАПРАВЛЕНИЯ И КЕЙСЫ</span><span class="mono">FROM EXPERIMENT TO PRODUCTION</span></div><div class="work-heading reveal"><h2>Пять направлений<span style="color:var(--accent)">.</span></h2><p>Задачи, подходы и демонстрации работы с изображениями и текстом.</p></div><div class="expertise-grid expertise-panels">${cards}</div></section>
 <section id="stack" class="section wrap compact-stack"><div class="section-top"><span class="section-index">04 / СТЕК</span><span class="mono">MY EVERYDAY TOOLKIT</span></div><div class="stack-layout"><div class="stack-intro reveal"><h2>Рабочий <em>стек.</em></h2><p>Основные инструменты по направлениям.</p></div><div class="stack-list reveal">${content.stacks.map(([name, items]) => `<div class="stack-row"><span class="stack-label">${name}</span><div class="stack-items">${items.map((s) => `<span class="pill">${s}</span>`).join("")}</div></div>`).join("")}</div></div></section>
 <section id="education" class="section wrap"><div class="section-top"><span class="section-index">05 / ОБРАЗОВАНИЕ</span><span class="mono">ALWAYS LEARNING</span></div><h2 class="reveal">Основа. <em>И развитие.</em></h2><div class="education-grid"><article class="education-main reveal"><span class="section-index">БАКАЛАВРИАТ · ВЫПУСК 2027</span><h3>МИРЭА - Российский<br>технологический университет</h3><p>Искусственный интеллект и машинное обучение</p><div class="education-meta"><span>Институт кибербезопасности<br>и цифровых технологий</span><span>Москва</span></div></article><div class="reveal"><article class="course"><span class="section-index">SAMSUNG · 2024</span><h3>Искусственный интеллект и машинное зрение</h3><p>Повышение квалификации</p></article><article class="course"><span class="section-index">ИННОПОЛИС · 2024</span><h3>Цифровая кафедра: технологии DevOps</h3><p>Повышение квалификации</p></article><div class="language-row"><span>Русский · родной</span><span>Английский · B1</span></div></div></div></section>
 <section id="contact" class="contact-section wrap"><div class="contact-top"><span class="section-index">06 / КОНТАКТЫ</span><span class="eyebrow"><span class="status-dot"></span> ОТКРЫТ К ПРЕДЛОЖЕНИЯМ</span></div><h2 class="reveal">Давайте создадим<br><span>что-то работающее.</span></h2><div class="contact-bottom reveal"><div><p>Рассматриваю позиции ML Engineer.<br>Полная занятость или стажировка,<br>удалённый или гибридный формат.</p><p>Не готов к переезду, готов к редким командировкам.</p><a class="contact-email" href="mailto:ivan.gru.05@mail.ru">ivan.gru.05@mail.ru</a><button class="copy-button" aria-label="Скопировать email"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4V16H8"/></svg></button><nav class="contact-socials" aria-label="Способы связи"><a href="https://t.me/Ivangruu1" target="_blank" rel="noopener noreferrer"><span>TELEGRAM</span><strong>@Ivangruu1</strong><i aria-hidden="true">↗</i></a><a href="https://vk.ru/ivangruu1" target="_blank" rel="noopener noreferrer"><span>VK</span><strong>ivangruu1</strong><i aria-hidden="true">↗</i></a><a href="tel:+79051484891"><span>ТЕЛЕФОН</span><strong>+7 (905) 148-48-91</strong><i aria-hidden="true">↗</i></a></nav></div></div></section>`;
