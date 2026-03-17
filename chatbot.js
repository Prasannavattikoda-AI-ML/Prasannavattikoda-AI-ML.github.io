/**
 * RAG Chatbot Widget
 * Set your Vercel deployment URL below after deploying rag-project to Vercel.
 * Example: "https://your-rag-project.vercel.app"
 */
(function () {
  // ✅ Change this to your Vercel deployment URL after deploying
  const API_URL = "https://rag-project-zeta.vercel.app";

  const toggle = document.getElementById("rag-chat-toggle");
  const chatBox = document.getElementById("rag-chat-box");
  const closeBtn = document.getElementById("rag-chat-close");
  const input = document.getElementById("rag-input");
  const sendBtn = document.getElementById("rag-send");
  const messages = document.getElementById("rag-messages");

  // Toggle chat open/close
  toggle.addEventListener("click", () => {
    chatBox.classList.toggle("rag-hidden");
    if (!chatBox.classList.contains("rag-hidden")) {
      input.focus();
    }
  });

  closeBtn.addEventListener("click", () => {
    chatBox.classList.add("rag-hidden");
  });

  // Send message
  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    appendMessage(text, "rag-user");
    input.value = "";

    const typing = appendMessage("Thinking...", "rag-bot rag-typing");

    fetch(`${API_URL}/api/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: text }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Server error");
        return res.json();
      })
      .then((data) => {
        typing.remove();
        appendMessage(data.answer, "rag-bot");

        if (data.sources && data.sources.length > 0) {
          const sourceText = data.sources
            .map((s) => `${s.title}`)
            .join(", ");
          appendMessage(`Sources: ${sourceText}`, "rag-bot rag-typing");
        }
      })
      .catch(() => {
        typing.remove();
        appendMessage(
          "Sorry, I couldn't connect to the AI backend. Please try again later.",
          "rag-bot"
        );
      });
  }

  function appendMessage(text, className) {
    const div = document.createElement("div");
    div.className = `rag-msg ${className}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
})();
