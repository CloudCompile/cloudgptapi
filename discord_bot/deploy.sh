#!/bin/bash
# Discord Bot Deploy Script
# Called by GitHub Actions to update and restart the bot

set -e

BOT_DIR="/home/don/proxy/discord_bot"
SERVICE_NAME="zerox-bot"

echo "📥 Pulling latest changes..."
cd /home/don/proxy
git pull origin main

echo "📦 Checking for new dependencies..."
cd "$BOT_DIR"
source venv/bin/activate
pip install -q -r requirements.txt 2>/dev/null || true

echo "🔄 Restarting bot service..."
systemctl --user restart "$SERVICE_NAME"

echo "⏳ Waiting for bot to start..."
sleep 3

if systemctl --user is-active --quiet "$SERVICE_NAME"; then
    echo "✅ Bot deployed and running!"
else
    echo "❌ Bot failed to start. Check logs:"
    echo "   journalctl --user -u $SERVICE_NAME -n 20"
    exit 1
fi
