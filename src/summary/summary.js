const params = new URLSearchParams(location.search);
const text = params.get('t') || '';

const out = document.getElementById('out');
const statusEl = document.getElementById('status');
const src = document.getElementById('src');
src.value = text;

if (!text) {
  out.innerHTML = `<div class="err">Пустой текст</div>`;
  statusEl.style.display = 'none';
} else {
  chrome.runtime.sendMessage({ 
    type: "start-openai-stream", 
    payload: { text } 
  }, (resp) => {
    const err = chrome.runtime.lastError;
    if (err) {
      out.innerHTML = `<div class="err">${escapeHtml(err.message)}</div>`;
      statusEl.textContent = 'Ошибка';
      statusEl.classList.remove('loading');
      return;
    }
    if (resp && !resp.ok && resp.error) {
      out.innerHTML = `<div class="err">${escapeHtml(resp.error)}</div>`;
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
    out.innerHTML = `<div class="err">${escapeHtml(msg.payload || 'Ошибка запроса')}</div>`;
  }
});

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

