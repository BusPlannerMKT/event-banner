import requests as http_requests

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
        subheading=data.get("subheading", ""),
        location=data.get("location", ""),
        dates=data.get("dates", ""),
        cta_text=data.get("cta_text", ""),
        image_url=data.get("image_url", ""),
        logo_url=data.get("logo_url", ""),
        color_text=data.get("color_text", "#FFFFFF"),
        color_icon=data.get("color_icon", "#FFFFFF"),
        color_cta_bg=data.get("color_cta_bg", "#FCBA30"),
        color_cta_text=data.get("color_cta_text", "#00274C"),
        fs_title=data.get("fs_title", "28"),
        fs_subheading=data.get("fs_subheading", "15"),
        fs_details=data.get("fs_details", "16"),
        fs_cta=data.get("fs_cta", "15"),
    )
    return jsonify({"html": html})


@app.route("/api/search-images", methods=["POST"])
def search_images():
    data = request.get_json()
    query = data.get("query", "").strip()
    if not query:
        return jsonify({"error": "Enter a search term"}), 400

    pexels_key = Config.PEXELS_API_KEY
    if not pexels_key:
        return jsonify({"error": "PEXELS_API_KEY not configured. Get a free key at pexels.com/api"}), 500

    try:
        resp = http_requests.get(
            "https://api.pexels.com/v1/search",
            headers={"Authorization": pexels_key},
            params={
                "query": query,
                "per_page": 12,
                "orientation": "landscape",
            },
            timeout=10,
        )
        resp.raise_for_status()
        results = resp.json()

        images = []
        for photo in results.get("photos", []):
            images.append({
                "id": photo["id"],
                "thumb": photo["src"]["medium"],
                "full": photo["src"]["landscape"],
                "photographer": photo["photographer"],
                "alt": photo.get("alt", ""),
            })

        return jsonify({"images": images})
    except Exception as e:
        print(f"Pexels API error: {e}")
        return jsonify({"error": "Failed to search images. Check your PEXELS_API_KEY."}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5001)
