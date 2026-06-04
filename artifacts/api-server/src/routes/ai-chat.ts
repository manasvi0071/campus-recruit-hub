import { Router } from "express";
import OpenAI from "openai";

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are TalentBot, the AI assistant for TalentHub Campus — a campus recruitment management platform used by placement officers, students, and recruiters at Indian engineering colleges.

You help with:
- Placement preparation tips (resume writing, interview prep, coding rounds, aptitude tests)
- Campus recruitment process guidance (how drives work, application stages, offer letters)
- Career advice tailored to Indian engineering students (CGPA requirements, branch-specific guidance, package negotiations)
- Platform navigation (how to use TalentHub features)
- Skill gap analysis and recommendations
- Company-specific preparation tips for top MNCs (TCS, Infosys, Google, Microsoft, Amazon, etc.)

Be concise, practical, and encouraging. Use bullet points for lists. Format responses in markdown. Keep responses focused and helpful. When giving tips, be specific and actionable.`;

router.post("/ai/chat", async (req, res) => {
  const { messages } = req.body as {
    messages: { role: "user" | "assistant"; content: string }[];
  };

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
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1024,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error({ err }, "AI chat error");
    res.write(`data: ${JSON.stringify({ error: "AI service unavailable" })}\n\n`);
    res.end();
  }
});

export default router;
