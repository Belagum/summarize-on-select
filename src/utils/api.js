export async function streamOpenAI({ text }) {
  const { openai_api_key, openai_model } = await chrome.storage.sync.get({
    openai_api_key: '',
    openai_model: 'gpt-4o-mini'
  });
  
  if (!openai_api_key) {
    throw new Error('Не задан OpenAI API key (в Options).');
  }

const system = [
  "Ты — беспощадный конденсатор смысла.",
  "Цель: передать тот же смысл значительно короче.",
  "Не добавляй новых фактов, интерпретаций или советов.",
  "Оставляй: решения, конкретные предложения, факты, ограничения, метрики, риски, следующие шаги.",
  "Убирай: воду, разговоры о процессе, намерения без действий, клише, бюрократию, повторы.",
  "Сохраняй имена, числа, даты и причинно-следственные связи. При необходимости сохраняй порядок идей.",
  "Если текст чрезмерно многословен — вычищай общие фразы и метакомментарии максимально строго.",
  "Язык вывода должен совпадать с языком источника.",
  "Если источник короткий (<120 слов), выдай 2–4 лаконичных предложения вместо пунктов.",
  "Цель по длине: ~10–20% от исходного текста. Жёсткий предел: ≤100 слов или ≤600 символов (что меньше).",
  "Без вступлений и заключений вроде «Итог:» или «В заключение».",
  "Отвечай ТОЛЬКО НА РУССКОМ."
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

