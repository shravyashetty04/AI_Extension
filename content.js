// ============================================================
//  KodNest AI Solver — content.js
//  Injects a floating "Solve with AI" button on every page.
//  On click: extracts question text → sends to backend → shows result.
// ============================================================

(function () {
  "use strict";

  const API_URL = "http://localhost:5000/solve";

  // ── 1. Avoid duplicate injection ────────────────────────────
  if (document.getElementById("kodnest-fab")) return;

  // ── 2. Create Floating Action Button ────────────────────────
  const fab = document.createElement("button");
  fab.id = "kodnest-fab";
  fab.title = "KodNest AI Solver";
  fab.innerHTML = `
    <span class="kn-icon">🤖</span>
    <span class="kn-label">Solve with AI</span>
  `;
  document.body.appendChild(fab);

  // ── 3. Create Modal Overlay ──────────────────────────────────
  const modal = document.createElement("div");
  modal.id = "kodnest-modal";
  modal.innerHTML = `
    <div id="kodnest-modal-box">
      <div id="kodnest-modal-header">
        <span>🤖 KodNest AI Solver</span>
        <button id="kodnest-close" title="Close">✕</button>
      </div>
      <div id="kodnest-modal-body">
        <div id="kodnest-question-section">
          <label>📄 Extracted Question</label>
          <textarea id="kodnest-question-text" rows="5" placeholder="Question will appear here…"></textarea>
        </div>
        <div id="kodnest-btn-row">
          <button id="kodnest-solve-btn">⚡ Solve Now</button>
          <button id="kodnest-clear-btn">🗑 Clear</button>
        </div>
        <div id="kodnest-answer-section" style="display:none;">
          <label>✅ AI Answer</label>
          <div id="kodnest-answer-text"></div>
          <div id="kodnest-answer-btn-row">
            <button id="kodnest-fill-btn">🚀 Auto Fill Code</button>
            <button id="kodnest-copy-btn">📋 Copy Answer</button>
          </div>
          <div id="kodnest-fill-msg" style="display:none;"></div>
        </div>
        <div id="kodnest-loader" style="display:none;">
          <div class="kn-spinner"></div>
          <span>Thinking…</span>
        </div>
        <div id="kodnest-error" style="display:none;"></div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // ── 4. DOM refs ──────────────────────────────────────────────
  const closeBtn      = document.getElementById("kodnest-close");
  const solveBtn      = document.getElementById("kodnest-solve-btn");
  const clearBtn      = document.getElementById("kodnest-clear-btn");
  const copyBtn       = document.getElementById("kodnest-copy-btn");
  const fillBtn       = document.getElementById("kodnest-fill-btn");
  const fillMsg       = document.getElementById("kodnest-fill-msg");
  const questionTA    = document.getElementById("kodnest-question-text");
  const answerDiv     = document.getElementById("kodnest-answer-text");
  const answerSection = document.getElementById("kodnest-answer-section");
  const loader        = document.getElementById("kodnest-loader");
  const errorDiv      = document.getElementById("kodnest-error");

  // ── 5. Question Extraction ───────────────────────────────────
  function extractQuestion() {
    // Strategy 1: highlighted / selected text
    const selection = window.getSelection().toString().trim();
    if (selection.length > 20) return selection;

    // Strategy 2: common coding-platform question selectors
    const selectors = [
      // LeetCode
      '[data-cy="question-title"]',
      '.question-content__JfgR',
      '[class*="question-content"]',
      // HackerRank
      '.challenge-body-html',
      '.problem-statement',
      // KodNest / generic
      '.problem-description',
      '.question-text',
      '.question-body',
      '.challenge-text',
      '.coding-question',
      // GeeksforGeeks
      '.problem-statement',
      // generic article / quiz
      'article',
      'main',
      '[role="main"]',
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        const text = el.innerText.trim();
        if (text.length > 30) return text.substring(0, 3000); // cap at 3 000 chars
      }
    }

    // Strategy 3: page title + first large paragraph
    const paras = Array.from(document.querySelectorAll("p"))
      .map((p) => p.innerText.trim())
      .filter((t) => t.length > 60);

    if (paras.length) {
      return `${document.title}\n\n${paras.slice(0, 5).join("\n\n")}`.substring(0, 3000);
    }

    return document.title || "";
  }

  // ── 6. Show / hide modal ─────────────────────────────────────
  function openModal() {
    resetUI();
    questionTA.value = extractQuestion();
    modal.classList.add("kn-visible");
    fab.classList.add("kn-active");
  }

  function closeModal() {
    modal.classList.remove("kn-visible");
    fab.classList.remove("kn-active");
  }

  // ── 7. Reset UI state ────────────────────────────────────────
  function resetUI() {
    answerSection.style.display = "none";
    loader.style.display        = "none";
    errorDiv.style.display      = "none";
    errorDiv.textContent        = "";
    answerDiv.textContent       = "";
    questionTA.value            = "";
  }

  // ── 8. Show error ────────────────────────────────────────────
  function showError(msg) {
    loader.style.display   = "none";
    errorDiv.style.display = "block";
    errorDiv.textContent   = "⚠️ " + msg;
  }

  // ── 9. Call backend ──────────────────────────────────────────
  async function solveQuestion() {
    const question = questionTA.value.trim();
    if (!question) {
      showError("No question text found. Please select text on the page and try again.");
      return;
    }

    answerSection.style.display = "none";
    errorDiv.style.display      = "none";
    loader.style.display        = "flex";
    solveBtn.disabled           = true;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();
      const answer = data.answer || data.result || data.solution || JSON.stringify(data);

      loader.style.display        = "none";
      answerDiv.textContent       = answer;
      answerSection.style.display = "block";
    } catch (err) {
      showError(
        err.message.includes("Failed to fetch")
          ? "Cannot reach the backend. Make sure the server is running at http://localhost:5000"
          : err.message
      );
    } finally {
      solveBtn.disabled = false;
    }
  }

  // ── 10. Copy answer to clipboard ─────────────────────────────
  async function copyAnswer() {
    try {
      await navigator.clipboard.writeText(answerDiv.textContent);
      copyBtn.textContent = "✅ Copied!";
      setTimeout(() => (copyBtn.textContent = "📋 Copy Answer"), 2000);
    } catch {
      copyBtn.textContent = "❌ Failed";
      setTimeout(() => (copyBtn.textContent = "📋 Copy Answer"), 2000);
    }
  }

  // ── 10b. Extract code blocks from AI answer ──────────────────
  function extractCode(text) {
    // Try to extract code between ``` markers
    const codeBlockRegex = /```(?:\w*\n)?([\s\S]*?)```/g;
    const matches = [];
    let match;
    while ((match = codeBlockRegex.exec(text)) !== null) {
      matches.push(match[1].trim());
    }
    if (matches.length > 0) return matches.join("\n\n");
    // If no code blocks, return the full text
    return text;
  }

  // ── 10c. Auto-fill code into the page editor ─────────────────
  // Sends code to inject.js (runs in MAIN world, can access monaco)
  function autoFillEditor() {
    const code = extractCode(answerDiv.textContent);
    if (!code) {
      showFillMsg("❌ No code found in the answer", false);
      return;
    }

    // Listen for result from inject.js
    const handler = (e) => {
      document.removeEventListener("kodnest-fill-result", handler);
      const result = e.detail;
      if (result.success) {
        showFillMsg("✅ Code filled into editor!", true);
        setTimeout(closeModal, 1500);
      } else {
        navigator.clipboard.writeText(code).then(() => {
          showFillMsg("📋 Copied to clipboard. " + result.info, false);
        });
      }
    };
    document.addEventListener("kodnest-fill-result", handler);

    // Send fill request to inject.js (which runs in page context)
    document.dispatchEvent(new CustomEvent("kodnest-fill-request", {
      detail: { code: code }
    }));

    // Timeout fallback if inject.js doesn't respond in 3s
    setTimeout(() => {
      document.removeEventListener("kodnest-fill-result", handler);
    }, 3000);
  }

  function showFillMsg(msg, success) {
    fillMsg.textContent = msg;
    fillMsg.style.display = "block";
    fillMsg.style.color = success ? "#3ECFCF" : "#ff9999";
    setTimeout(() => (fillMsg.style.display = "none"), 3000);
  }

  // ── 11. Event listeners ──────────────────────────────────────
  fab.addEventListener("click", () => {
    if (modal.classList.contains("kn-visible")) {
      closeModal();
    } else {
      openModal();
    }
  });

  closeBtn.addEventListener("click", closeModal);
  solveBtn.addEventListener("click", solveQuestion);
  clearBtn.addEventListener("click", resetUI);
  copyBtn.addEventListener("click", copyAnswer);
  fillBtn.addEventListener("click", autoFillEditor);

  // Close modal on backdrop click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Keyboard shortcut: Alt + K
  document.addEventListener("keydown", (e) => {
    if (e.altKey && e.key === "k") {
      openModal();
    }
  });
})();
