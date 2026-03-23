import { Bot, webhookCallback } from "grammy";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ─── Storage (Firebase or in-memory fallback) ────────────────────────────────
let db = null;


// In-memory fallback (lost on cold starts, fine for testing)
const memoryStore = new Map();

async function addMessage(userId, role, content) {
  const firestore = await getFirestoreDb();
  if (firestore) {
    await firestore
      .collection("users")
      .doc(userId)
      .collection("messages")
      .add({ role, content, timestamp: new Date() });
  } else {
    if (!memoryStore.has(userId)) memoryStore.set(userId, []);
    memoryStore.get(userId).push({ role, content });
  }
}

async function getHistory(userId, limit = 10) {
  const firestore = await getFirestoreDb();
  if (firestore) {
    const snap = await firestore
      .collection("users")
      .doc(userId)
      .collection("messages")
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();
    return snap.docs.map((d) => d.data()).reverse();
  } else {
    const msgs = memoryStore.get(userId) || [];
    return msgs.slice(-limit);
  }
}

async function getFirestoreDb() {
  const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!sa) return null;
  if (db) return db;
  try {
    const { initializeApp, cert, getApps } = await import("firebase-admin/app");
    const { getFirestore } = await import("firebase-admin/firestore");
    if (getApps().length === 0) {
      initializeApp({ credential: cert(JSON.parse(sa)) });
    }
    db = getFirestore();
    return db;
  } catch (e) {
    console.error("Firebase init failed:", e.message);
    return null;
  }
}

// ─── Tools ───────────────────────────────────────────────────────────────────
const tools = [
  {
    type: "function",
    function: {
      name: "get_current_time",
      description: "Get the current time and date in ISO format",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
];

async function executeTool(name) {
  if (name === "get_current_time") return new Date().toISOString();
  return `Error: Tool '${name}' not found.`;
}

// ─── LLM ─────────────────────────────────────────────────────────────────────
async function chat(messages) {
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  const systemPrompt = {
    role: "system",
    content:
      "You are meclaw, a personal AI assistant. You communicate clearly and concisely. Use tools only when necessary.",
  };

  let thread = [systemPrompt, ...messages];
  const loopLimit = 5;

  for (let i = 0; i < loopLimit; i++) {
    try {
      const groq = new Groq({ apiKey: groqKey });
      const res = await groq.chat.completions.create({
        messages: thread,
        model: "llama-3.3-70b-versatile",
        tools,
        tool_choice: "auto",
      });

      const msg = res.choices[0]?.message;
      if (!msg) throw new Error("No response from Groq");

      if (msg.tool_calls?.length) {
        thread.push(msg);
        for (const tc of msg.tool_calls) {
          const result = await executeTool(tc.function.name);
          thread.push({ role: "tool", tool_call_id: tc.id, name: tc.function.name, content: result });
        }
        continue;
      }

      return msg.content || "No response.";
    } catch (err) {
      console.error("Groq error:", err.message);
      if (geminiKey) {
        try {
          const genAI = new GoogleGenerativeAI(geminiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
          const prompt = thread.map((m) => `${m.role}: ${m.content || ""}`).join("\n");
          const result = await model.generateContent(prompt);
          return result.response.text();
        } catch (geminiErr) {
          console.error("Gemini error:", geminiErr.message);
          return `Agent error: ${geminiErr.message}`;
        }
      }
      return `Agent error: ${err.message}`;
    }
  }

  return "Error: Agent loop limit reached.";
}

// ─── Bot Setup ────────────────────────────────────────────────────────────────
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set in environment variables.");

const bot = new Bot(token);

const allowedUsers = (process.env.ALLOWED_USERS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function isAllowed(userId) {
  return allowedUsers.length === 0 || allowedUsers.includes(String(userId));
}

bot.command("start", async (ctx) => {
  if (!isAllowed(ctx.from?.id)) return ctx.reply("❌ Unauthorized.");
  await ctx.reply("🚀 *MeClaw Bot* is online and running on Vercel!\nHow can I help you?", { parse_mode: "Markdown" });
});

bot.command("status", async (ctx) => {
  await ctx.reply("✅ *Bot Status*\nMode: Webhooks (Vercel)\nEnvironment: Production", { parse_mode: "Markdown" });
});

bot.on("message:text", async (ctx) => {
  if (!isAllowed(ctx.from?.id)) return ctx.reply("❌ Unauthorized.");

  await ctx.replyWithChatAction("typing");

  try {
    const userId = String(ctx.from.id);
    await addMessage(userId, "user", ctx.message.text);
    const history = await getHistory(userId, 10);
    const msgs = history.map((r) => ({ role: r.role, content: r.content }));
    const reply = await chat(msgs);
    await addMessage(userId, "assistant", reply);
    await ctx.reply(reply);
  } catch (err) {
    console.error("Handler error:", err);
    await ctx.reply(`⚠️ Error: ${err.message}`);
  }
});

bot.catch((err) => console.error("grammy error:", err.error));

// ─── Vercel Handler ───────────────────────────────────────────────────────────
export default webhookCallback(bot, "std/http");
