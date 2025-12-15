// Русские переводы для Research Assistant

export const ru = {
  // Общее
  app: {
    title: 'Научный Ассистент',
    version: 'версия',
  },

  // Навигация
  nav: {
    library: 'Библиотека',
    search: 'Поиск',
    directions: 'Направления',
    quiz: 'Квиз',
    quizMatching: 'Игра: найди пары',
    progress: 'Прогресс',
    notes: 'Заметки',
  },

  // Пользователь
  user: {
    guest: 'Гость',
    level: 'Уровень',
    points: 'очков',
  },

  // Библиотека
  library: {
    title: 'Библиотека статей',
    uploadArticle: 'Загрузить статью',
    hideUpload: 'Скрыть загрузку',
    search: 'Поиск по названию, автору, ключевым словам...',
    sortBy: 'Сортировать по',
    filterBySource: 'Фильтр по источнику',
    all: 'Все',
    upload: 'Загрузка',
    arxiv: 'arXiv',
    semanticScholar: 'Semantic Scholar',
    url: 'URL',
    newest: 'Сначала новые',
    oldest: 'Сначала старые',
    titleAZ: 'Название (А-Я)',
    titleZA: 'Название (Я-А)',
    showing: 'Показано',
    of: 'из',
    articles: 'статей',
    noArticles: 'Статей пока нет. Загрузите первую статью!',
    noResults: 'Статей по вашему запросу не найдено.',
    deleteConfirm: 'Вы уверены, что хотите удалить эту статью?',
    published: 'Опубликовано',
  },

  // Загрузка статей
  upload: {
    title: 'Загрузить статью',
    dragDrop: 'Перетащите PDF файл сюда или нажмите для выбора',
    orDivider: 'ИЛИ',
    pasteUrl: 'Вставьте URL статьи',
    urlPlaceholder: 'https://arxiv.org/pdf/...',
    uploadButton: 'Загрузить',
    uploading: 'Загрузка...',
    processing: 'Обработка PDF...',
    success: 'Статья успешно загружена!',
    error: 'Ошибка загрузки статьи',
  },

  // Поиск
  search: {
    title: 'Поиск научных статей',
    query: 'Поисковый запрос',
    queryPlaceholder: 'Введите тему или ключевые слова...',
    source: 'Источник',
    maxResults: 'Максимум результатов',
    searchButton: 'Искать',
    searching: 'Поиск...',
    results: 'Результаты поиска',
    noResults: 'Результатов не найдено',
    import: 'Импортировать',
    importing: 'Импорт...',
    imported: 'Импортировано',
    viewPdf: 'Смотреть PDF',
  },

  // Направления исследований
  directions: {
    title: 'Направления исследований',
    generate: 'Сгенерировать направления',
    generating: 'Генерация...',
    selectArticles: 'Выберите статьи для анализа',
    noArticles: 'Нет статей для анализа',
    relevance: 'Релевантность',
    novelty: 'Новизна',
    questions: 'Исследовательские вопросы',
    rationale: 'Обоснование',
  },

  // Квиз
  quiz: {
    title: 'Квиз',
    selectArticle: 'Выберите статью',
    generate: 'Сгенерировать квиз',
    generating: 'Генерация вопросов...',
    question: 'Вопрос',
    of: 'из',
    next: 'Следующий',
    previous: 'Предыдущий',
    submit: 'Отправить ответы',
    results: 'Результаты',
    score: 'Результат',
    correct: 'Правильно',
    incorrect: 'Неправильно',
    yourAnswer: 'Ваш ответ',
    correctAnswer: 'Правильный ответ',
    tryAgain: 'Попробовать снова',
  },

  // Прогресс
  progress: {
    title: 'Ваш прогресс',
    overview: 'Обзор',
    level: 'Уровень',
    points: 'Очки',
    nextLevel: 'До следующего уровня',
    achievements: 'Достижения',
    unlocked: 'Разблокировано',
    locked: 'Заблокировано',
    statistics: 'Статистика',
    articlesAnalyzed: 'Проанализировано статей',
    quizzesCompleted: 'Пройдено квизов',
    notesCreated: 'Создано заметок',
    leaderboard: 'Таблица лидеров',
    rank: 'Место',
    user: 'Пользователь',
  },

  // Заметки
  notes: {
    title: 'Заметки',
    create: 'Создать заметку',
    edit: 'Редактировать',
    delete: 'Удалить',
    save: 'Сохранить',
    cancel: 'Отмена',
    content: 'Содержание',
    tags: 'Теги',
    tagsPlaceholder: 'Добавьте теги через запятую',
    article: 'Статья',
    section: 'Раздел',
    sectionPlaceholder: 'Введение, Методология и т.д.',
    search: 'Поиск заметок...',
    noNotes: 'Заметок пока нет',
    deleteConfirm: 'Удалить эту заметку?',
  },

  // Просмотр статьи
  article: {
    summary: 'Краткое содержание',
    generateSummary: 'Сгенерировать краткое содержание',
    generating: 'Генерация...',
    objective: 'Цель',
    methodology: 'Методология',
    results: 'Результаты',
    conclusions: 'Выводы',
    keyFindings: 'Ключевые находки',
    authors: 'Авторы',
    keywords: 'Ключевые слова',
    publicationDate: 'Дата публикации',
    source: 'Источник',
    content: 'Содержание',
  },

  // Ошибки
  errors: {
    generic: 'Произошла ошибка',
    network: 'Ошибка сети. Проверьте подключение к интернету.',
    notFound: 'Ресурс не найден',
    unauthorized: 'Требуется авторизация',
    serverError: 'Ошибка сервера. Попробуйте позже.',
    offline: 'Вы не в сети. Данные недоступны в кэше.',
    tryAgain: 'Попробовать снова',
    goHome: 'На главную',
  },

  // Кнопки и действия
  actions: {
    close: 'Закрыть',
    open: 'Открыть',
    view: 'Просмотр',
    edit: 'Редактировать',
    delete: 'Удалить',
    save: 'Сохранить',
    cancel: 'Отмена',
    confirm: 'Подтвердить',
    back: 'Назад',
    next: 'Далее',
    previous: 'Предыдущий',
    loading: 'Загрузка...',
    refresh: 'Обновить',
  },

  // Статусы подключения
  connection: {
    online: 'В сети',
    offline: 'Не в сети',
    reconnecting: 'Переподключение...',
    syncPending: 'Ожидает синхронизации',
    syncing: 'Синхронизация...',
  },
};

export default ru;
