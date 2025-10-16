import { streamOpenAI } from '../utils/api.js';

async function openSummaryWindow(selectionText) {
  const url = chrome.runtime.getURL(
    `src/summary/summary.html?t=${encodeURIComponent(selectionText.slice(0, 20000))}`
  );

  await chrome.windows.create({
    url,
    type: "popup",
    width: 520,
    height: 420,
    focused: true
  });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    try {
      if (msg?.type === "open-summary-window") {
        const text = (msg.payload?.text || "").trim();
        if (!text) throw new Error("Пустой текст");
        await openSummaryWindow(text);
        sendResponse({ ok: true });
        return;
      }

      if (msg?.type === "start-openai-stream") {
        const text = (msg.payload?.text || "").trim();
        if (!text) throw new Error("Пустой текст");

        const stream = await streamOpenAI({ text });
        for await (const chunk of stream) {
          chrome.tabs.sendMessage(sender.tab.id, {
            type: "openai-chunk",
            payload: { chunk }
          });
        }
        chrome.tabs.sendMessage(sender.tab.id, { type: "openai-done" });
        sendResponse({ ok: true });
        return;
      }
    } catch (e) {
      try {
        if (sender?.tab?.id) {
          chrome.tabs.sendMessage(sender.tab.id, {
            type: "openai-error",
            payload: String(e?.message || e)
          });
        }
      } catch {}
      sendResponse({ ok: false, error: String(e?.message || e) });
    }
  })();

  return true;
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'summarize-selection') return;

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !isInjectableUrl(tab.url || "")) return;

    const ok = await trySendMessage(tab.id, { type: 'sos-hotkey-summarize' });
    if (ok) return;

    await chrome.scripting.executeScript({ 
      target: { tabId: tab.id }, 
      files: ['src/content/content.js'] 
    });
    await trySendMessage(tab.id, { type: 'sos-hotkey-summarize' });
  } catch (err) {
    console.error('Error in command handler:', err);
  }
});


function isInjectableUrl(url) {
  if (/^https?:\/\//i.test(url)) return true;
  if (/^file:\/\//i.test(url)) return true;
  return false;
}

async function trySendMessage(tabId, message) {
  return await new Promise((resolve) => {
    try {
      chrome.tabs.sendMessage(tabId, message, () => {
        const err = chrome.runtime.lastError;
        if (err && /Receiving end does not exist/i.test(err.message || "")) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    } catch (e) {
      if (/Receiving end does not exist/i.test(String(e?.message || e))) {
        resolve(false);
      } else {
        resolve(true);
      }
    }
  });
}

