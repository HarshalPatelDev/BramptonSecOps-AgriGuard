// Optional local server: serves the planner and adds POST /api/personalize, which asks
// Claude to rewrite the approved fix steps for one system in plain, business-specific words.
// The API key stays on this server; the browser never sees it. Without this server, the
// planner falls back to its built-in (non-AI) personalization.
//
//   npm install
//   ANTHROPIC_API_KEY=... npm start      # then open http://localhost:8000
import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PORT) || 8000;
const client = new Anthropic();

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

// Scoring and the approved steps stay deterministic in app.js; the model only rewords them.
const SYSTEM_PROMPT = `You help owners of small food and farm businesses fix security gaps.
You receive one system, what the owner says they use it for, one risk, and the approved fix steps.
Rewrite the approved steps as 3 to 4 short tips for this specific business.
Rules:
- Use very simple, non-technical words. No acronyms. Each tip is one sentence under 20 words.
- Only use the approved steps and the facts given. Do not invent products, settings, or menu names.
- For production equipment (cold rooms, packing lines, sensors), remind them to change things only when production is safe to pause.
- Output one tip per line, each starting with "- ". No other text.`;

const clip = (value, max) => String(value ?? "").slice(0, max);

async function personalize(body) {
  const system = body?.system ?? {};
  const risk = body?.risk ?? {};
  const steps = Array.isArray(risk.approvedSteps) ? risk.approvedSteps.slice(0, 8).map((step) => clip(step, 300)) : [];
  // Answers are wrapped as data so text in them is not treated as instructions.
  const facts = {
    system: clip(system.name, 80), kind: clip(system.type, 60), area: clip(system.area, 60),
    usedFor: clip(system.usedFor, 240), ifItFails: clip(system.ifItFails, 240), owner: clip(system.owner, 60),
    risk: clip(risk.title, 120), whyFlagged: clip(risk.why, 300), approvedSteps: steps,
  };

  const response = await client.beta.messages.create({
    model: "claude-opus-5",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: `<answers>\n${JSON.stringify(facts, null, 2)}\n</answers>` }],
  });
  if (response.stop_reason === "refusal") return [];

  const text = response.content.filter((block) => block.type === "text").map((block) => block.text).join("\n");
  return text.split("\n")
    .map((line) => line.replace(/^\s*[-*•]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 5);
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let data = "";
    request.on("data", (chunk) => {
      data += chunk;
      if (data.length > 20000) reject(new Error("Request too large"));
    });
    request.on("end", () => {
      try { resolve(JSON.parse(data || "{}")); } catch (error) { reject(error); }
    });
    request.on("error", reject);
  });
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  if (url.pathname === "/api/personalize") {
    if (request.method !== "POST") {
      response.writeHead(405).end();
      return;
    }
    try {
      const points = await personalize(await readJson(request));
      response.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ points }));
    } catch (error) {
      if (error instanceof Anthropic.APIError) console.error(`Claude API error ${error.status}: ${error.message}`);
      else console.error(error);
      response.writeHead(502, { "Content-Type": "application/json" }).end(JSON.stringify({ points: [] }));
    }
    return;
  }

  const relative = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const file = path.resolve(root, `.${relative}`);
  if (!file.startsWith(root + path.sep) || file.includes(`${path.sep}server${path.sep}`) || file.includes(`${path.sep}node_modules${path.sep}`)) {
    response.writeHead(404).end();
    return;
  }
  try {
    const content = await readFile(file);
    response.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" }).end(content);
  } catch {
    response.writeHead(404).end("Not found");
  }
});

server.listen(port, () => console.log(`AgriGuard running at http://localhost:${port}`));
