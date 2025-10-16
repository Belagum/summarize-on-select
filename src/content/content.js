// SPDX-License-Identifier: Apache-2.0
// Copyright 2025 Vova Orig

(function () {
  const HOTKEY_MIN_CHARS = 8;

  async function openSummaryWindow(text) {
    try {
      await chrome.runtime.sendMessage({ 
        type: "open-summary-window", 
        payload: { text } 
      });
    } catch (err) {
      console.error('Error opening summary window:', err);
    }
  }

  function getSelectionText() {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return '';
    return sel.toString().trim();
  }

  chrome.runtime.onMessage.addListener(async (msg) => {
    if (msg?.type !== 'sos-hotkey-summarize') return;
    const text = getSelectionText();
    if (!text || text.length < HOTKEY_MIN_CHARS) {
      toast('Выделите текст и нажмите Alt+N');
      return;
    }
    await openSummaryWindow(text);
  });

  function toast(s) {
    const el = document.createElement('div');
    el.textContent = s;
    el.style.cssText = `
      position: fixed; left: 50%; transform: translateX(-50%);
      bottom: 24px; padding: 10px 14px; border-radius: 8px;
      background: rgba(0,0,0,.86); color: #fff; z-index: 2147483647;
      font: 13px/1.4 system-ui, -apple-system, Segoe UI, Roboto, Arial;
      box-shadow: 0 6px 18px rgba(0,0,0,.3);
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  }
})();

