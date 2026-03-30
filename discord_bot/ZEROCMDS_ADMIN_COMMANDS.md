# 🎮 Zero Commands Admin Commands

## Quick Start

Manage the `!zerocmds` panel directly from Discord - no file editing needed!

## Commands

### 📝 Add a New Command
```
!addzerocmd "Section Name" <COMMAND_CODE> Description here
```

**Examples:**
```
!addzerocmd "Tools" <MEMORY> Enable conversation memory
!addzerocmd "Writing Style" <FAST_PACE> Quick story progression
!addzerocmd "Tools" <HIDE_THINKING> Hide model's thinking process
```

**Notes:**
- Section name must match existing section (partial match OK)
- Command code should be in CAPS with underscores
- Description is everything after the command code

---

### ✏️ Edit Existing Command
```
!editzerocmd <COMMAND_CODE> New description here
```

**Examples:**
```
!editzerocmd <HIDE_THINKING> Hide thinking tags from output
!editzerocmd <SEARCH> Real-time Google Search (Gemini only)
```

---

### ❌ Remove a Command
```
!removezerocmd <COMMAND_CODE>
```

**Examples:**
```
!removezerocmd <OLD_COMMAND>
!removezerocmd <DEPRECATED>
```

---

### ➕ Add New Section
```
!addsection emoji Title Here
```

**Examples:**
```
!addsection 🎯 Advanced Features
!addsection 🎨 Visual Options
!addsection ⚙️ Technical Settings
```

---

### 🗑️ Remove Section
```
!removesection Section Name
```

**Examples:**
```
!removesection Tools
!removesection Advanced Features
```

---

### 📋 List All Commands
```
!listzerocmds
```

Shows all sections and commands currently in the panel.

---

## Workflow Examples

### Example 1: Add New Tool
```
!addzerocmd "Tools" <CITATIONS> Add source citations to responses
!zerocmds
```

Result:
```
🔍 Tools
`<SEARCH>` - Google Search (Gemini models only)
`<HIDE_THINKING>` - Hide model's thinking process
`<CITATIONS>` - Add source citations to responses
```

### Example 2: Add New Category
```
!addsection 🎨 Visual Style
!addzerocmd "Visual Style" <CINEMATIC> Movie-like scene descriptions
!addzerocmd "Visual Style" <ANIME> Anime-style visuals
!zerocmds
```

### Example 3: Update Description
```
!editzerocmd <SEARCH> Real-time web search for current information (Gemini models only)
!zerocmds
```

### Example 4: Clean Up Old Commands
```
!removezerocmd <OLD_CMD>
!removezerocmd <DEPRECATED>
!listzerocmds
```

---

## Tips

### Command Code Naming
✅ Good: `<HIDE_THINKING>`, `<FAST_PACE>`, `<CHARACTER_DEPTH>`
❌ Bad: `<hide thinking>`, `<fastpace>`, `<char depth>`

### Descriptions
✅ Good: Clear, concise, explains what it does
```
<HIDE_THINKING> - Hide model's thinking process from output
```

❌ Bad: Vague or too wordy
```
<HIDE_THINKING> - This command will hide the thinking
```

### Section Names (for addzerocmd)
- Don't need exact match: `"Tools"`, `"tools"`, `"Tool"` all work
- Use quotes if space in name: `"Writing Style"`
- Case insensitive

---

## Common Use Cases

### Adding Seasonal Commands
```
!addsection 🎄 Holiday Themes
!addzerocmd "Holiday" <CHRISTMAS> Festive winter atmosphere
!addzerocmd "Holiday" <HALLOWEEN> Spooky October vibes
!addzerocmd "Holiday" <VALENTINE> Romantic Valentine's Day theme
```

### Model-Specific Commands
```
!addzerocmd "Tools" <VISION> Enable image analysis (Claude/Gemini)
!addzerocmd "Tools" <ARTIFACTS> Enable Artifacts mode (Claude)
```

### Community Requested Features
```
!addzerocmd "Writing Style" <POETIC> Lyrical, metaphorical prose
!addzerocmd "Character Focus" <VILLAIN_POV> Antagonist perspective
```

---

## Permissions

**Required:** Administrator permission
**Commands:**
- `!addzerocmd` - Admin only
- `!removezerocmd` - Admin only
- `!editzerocmd` - Admin only
- `!addsection` - Admin only
- `!removesection` - Admin only
- `!listzerocmds` - Admin only

**Public command:**
- `!zerocmds` - Manage Server permission (can be used by mods)

---

## Troubleshooting

### "Section not found"
Use `!listzerocmds` to see exact section names, or use partial matches:
```
✅ !addzerocmd "Tool" <CMD> Description    (matches "Tools")
✅ !addzerocmd "tools" <CMD> Description   (case insensitive)
❌ !addzerocmd "Toolz" <CMD> Description   (typo won't match)
```

### "Command not found" (when removing/editing)
Make sure the command code matches exactly:
```
✅ !removezerocmd <HIDE_THINKING>
❌ !removezerocmd <hide_thinking>  (wrong case)
❌ !removezerocmd <HIDETHINKING>   (missing underscore)
```

### Changes don't appear
Run `!zerocmds` again to regenerate the panel with new data.

---

## Auto-Formatting

Commands are automatically formatted as:
- Inline code with backticks
- Proper spacing
- Organized by section

You just provide: `<CODE> Description`
Bot formats it as: `` `<CODE>` - Description ``

---

**Quick Command Summary:**
```
!addzerocmd "Section" <CODE> Description
!editzerocmd <CODE> New description
!removezerocmd <CODE>
!addsection emoji Title
!removesection Title
!listzerocmds
!zerocmds
```
