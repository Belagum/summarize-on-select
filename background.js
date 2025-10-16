// SPDX-License-Identifier: Apache-2.0
// Copyright 2025 Vova Orig

async function streamOpenAI({ text }) {
  const { openai_api_key, openai_model } = await chrome.storage.sync.get({
    openai_api_key: '',
    openai_model: 'gpt-4o-mini'
  });
  if (!openai_api_key) throw new Error('Не задан OpenAI API key (в Options).');

  const system = [
  "You are a ruthless condenser.",
  "Goal: convey the same meaning much shorter.",
  "Do NOT add new facts, interpretations, or advice.",
  "Keep: decisions, concrete proposals, facts, constraints, metrics, risks, next steps.",
  "Drop: fluff, process talk (talking about discussing), vague intentions, clichés, bureaucracy speak, repetitions.",
  "Preserve names, numbers, dates, and causal links. Keep overall idea order when helpful.",
  "If the text is extremely verbose, remove generic phrases and meta commentary even more aggressively.",
  "Output language must match the source language.",
  "If the source is short (<120 words), output 2–4 concise sentences instead of bullets.",
  "Length target: ~10–20% of the original word count. Hard cap: ≤100 words or ≤600 characters, whichever comes first.",
  "No prefaces or endings like 'Summary:' or 'In conclusion'."
  ].join("\n");

  const user = `
  Condense the following text to its core ideas. Remove fluff and process language; keep only essential points and concrete takeaways.
  Text:
  """${text}"""
  `;

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openai_api_key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: openai_model || "gpt-4o-mini",
      stream: true,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ]
    })
  });

  if (!resp.ok || !resp.body) {
    const t = await resp.text().catch(() => "");
    throw new Error(`HTTP ${resp.status}. ${t}`);
  }
  const reader = resp.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  return {
    async *[Symbol.asyncIterator]() {
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let idx;
          while ((idx = buffer.indexOf("\n")) >= 0) {
            const line = buffer.slice(0, idx).trim();
            buffer = buffer.slice(idx + 1);
            if (!line || !line.startsWith("data:")) continue;

            const data = line.replace(/^data:\s*/, "");
            if (data === "[DONE]") return;

            try {
              const json = JSON.parse(data);
              const delta = json.choices?.[0]?.delta?.content || "";
              if (delta) yield delta;
            } catch {
            }
          }
        }
      } finally {
        try { reader.releaseLock?.(); } catch {}
      }
    }
  };
}

async function openSummaryWindow(selectionText) {
  const url = chrome.runtime.getURL(
    `summary.html?t=${encodeURIComponent(selectionText.slice(0, 20000))}`
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

    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
    await trySendMessage(tab.id, { type: 'sos-hotkey-summarize' });
  } catch {
  }
});

function isInjectableUrl(url) {
  if (/^https?:\/\//i.test(url)) return true;
  if (/^file:\/\//i.test(url)) return true;
  return false;
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
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
      if (/Receiving end does not exist/i.test(String(e?.message || e))) resolve(false);
      else resolve(true);
    }
  });
}
