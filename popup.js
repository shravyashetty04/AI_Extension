// popup.js — logic for the extension popup

const DEFAULT_API_URL = "http://localhost:5000/solve";

// ── Load saved API URL ──────────────────────────────────────
chrome.storage.local.get(["apiUrl"], (result) => {
  document.getElementById("popup-api-url").value =
    result.apiUrl || DEFAULT_API_URL;
});

// ── Save API URL ────────────────────────────────────────────
document.getElementById("popup-save-btn").addEventListener("click", () => {
  const url = document.getElementById("popup-api-url").value.trim();
  const msg = document.getElementById("popup-save-msg");
  if (!url) return;
  chrome.storage.local.set({ apiUrl: url }, () => {
    msg.textContent = "✓ Saved!";
    setTimeout(() => (msg.textContent = ""), 2000);
  });
});

// ── Activate Solver on Current Tab ──────────────────────────
document.getElementById("popup-activate-btn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  // Programmatically click the FAB already injected by content.js
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const fab = document.getElementById("kodnest-fab");
      if (fab) fab.click();
    },
  });
  window.close(); // close popup
});
