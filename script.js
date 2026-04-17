const CLOUDFLARE_WORKER_URL = "https://loreal-chatbot.qv-orpheus.workers.dev/";

const SYSTEM_PROMPT =
  "You are the L'Oréal Beauty Assistant. You ONLY help users with L'Oréal products, routines, recommendations, and beauty topics (skincare, haircare, makeup, fragrance). If a user asks about anything outside of that scope — politics, coding, general trivia, other brands in an off-topic way, etc. — politely refuse in one short sentence and redirect them to L'Oréal-related questions. Keep answers concise, friendly, and on-brand.";

const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const latestQuestion = document.getElementById("latestQuestion");

const messages = [{ role: "system", content: SYSTEM_PROMPT }];

function appendBubble(role, text, extraClass = "") {
  const bubble = document.createElement("div");
  bubble.className = `msg ${role}${extraClass ? " " + extraClass : ""}`;
  bubble.textContent = text;
  chatWindow.appendChild(bubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return bubble;
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = userInput.value.trim();
  if (!text) return;

  latestQuestion.textContent = text;
  appendBubble("user", text);
  messages.push({ role: "user", content: text });

  userInput.value = "";
  userInput.disabled = true;

  const thinking = appendBubble("assistant", "…");

  try {
    const res = await fetch(CLOUDFLARE_WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    const data = await res.json();
    const reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      "Sorry, I couldn't generate a response.";

    thinking.remove();
    appendBubble("assistant", reply);
    messages.push({ role: "assistant", content: reply });
  } catch (err) {
    thinking.remove();
    appendBubble(
      "assistant",
      "The assistant is temporarily unavailable. Please try again shortly.",
      "error",
    );
  } finally {
    userInput.disabled = false;
    userInput.focus();
  }
});
