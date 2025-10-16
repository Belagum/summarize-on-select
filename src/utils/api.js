// SPDX-License-Identifier: Apache-2.0
// Copyright 2025 Vova Orig

export async function streamOpenAI({ text }) {
  const { openai_api_key, openai_model, response_language } = await chrome.storage.sync.get({
    openai_api_key: '',
    openai_model: 'gpt-4o-mini',
    response_language: 'auto'
  });
  
  if (!openai_api_key) {
    throw new Error('Не задан OpenAI API key (в Options).');
  }

  let languageInstruction = "";
  switch (response_language) {
    case 'russian':
      languageInstruction = "Отвечай ТОЛЬКО НА РУССКОМ языке.";
      break;
    case 'english':
      languageInstruction = "Respond ONLY IN ENGLISH.";
      break;
    case 'chinese':
      languageInstruction = "只用中文回答。";
      break;
    case 'auto':
    default:
      languageInstruction = "Язык вывода должен совпадать с языком источника. Output language must match the source language.";
      break;
  }

const system = [
  "You are a ruthless condenser of meaning.",
  "Goal: convey the same meaning much shorter.",
  "Do NOT add new facts, interpretations, or advice.",
  "Keep: decisions, concrete proposals, facts, constraints, metrics, risks, next steps.",
  "Drop: fluff, process talk (talking about discussing), vague intentions, clichés, bureaucracy speak, repetitions.",
  "Preserve names, numbers, dates, and causal links. Keep overall idea order when helpful.",
  "If the text is extremely verbose, remove generic phrases and meta commentary even more aggressively.",
  "If the source is short (<120 words), output 2–4 concise sentences instead of bullets.",
  "Length target: ~10–20% of the original word count. Hard cap: ≤100 words or ≤600 characters, whichever comes first.",
  "No prefaces or endings like 'Summary:' or 'In conclusion'.",
  languageInstruction
].join("\n");


  const user = `Condense the following text to its core ideas. Remove fluff and process language; keep only essential points and concrete takeaways.
Text:
"""${text}"""`;

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

