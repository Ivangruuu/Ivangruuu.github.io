// Add local image/GIF paths here, e.g. './assets/detection.gif'. Empty slots use animated diagrams.
window.resumeContent = {
  portrait: './assets/ivan-gruzdev.png?v=20261009-2339',
  media: { vision: './assets/cv-original-51.mp4', language: './assets/llm-qwen-terminal-cropped.mp4', multimodal: './assets/vlm-qwen-terminal-57.mp4' },
  mediaPosters: { vision: './assets/cv-demo-poster.jpg' },
  mediaGalleries: {
    multimodal: [{
      type: 'video', src: './assets/vlm-qwen-terminal-57.mp4', width: 1920, height: 976,
      title: 'Распознавание мойки оборудования — Qwen3-VL',
      summary: 'Локальная Qwen3-VL анализирует два кадра производственного участка. Для каждого изображения модель возвращает JSON с видимыми признаками: вода, пена, сотрудник и шланг, а также вывод о том, происходит ли мойка оборудования.',
      tags: ['Qwen3-VL', 'MLX', 'Local inference', 'Image + Text', 'JSON']
    }],
    language: [{
      type: 'video', src: './assets/llm-qwen-terminal-cropped.mp4',
      title: 'Локальная Qwen через MLX — структурирование заявок',
      summary: 'Qwen читает сообщение из текстового файла и извлекает сведения об инциденте в JSON: сервис, окружение, проблему, срочность и требуемое действие.'
    }],
    vision: [
      {
        id: 'cv-case-line', type: 'video', src: './assets/cv-original-51.mp4',
        title: 'Детекция и подсчёт на производственной линии', shortTitle: 'Подсчёт продукции',
        summary: 'Обработка видеопотока с конвейера: система находит продукцию, отслеживает её движение и считает события в заданной зоне.',
        task: 'Автоматизировать подсчёт объектов на производственной линии по видео с камеры.',
        pipeline: ['Детекция продукции и людей в кадре','Трекинг объектов и контроль перемещения относительно ROI','Подсчёт входов и выходов с обновлением счётчиков'],
        tags: ['YOLO', 'Tracking', 'ROI', 'Object counting']
      },
      {
        id: 'cv-case-roi', type: 'video', src: './assets/cv-original-52-1.mp4',
        title: 'Трекинг объектов, работа с ROI-зонами и классификация ResNet', shortTitle: 'Трекинг + ResNet',
        summary: 'Пайплайн объединяет детекцию, трекинг и классификацию. Положение объекта в зонах CHECK и PHOTO определяет момент получения снимка для анализа.',
        task: 'Получать снимок объекта в нужной зоне и выполнять классификацию с помощью ResNet.',
        pipeline: ['Детекция YOLO и сопровождение объекта с ByteTrack','Проверка последовательности прохождения ROI-зон CHECK и PHOTO','Классификация полученного изображения моделью ResNet'],
        tags: ['YOLO', 'ByteTrack', 'ROI', 'ResNet', 'Classification']
      },
      {
        id: 'cv-case-pose', type: 'video', src: './assets/cv-original-54.mp4',
        title: 'Оценка позы человека — YOLO Pose', shortTitle: 'Оценка позы',
        summary: 'Модель определяет положение человека и ключевые точки тела в видеопотоке. Скелетная разметка обновляется вместе с движением в кадре.',
        task: 'Определять позу человека по видео и визуализировать положение ключевых точек тела.',
        pipeline: ['Детекция человека в кадре','Оценка координат ключевых точек с YOLO Pose','Отрисовка скелета и обновление позы во времени'],
        tags: ['YOLO Pose', 'Keypoints', 'Pose estimation', 'Video inference']
      }
    ]
  },
  expertise: [
    { id:'vision', number:'01', short:'CV', category:'COMPUTER VISION', title:'Компьютерное зрение', description:'От размеченного датасета до видеопотока в production. Полный цикл разработки систем, которые видят и реагируют.', tags:['PyTorch','OpenCV','YOLO','ResNet','EfficientNet','CVAT','RTSP','SQL'], highlights:['Детекция, классификация, трекинг и оценка позы','RTSP в реальном времени, ROI-зоны и подсчёт объектов','Интеграция, мониторинг и стабильность в production'], detail:'Полный цикл Computer Vision: подготовка и разметка данных в CVAT, обучение и валидация моделей на PyTorch, разработка inference-пайплайнов и внедрение в production для промышленности, производства и ритейла.', points:['Детекция и классификация на базе YOLO, ResNet и EfficientNet','Трекинг объектов и оценка позы человека','Обработка изображений и RTSP-видеопотоков в реальном времени','ROI-зоны, подсчёт объектов, обработка событий и бизнес-логика','Интеграция с базами данных и внешними системами','Оптимизация производительности, логирование, мониторинг и восстановление после сбоев'], diagram:'vision', flow:['DATASET','MODEL','EVENTS'] },
    { id:'language', number:'02', short:'LLM', category:'LARGE LANGUAGE MODELS', title:'Большие языковые модели', description:'Qwen, Llama и DeepSeek. Локальный запуск через Ollama, настройка inference и интеграция в прикладные решения.', tags:['Qwen','Llama','DeepSeek','Ollama','MLX','Apple Silicon'], highlights:['Развёртывание языковых моделей с Ollama и MLX','Настройка inference под доступные вычислительные ресурсы','Интеграция моделей с прикладной логикой'], detail:'Работа с семействами Qwen, Llama и DeepSeek. Локальное развёртывание языковых моделей с Ollama, настройка inference и интеграция в прикладные решения с учётом инфраструктуры и требований задачи.', points:['Qwen, Llama и DeepSeek для работы с текстом','Локальный запуск через Ollama и настройка inference','MLX и Apple Silicon','Адаптация к оборудованию и инфраструктуре'], diagram:'language', flow:['PROMPT','CONTEXT','RESPONSE'] },
    { id:'multimodal', number:'03', short:'VLM', category:'VISION LANGUAGE MODELS', title:'Визуально-языковые модели', description:'Qwen-VL и Llama Vision. Соединяю изображения и текстовый контекст в одном мультимодальном пайплайне.', tags:['Qwen-VL','Llama Vision','Multimodal','Local inference'], highlights:['Анализ изображений с учётом текстового запроса','Работа с визуальным и языковым контекстом','Локальное развёртывание и интеграция VLM'], detail:'Работа с Qwen-VL и Llama Vision для мультимодального анализа изображений. Развёртывание и интеграция визуально-языковых моделей на локальном оборудовании.', points:['Qwen-VL и Llama Vision','Совместная обработка визуального и текстового контекста','Настройка локального inference','Интеграция мультимодального анализа в прикладные решения'], diagram:'multimodal', flow:['IMAGE + TEXT','VLM','RESPONSE'] },
    { id:'ocr', number:'04', short:'OCR', category:'OPTICAL CHARACTER RECOGNITION', title:'Распознавание текста', description:'Использую OpenCV и Tesseract / pytesseract для предобработки изображений и распознавания текста на документах, фотографиях и кадрах с камер.', tags:['OpenCV','Tesseract','pytesseract'], highlights:['Предобработка изображений с OpenCV','Распознавание текста с Tesseract / pytesseract','Документы, фотографии и кадры с камер'], detail:'Использую OpenCV и Tesseract / pytesseract для предобработки изображений и распознавания текста на документах, фотографиях и кадрах с камер.', points:['Предобработка изображений с OpenCV','Распознавание текста с Tesseract','Работа с Tesseract из Python через pytesseract','Обработка документов, фотографий и кадров с камер'], diagram:'ocr', flow:['IMAGE','OCR','TEXT'] },
    { id:'nlp', number:'05', short:'NLP', category:'NATURAL LANGUAGE PROCESSING', title:'Обработка естественного языка', description:'От предобработки текста до семантического поиска. Решал задачи классификации, анализа тональности и эмоций, извлечения сущностей и кластеризации.', tags:['spaCy','Hugging Face Transformers','Natasha','BERT','RuBERT'], highlights:['Предобработка и токенизация текстов','Классификация, анализ тональности и эмоций','Извлечение сущностей, семантический поиск и кластеризация'], detail:'Решал задачи обработки естественного языка с использованием spaCy, Hugging Face Transformers, Natasha и моделей BERT / RuBERT.', points:['Предобработка и токенизация текстов','Классификация текстов','Анализ тональности и эмоций','Извлечение именованных сущностей','Семантический поиск','Кластеризация текстов'], diagram:'nlp', flow:['TEXT','MODEL','INSIGHTS'] }
  ]
};
