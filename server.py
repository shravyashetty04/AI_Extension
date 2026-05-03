# ============================================================
#  KodNest AI Solver — Backend (Flask + Google Gemini)
#  Auto-retries on rate limit errors
#
#  Install:  pip install flask flask-cors google-genai
#  Run:      python server.py
# ============================================================

from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
import time

app = Flask(__name__)
CORS(app)

# ── Gemini setup ────────────────────────────────────────────
client = genai.Client(api_key="AIzaSyCWPadWLEOG1TjGaROTivuNpW9Lp_0SZew")
MODEL = "gemini-2.5-flash"
MAX_RETRIES = 3


def ask_gemini(question):
    """Call Gemini with automatic retry on rate limit (429)."""
    prompt = (
        "You are an expert Java developer. "
        "Solve the following question using ONLY Java language. "
        "Provide complete, compilable Java code. "
        "Do NOT use any other programming language. "
        "Write clean Java code with proper class structure, main method if needed, and comments.\n\n"
        f"Question:\n{question}"
    )

    for attempt in range(MAX_RETRIES):
        try:
            response = client.models.generate_content(model=MODEL, contents=prompt)
            return response.text
        except Exception as e:
            err = str(e)
            if "429" in err or "RESOURCE_EXHAUSTED" in err:
                wait = 30 * (attempt + 1)  # 30s, 60s, 90s
                print(f"[!] Rate limited. Waiting {wait}s before retry {attempt+1}/{MAX_RETRIES}...")
                time.sleep(wait)
            else:
                return f"Error from AI: {err}"

    return "Rate limit exceeded. Please wait 1 minute and try again."


@app.route("/solve", methods=["POST"])
def solve():
    data = request.get_json(force=True)
    question = data.get("question", "").strip()

    if not question:
        return jsonify({"error": "No question provided"}), 400

    answer = ask_gemini(question)
    return jsonify({"answer": answer})


if __name__ == "__main__":
    print("[*] KodNest AI Solver backend running at http://localhost:5000")
    print(f"[*] Using model: {MODEL}")
    print("[*] Auto-retry on rate limits: ON")
    app.run(host="0.0.0.0", port=5000, debug=True)
