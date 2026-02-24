import anthropic
from flask import Flask, jsonify, render_template, request
from config import Config

app = Flask(__name__)
app.config.from_object(Config)


@app.after_request
def add_no_cache_headers(response):
    """Prevent browser caching of all responses during development."""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/render", methods=["POST"])
def render_banner():
    data = request.get_json()
    html = render_template(
        "banner_email.html",
        event_name=data.get("event_name", ""),
        location=data.get("location", ""),
        dates=data.get("dates", ""),
        cta_text=data.get("cta_text", ""),
        image_url=data.get("image_url", ""),
        logo_url=data.get("logo_url", ""),
        color_text=data.get("color_text", "#FFFFFF"),
        color_icon=data.get("color_icon", "#FFFFFF"),
        color_cta_bg=data.get("color_cta_bg", "#FCBA30"),
        color_cta_text=data.get("color_cta_text", "#00274C"),
    )
    return jsonify({"html": html})


@app.route("/api/suggest-image", methods=["POST"])
def suggest_image():
    data = request.get_json()
    location = data.get("location", "").strip()
    if not location:
        return jsonify({"suggestions": []})

    api_key = Config.ANTHROPIC_API_KEY
    if not api_key:
        return jsonify({"error": "ANTHROPIC_API_KEY not configured"}), 500

    client = anthropic.Anthropic(api_key=api_key)
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=300,
        messages=[
            {
                "role": "user",
                "content": (
                    f"I need to find a stock photo for an email banner about a conference/trade show "
                    f"at this location: {location}. "
                    f"Give me 5 specific search terms I can use on stock photo sites like Unsplash, "
                    f"Pexels, or Shutterstock to find a great background image. "
                    f"Focus on the city skyline, landmarks, or venue. "
                    f"Return ONLY a JSON array of strings, nothing else. "
                    f'Example: ["Toronto skyline sunset", "CN Tower cityscape"]'
                ),
            }
        ],
    )

    import json

    try:
        suggestions = json.loads(message.content[0].text)
    except (json.JSONDecodeError, IndexError):
        suggestions = [f"{location} skyline", f"{location} cityscape", f"{location} landmark"]

    return jsonify({"suggestions": suggestions})


if __name__ == "__main__":
    app.run(debug=True, port=5001)
