# Summarize On Select

Расширение для Chrome, которое создает краткую сводку выделенного текста с помощью OpenAI API.

## Возможности

- ✨ Выделите текст на любой странице
- ⌨️ Нажмите **Alt+N** 
- 🚀 Краткая сводка откроется в отдельном окне с потоковой загрузкой
- ⚙️ Настраиваемая модель OpenAI (gpt-4o-mini, gpt-4o и др.)

## Установка

### Из исходников (для разработки)

1. Скачайте или клонируйте репозиторий
2. Откройте Chrome и перейдите на `chrome://extensions/`
3. Включите **Режим разработчика** (Developer mode)
4. Нажмите **Загрузить распакованное расширение** (Load unpacked)
5. Выберите папку с проектом

### Настройка

1. Перейдите на `chrome://extensions/` и нажмите **Параметры расширения** (Extension options)
2. Введите ваш OpenAI API ключ (получите на [platform.openai.com](https://platform.openai.com/api-keys))
3. Выберите модель (по умолчанию `gpt-4o-mini`)
4. Нажмите **Сохранить**

## Использование

1. Выделите текст на странице
2. Нажмите **Alt+N**
3. Откроется окно с краткой сводкой

## Структура проекта

```
summarize-on-select/
├── src/
│   ├── background/         # Service worker
│   ├── content/            # Content scripts
│   ├── summary/            # Окно с результатом
│   ├── options/            # Страница настроек
│   └── utils/              # Утилиты (API)
├── manifest.json           # Манифест расширения
└── README.md
```

## Технологии

- **Manifest V3** - новейший стандарт расширений Chrome
- **ES Modules** - современный JavaScript
- **OpenAI API** - с поддержкой streaming
- **Chrome Extension APIs** - storage, scripting, commands

## Безопасность

- API ключ хранится локально в `chrome.storage.sync`
- Данные не отправляются третьим лицам (только в OpenAI)
- Открытый исходный код для проверки

## Разработка

### Структура кода

- `src/utils/api.js` - логика работы с OpenAI API
- `src/background/background.js` - обработчик команд и сообщений
- `src/content/content.js` - работа с выделением текста на странице
- `src/summary/` - окно отображения результатов
- `src/options/` - страница настроек

### Команды клавиатуры

Вы можете изменить хоткей в `chrome://extensions/shortcuts`

## Лицензия

Apache-2.0 © 2025 Vova Orig. См. LICENSE и NOTICE.


## Поддержка

При возникновении проблем создайте issue в репозитории или напишите мне в телеграмм(t.me/ru_nl).

---

**Примечание:** Для работы расширения необходим действующий OpenAI API ключ.

## Browser support

- Chrome: use `manifest.json` or the archive `summarize-on-select-chrome.zip` from `build.ps1`.
- Firefox: use `manifest.firefox.json` (rename to `manifest.json` before loading) or `summarize-on-select-firefox.zip`.
