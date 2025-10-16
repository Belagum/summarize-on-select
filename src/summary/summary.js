// SPDX-License-Identifier: Apache-2.0
// Copyright 2025 Vova Orig

const params = new URLSearchParams(location.search);
const text = params.get('t') || '';

const out = document.getElementById('out');
const statusEl = document.getElementById('status');
const src = document.getElementById('src');
src.value = text;
out.textContent = '';

if (!text) {
  showError('Пустой текст');
  statusEl.style.display = 'none';
} else {
  chrome.runtime.sendMessage({
    type: "start-openai-stream",
    payload: { text }
  }, (resp) => {
    const err = chrome.runtime.lastError;
    if (err) {
      showError(err.message);
      statusEl.textContent = 'Ошибка';
      statusEl.classList.remove('loading');
      return;
    }
    if (resp && !resp.ok && resp.error) {
      showError(resp.error);
      statusEl.textContent = 'Ошибка';
      statusEl.classList.remove('loading');
    }
  });
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "openai-chunk") {
    out.textContent += msg.payload?.chunk || '';
  }
  if (msg?.type === "openai-done") {
    statusEl.style.display = 'none';
  }
  if (msg?.type === "openai-error") {
    statusEl.textContent = 'Ошибка';
    statusEl.classList.remove('loading');
    showError(msg.payload || 'Ошибка запроса');
  }
});

function showError(message) {
  out.textContent = '';
  const errorEl = document.createElement('div');
  errorEl.className = 'err';
  errorEl.textContent = String(message ?? '');
  out.appendChild(errorEl);
}
