# Summarize On Select

Расширение для браузеров Chrome и Firefox, которое создает краткую сводку выделенного текста с помощью OpenAI API.

## Возможности

- ✨ Выделите текст на любой странице
- ⌨️ Нажмите **Alt+N** 
- 🚀 Краткая сводка откроется в отдельном окне с потоковой загрузкой
- ⚙️ Настраиваемая модель OpenAI (gpt-4o-mini, gpt-4o и др.)
- 🔄 Поддержка Chrome и Firefox

## Установка

### Firefox
📦 **Скачать из Firefox Add-ons**: [https://addons.mozilla.org/en-US/firefox/addon/summarize-on-select/](https://addons.mozilla.org/en-US/firefox/addon/summarize-on-select/)

### Chrome
📦 **Скачать из исходников**:
1. Скачайте архив `summarize-on-select-chrome.zip`
2. Откройте Chrome и перейдите на `chrome://extensions/`
3. Включите **Режим разработчика** (Developer mode)
4. Нажмите **Загрузить распакованное расширение** (Load unpacked)
5. Выберите распакованную папку с проектом

### Настройка

1. Перейдите к расширению в браузере и нажмите **Параметры расширения** (Extension options)
2. Введите ваш OpenAI API ключ (получите на [platform.openai.com](https://platform.openai.com/api-keys))
3. Выберите модель (по умолчанию `gpt-4o-mini`)
4. Нажмите **Сохранить**

## Использование

1. Выделите текст на любой веб-странице
2. Нажмите **Alt+N** (или настроенную комбинацию клавиш)
3. Откроется всплывающее окно с краткой сводкой выделенного текста
4. Сводка генерируется с помощью OpenAI API с потоковой загрузкой

## Технологии

- **Manifest V3** - современный стандарт расширений
- **ES Modules** - современный JavaScript
- **OpenAI API** - с поддержкой streaming
- **Chrome/Firefox Extension APIs** - storage, scripting, commands

## Безопасность

- API ключ хранится локально в браузере
- Данные не отправляются третьим лицам (только в OpenAI)
- Открытый исходный код для проверки

## Поддержка браузеров

- **Firefox**: Доступно в [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/summarize-on-select/)
- **Chrome**: Установка из исходников или архива

## Лицензия

Apache-2.0 © 2025 Vova Orig. См. LICENSE и NOTICE.

## Поддержка

При возникновении проблем создайте issue в репозитории или напишите мне в [Telegram](https://t.me/ru_nl).

---

**Примечание:** Для работы расширения необходим действующий OpenAI API ключ.
