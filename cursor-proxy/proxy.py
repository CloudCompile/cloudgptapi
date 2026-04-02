#!/usr/bin/env python3
"""
Cursor Proxy Server - Routes Anthropic API calls to AquaDevs
Usage: python proxy.py
Then set ANTHROPIC_API_KEY in Cursor to: sk-proxy-local
"""

from flask import Flask, request, jsonify
import requests
import os

app = Flask(__name__)

# AquaDevs premium key (for Claude Code)
AQUA_KEY = "aqua_sk_9768434fd1b8415a904086529bd8acac"
AQUA_URL = "https://api.aquadevs.com/v1/chat/completions"

# Local proxy key (what you enter in Cursor)
PROXY_KEY = "sk-proxy-local"

# Model mapping - translate Anthropic model names to AquaDevs
MODEL_MAP = {
    "claude-sonnet-4.5": "sonnet-4.5",
    "claude-sonnet-4-5": "sonnet-4.5",
    "claude-sonnet-4.6": "sonnet-4.6",
    "claude-sonnet-4-6": "sonnet-4.6",
    "claude-opus-4.5": "opus-4.5",
    "claude-opus-4-5": "opus-4.5",
    "claude-opus-4.6": "opus-4.6",
    "claude-opus-4-6": "opus-4.6",
    "claude-3-5-sonnet-20241022": "sonnet-4.5",
    "claude-3-7-sonnet-20250219": "sonnet-4.6",
    "claude-3-opus-20240229": "opus-4.5",
    "claude-3-sonnet-20240229": "sonnet-4.5",
    "claude-3-haiku-20240307": "haiku-4.5",
}

@app.route("/v1/chat/completions", methods=["POST"])
def chat():
    data = request.json
    
    # Map model name
    original_model = data.get("model", "")
    mapped_model = MODEL_MAP.get(original_model, original_model)
    data["model"] = mapped_model
    
    headers = {
        "Authorization": f"Bearer {AQUA_KEY}",
        "Content-Type": "application/json"
    }
    
    resp = requests.post(AQUA_URL, json=data, headers=headers, timeout=120)
    return jsonify(resp.json()), resp.status_code


@app.route("/v1/models", methods=["GET"])
def models():
    return jsonify({
        "object": "list",
        "data": [
            {"id": "claude-sonnet-4.5", "name": "Claude Sonnet 4.5"},
            {"id": "claude-sonnet-4.6", "name": "Claude Sonnet 4.6"},
            {"id": "claude-opus-4.5", "name": "Claude Opus 4.5"},
            {"id": "claude-opus-4.6", "name": "Claude Opus 4.6"},
        ]
    })


@app.route("/v1/auth", methods=["POST"])
def auth():
    # Accept any key for local testing
    return jsonify({"access_token": PROXY_KEY, "type": "bearer"})


if __name__ == "__main__":
    print("🚀 Cursor Proxy Server running on http://localhost:8080")
    print("📝 In Cursor, set Anthropic API key to: sk-proxy-local")
    app.run(port: 8080, debug=False)
