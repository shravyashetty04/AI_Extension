// ============================================================
//  inject.js — Runs in the PAGE's main world (not isolated)
//  Can access window.monaco directly
//  Communicates with content.js via CustomEvents
// ============================================================

(function () {
  "use strict";

  // Listen for fill request from content.js
  document.addEventListener("kodnest-fill-request", function (e) {
    const code = e.detail.code;
    let success = false;
    let info = "";

    // ── Monaco Editor (KodNest uses this) ──
    if (typeof monaco !== "undefined") {
      info += "Found monaco. ";

      // Try getEditors first
      var editors = [];
      try { editors = monaco.editor.getEditors(); } catch(ex) {}

      if (editors.length > 0) {
        var editor = editors[0];
        var model = editor.getModel();
        if (model) {
          // Use executeEdits — looks like a normal user edit
          var fullRange = model.getFullModelRange();
          editor.executeEdits("kodnest-ai", [{
            range: fullRange,
            text: code,
            forceMoveMarkers: true
          }]);
          // Move cursor to end
          var lastLine = model.getLineCount();
          var lastCol = model.getLineMaxColumn(lastLine);
          editor.setPosition({ lineNumber: lastLine, column: lastCol });
          editor.focus();
          success = true;
          info += "Filled via executeEdits. ";
        }
      }

      // Fallback: try getModels
      if (!success) {
        var models = [];
        try { models = monaco.editor.getModels(); } catch(ex) {}
        if (models.length > 0) {
          models[0].setValue(code);
          success = true;
          info += "Filled via model.setValue. ";
        }
      }
    } else {
      info += "monaco not found. ";
    }

    // ── CodeMirror 5 fallback ──
    if (!success) {
      var cmEl = document.querySelector(".CodeMirror");
      if (cmEl && cmEl.CodeMirror) {
        info += "Found CodeMirror. ";
        cmEl.CodeMirror.setValue(code);
        success = true;
      }
    }

    // ── Ace fallback ──
    if (!success) {
      var aceEl = document.querySelector(".ace_editor");
      if (aceEl && aceEl.env && aceEl.env.editor) {
        info += "Found Ace. ";
        aceEl.env.editor.setValue(code, -1);
        success = true;
      }
    }

    // Send result back to content.js
    document.dispatchEvent(new CustomEvent("kodnest-fill-result", {
      detail: { success: success, info: info }
    }));
  });
})();
