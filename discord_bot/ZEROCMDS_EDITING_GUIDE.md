# 📝 Editing Zero Commands Panel

## Quick Start

The `!zerocmds` command now reads from an **external JSON file** that you can edit easily!

**File location:** `/home/don/proxy/discord_bot/zerocmds_config.json`

## How to Edit

### 1. Open the config file:
```bash
nano /home/don/proxy/discord_bot/zerocmds_config.json
```

### 2. Edit any field you want:

**Change the title:**
```json
"title": "🎭 Your Custom Title Here"
```

**Change the description:**
```json
"description": "Your custom description here.\nUse \\n for new lines."
```

**Change the color:**
```json
"color": "0xff0000"  // Red
"color": "0x00ff00"  // Green
"color": "0x0000ff"  // Blue
"color": "0x9b59b6"  // Purple (default)
```

**Add a new field:**
```json
{
  "name": "🆕 Your New Section",
  "value": "`<NEW_COMMAND>` - Description here\n`<ANOTHER>` - More info",
  "inline": false
}
```

**Edit existing commands:**
```json
{
  "name": "🔍 Tools",
  "value": "`<SEARCH>` - Google Search\n`<HIDE_THINKING>` - Hide thinking\n`<YOUR_NEW_TOOL>` - Your description",
  "inline": false
}
```

**Change the footer:**
```json
"footer": "20 Commands Available • Updated 2026"
```

### 3. Save and restart bot:
```bash
# Save in nano: Ctrl+O, Enter, Ctrl+X

# Restart bot
pkill -f "python3 bot.py"
cd /home/don/proxy/discord_bot && nohup python3 bot.py > bot.log 2>&1 &
```

### 4. Test in Discord:
```
!zerocmds
```

## JSON Structure

```json
{
  "title": "Embed title",
  "description": "Top description",
  "color": "0x9b59b6",
  "footer": "Footer text",
  "fields": [
    {
      "name": "Field Title",
      "value": "Field content with\nmultiple lines",
      "inline": false
    }
  ]
}
```

## Tips

### Formatting in Discord:
- `\n` - New line
- \`text\` - Inline code
- `**text**` - Bold
- `*text*` - Italic
- `__text__` - Underline

### Escaping Special Characters:
- Use `\"` for quotes inside strings
- Use `\\n` for actual backslash-n
- Use `\\` for backslash

### Field Character Limits:
- Field name: 256 characters max
- Field value: 1024 characters max
- Description: 4096 characters max
- Footer: 2048 characters max
- Total embed: 6000 characters max

## Common Color Codes

```
0xe74c3c  // Red
0xe67e22  // Orange
0xf1c40f  // Yellow
0x2ecc71  // Green
0x3498db  // Blue
0x9b59b6  // Purple (default)
0xe91e63  // Pink
0x95a5a6  // Gray
0x000000  // Black
0xffffff  // White
```

## Examples

### Add a new section:
```json
{
  "name": "🎯 Advanced Options",
  "value": "`<FAST_PACE>` - Quick story progression\n`<DETAILED_COMBAT>` - Extended fight scenes\n`<WORLDBUILDING>` - Rich environment details",
  "inline": false
}
```

### Modify existing section:
Change this:
```json
{
  "name": "🔍 Tools",
  "value": "`<SEARCH>` - Google Search (Gemini models only)\n`<HIDE_THINKING>` - Hide model's thinking process from output",
  "inline": false
}
```

To this:
```json
{
  "name": "🔍 Tools & Features",
  "value": "`<SEARCH>` - Real-time Google Search (Gemini only)\n`<HIDE_THINKING>` - Hide thinking tags\n`<MEMORY>` - Enable conversation memory\n`<CITATIONS>` - Add source citations",
  "inline": false
}
```

## Troubleshooting

### Bot shows "Error loading config"
- Check JSON syntax (use https://jsonlint.com/)
- Make sure all quotes are `"`
- Check all commas between fields
- Ensure file exists at correct path

### Changes don't appear
- Make sure you saved the file
- Restart the bot
- Check `bot.log` for errors:
  ```bash
  tail -20 /home/don/proxy/discord_bot/bot.log
  ```

### JSON validation:
```bash
# Check if JSON is valid
python3 -m json.tool zerocmds_config.json
```

## Quick Edits Without Restart

If you want to reload config without restarting bot, add a reload command:

```bash
# Add to bot.py admin commands:
@bot.command()
@commands.has_permissions(administrator=True)
async def reloadcmds(ctx):
    """Reload zerocmds config without restart"""
    await ctx.send("✅ Config will reload on next !zerocmds use")
```

---

**Happy editing! The panel is now fully customizable without touching Python code.**
