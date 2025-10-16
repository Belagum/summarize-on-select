// SPDX-License-Identifier: Apache-2.0
// Copyright 2025 Vova Orig

const apiKeyEl = document.getElementById('apiKey');
const modelEl  = document.getElementById('model');
const languageEl = document.getElementById('language');
const statusEl = document.getElementById('status');
const saveBtn  = document.getElementById('save');

(async function init() {
  const { openai_api_key, openai_model, response_language } = await chrome.storage.sync.get({
    openai_api_key: '',
    openai_model: 'gpt-4o-mini',
    response_language: 'auto'
  });
  apiKeyEl.value = openai_api_key;
  modelEl.value  = openai_model;
  languageEl.value = response_language;
})();

saveBtn.addEventListener('click', async () => {
  const openai_api_key = apiKeyEl.value.trim();
  const openai_model   = modelEl.value.trim() || 'gpt-4o-mini';
  const response_language = languageEl.value || 'auto';

  try {
    await chrome.storage.sync.set({ openai_api_key, openai_model, response_language });
    statusEl.textContent = '✓ Сохранено';
    statusEl.className = 'ok';
    setTimeout(() => {
      statusEl.textContent = '';
      statusEl.className = '';
    }, 2000);
  } catch (e) {
    statusEl.textContent = '✗ Ошибка сохранения';
    statusEl.className = 'err';
  }
});

apiKeyEl.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') saveBtn.click();
});

modelEl.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') saveBtn.click();
});

document.getElementById('openShortcuts').addEventListener('click', () => {
  chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
});

