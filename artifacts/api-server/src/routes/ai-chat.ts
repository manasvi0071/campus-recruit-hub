import { Router } from "express";

const router = Router();

const SYSTEM_PROMPT = `You are TalentBot, an AI assistant for TalentHub Campus helping Indian engineering students with placement preparation, resume tips, interview prep, and career guidance. Be concise, practical and encouraging. Use bullet points. Format in markdown.`;

router.post("/ai/chat", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "messages array is required" });
    return;
  }
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        max_tokens: 1024,
        stream: true,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages.map((m: any) => ({ role: m.role, content: m.content }))],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.log("GROQ ERROR:", errText);
      res.write(`data: ${JSON.stringify({ content: "AI service error: " + errText })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
      return;
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const data = JSON.parse(jsonStr);
            const content = data.choices?.[0]?.delta?.content;
            if (content) res.write(`data: ${JSON.stringify({ content })}\n\n`);
          } catch {}
        }
      }
    }
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: any) {
    console.log("ERROR:", err.message);
    res.write(`data: ${JSON.stringify({ content: "Connection error: " + err.message })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  }
});

export default router;
