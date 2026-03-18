/**
 * Conversational AI Assistant — RAG Chatbot Widget
 * Powered by Groq (Llama 3.3 70B) + Upstash Vector
 */
(function () {
  const API_URL = "https://rag-project-zeta.vercel.app";

  const toggle = document.getElementById("rag-chat-toggle");
  const chatBox = document.getElementById("rag-chat-box");
  const closeBtn = document.getElementById("rag-chat-close");
  const input = document.getElementById("rag-input");
  const sendBtn = document.getElementById("rag-send");
  const messages = document.getElementById("rag-messages");

  let isOpen = false;
  let isProcessing = false;

  // ── Toggle chat ──
  toggle.addEventListener("click", () => {
    isOpen = !isOpen;
    chatBox.classList.toggle("rag-hidden", !isOpen);
    toggle.classList.toggle("rag-active", isOpen);
    if (isOpen) {
      input.focus();
      // Hide pulse after first open
      const pulse = toggle.querySelector(".rag-toggle-pulse");
      if (pulse) pulse.style.display = "none";
    }
  });

  closeBtn.addEventListener("click", () => {
    isOpen = false;
    chatBox.classList.add("rag-hidden");
    toggle.classList.remove("rag-active");
  });

  // ── Suggestion buttons ──
  document.querySelectorAll(".rag-suggestion").forEach((btn) => {
    btn.addEventListener("click", () => {
      const question = btn.getAttribute("data-q");
      if (question && !isProcessing) {
        input.value = question;
        sendMessage();
      }
    });
  });

  // ── Send message ──
  function sendMessage() {
    const text = input.value.trim();
    if (!text || isProcessing) return;

    isProcessing = true;
    input.value = "";
    sendBtn.disabled = true;

    // Hide suggestions after first message
    const suggestions = document.getElementById("rag-suggestions");
    if (suggestions) suggestions.style.display = "none";

    // User message
    appendUserMessage(text);

    // Typing indicator
    const typingEl = appendTypingIndicator();

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
        typingEl.remove();
        appendBotMessage(data.answer, data.sources || []);
      })
      .catch(() => {
        typingEl.remove();
        appendBotMessage(
          "Sorry, I couldn't connect to the AI backend right now. Please try again in a moment.",
          []
        );
      })
      .finally(() => {
        isProcessing = false;
        sendBtn.disabled = false;
        input.focus();
      });
  }

  // ── User message bubble ──
  function appendUserMessage(text) {
    const div = document.createElement("div");
    div.className = "rag-msg rag-user";
    div.innerHTML = `<div class="rag-bubble">${escapeHtml(text)}</div>`;
    messages.appendChild(div);
    scrollToBottom();
  }

  // ── Bot message bubble with sources ──
  function appendBotMessage(text, sources) {
    const div = document.createElement("div");
    div.className = "rag-msg rag-bot";

    let html = `<div class="rag-bot-avatar"><i class="fas fa-robot"></i></div>`;
    html += `<div class="rag-bubble">`;

    // Simple markdown: **bold**, `code`, newlines
    let formatted = escapeHtml(text)
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/`(.*?)`/g, '<code class="rag-inline-code">$1</code>')
      .replace(/\n/g, "<br>");
    html += formatted;

    // Source citations
    if (sources.length > 0) {
      html += `<div class="rag-sources">`;
      html += `<span class="rag-sources-label"><i class="fas fa-link"></i> Sources</span>`;
      sources.forEach((s) => {
        const title = s.title || s.url || "Source";
        const url = s.url || "#";
        const score = s.score ? Math.round(s.score * 100) : null;
        html += `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="rag-source-chip">`;
        html += `${escapeHtml(title)}`;
        if (score) html += `<span class="rag-score">${score}%</span>`;
        html += `</a>`;
      });
      html += `</div>`;
    }

    html += `</div>`;
    div.innerHTML = html;
    messages.appendChild(div);

    // Typewriter animation for the bubble text
    const bubble = div.querySelector(".rag-bubble");
    bubble.style.opacity = "0";
    bubble.style.transform = "translateY(8px)";
    requestAnimationFrame(() => {
      bubble.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      bubble.style.opacity = "1";
      bubble.style.transform = "translateY(0)";
    });

    scrollToBottom();
  }

  // ── Typing indicator ──
  function appendTypingIndicator() {
    const div = document.createElement("div");
    div.className = "rag-msg rag-bot rag-typing-msg";
    div.innerHTML = `
      <div class="rag-bot-avatar"><i class="fas fa-robot"></i></div>
      <div class="rag-bubble rag-typing-bubble">
        <div class="rag-typing-dots">
          <span></span><span></span><span></span>
        </div>
      </div>`;
    messages.appendChild(div);
    scrollToBottom();
    return div;
  }

  // ── Helpers ──
  function escapeHtml(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      messages.scrollTop = messages.scrollHeight;
    });
  }

  // ── Event listeners ──
  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // ── Close on Escape ──
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) {
      isOpen = false;
      chatBox.classList.add("rag-hidden");
      toggle.classList.remove("rag-active");
    }
  });
})();

// ── Open chatbot from project card Demo button ──
function openRagChatDemo(event) {
  event.preventDefault();
  const chatBox = document.getElementById("rag-chat-box");
  const toggle = document.getElementById("rag-chat-toggle");
  chatBox.classList.remove("rag-hidden");
  toggle.classList.add("rag-active");
  const pulse = toggle.querySelector(".rag-toggle-pulse");
  if (pulse) pulse.style.display = "none";
  document.getElementById("rag-input").focus();
  // Smooth scroll to bottom so widget is visible
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}
