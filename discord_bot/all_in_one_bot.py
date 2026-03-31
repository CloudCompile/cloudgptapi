

# ══════════════════════════════════════════════════════════════════════════════
#
# ██╗ ██╗ █████╗ ██╗██╗ 6
# ██║ ██║██╔══██╗██║██║
# ██║ █╗ ██║███████║██║██║
# ██║███╗██║██╔══██║██║██║
# ╚███╔███╔╝██║ ██║██║███████╗
# ╚══╝╚══╝ ╚═╝ ╚═╝╚═╝╚══════╝
#
# ══════════════════════════════════════════════════════════════════════════════
# VIBECODER — AI-Powered Issue Handler & Codebase Q&A
# Hears issues, thinks through fixes, asks for approval, pushes to GitHub
# Also answers questions by searching the codebase
# ══════════════════════════════════════════════════════════════════════════════

# Configuration - reads from environment variables
import os
import uuid

VIBE_REPO_PATH = os.getenv("VIBE_REPO_PATH", os.path.expanduser("~/Documents/GitHub/cloudgptapi"))
VIBE_MODEL = os.getenv("AI_MODEL", "minimax")
VIBE_POLL_KEY = os.getenv("AI_API_KEY", "")  # Will use shared poll key

# Store pending approvals: {issue_id: {description, proposed_fix, files_changed, timestamp, user}}
vibe_pending_approvals: Dict = {}

# ── VibeCoder Helper Functions ─────────────────────────────────────────────────

async def vibe_search_codebase(query: str, file_types: List[str] = None) -> str:
    """Search the codebase for relevant files and content"""
    if file_types is None:
        file_types = ['.ts', '.tsx', '.js', '.jsx', '.py', '.json', '.md', '.sh']
    
    results = []
    search_path = VIBE_REPO_PATH
    
    if not os.path.exists(search_path):
        return f"Repository not found at {search_path}"
    
    for root, dirs, files in os.walk(search_path):
        # Skip unwanted directories
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', '__pycache__', '.next', 'dist', 'build']]
        
        for file in files:
            ext = os.path.splitext(file)[1]
            if ext in file_types:
                filepath = os.path.join(root, file)
                rel_path = os.path.relpath(filepath, search_path)
                
                try:
                    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        if query.lower() in content.lower():
                            # Find the line with the match
                            lines = content.split('\n')
                            for i, line in enumerate(lines):
                                if query.lower() in line.lower():
                                    results.append({
                                        'file': rel_path,
                                        'line': i + 1,
                                        'content': line.strip()[:150]
                                    })
                except:
                    pass
    
    if not results:
        return f"No matches found for '{query}' in the codebase."
    
    # Return top 15 results
    output = f"Found {len(results)} matches for '{query}':\n\n"
    for r in results[:15]:
        output += f"📁 `{r['file']}:{r['line']}`\n   {r['content'][:100]}\n\n"
    
    return output

async def vibe_call_pollinations(system_prompt: str, user_prompt: str, context: str = "") -> str:
    """Call Pollinations API with proper vibe coding prompts"""
    
    full_context = f"{context}\n\nUSER REQUEST:\n{user_prompt}" if context else user_prompt
    
    try:
        # Use the existing poll_text function from shared imports
        response = await poll_text(
            VIBE_MODEL,
            [{"role": "system", "content": system_prompt},
             {"role": "user", "content": full_context}],
            VIBE_POLL_KEY if VIBE_POLL_KEY else WAIFU_POLL_KEY,
            max_tokens=4000,
            temperature=0.7
        )
        return response if response else "No response from API"
    except Exception as e:
        return f"Error calling API: {e}"

async def vibe_git_commit_push(issue_id: str, message: str) -> bool:
    """Commit changes and push to GitHub"""
    try:
        os.chdir(VIBE_REPO_PATH)
        # Add all changes
        result = subprocess.run(['git', 'add', '-A'], capture_output=True, text=True)
        if result.returncode != 0:
            log.warning(f"Git add failed: {result.stderr}")
        
        # Commit with descriptive message
        result = subprocess.run(['git', 'commit', '-m', f'{message} [Issue #{issue_id}]'], 
                              capture_output=True, text=True)
        if result.returncode != 0:
            log.warning(f"Git commit failed: {result.stderr}")
            return False
        
        # Push
        result = subprocess.run(['git', 'push', 'origin', 'main'], capture_output=True, text=True)
        if result.returncode != 0:
            log.warning(f"Git push failed: {result.stderr}")
            return False
        
        return True
    except Exception as e:
        log.warning(f"Git error: {e}")
        return False

def vibe_generate_id() -> str:
    """Generate a unique issue ID"""
    return str(uuid.uuid4())[:8]

# ── VibeCoder System Prompts ──────────────────────────────────────────────────

VIBE_SYSTEM_ANALYZE = """You are VibeCoder - an elite AI developer with "vibe coding" philosophy.

Your approach:
1. ANALYZE the entire relevant codebase, not just the reported symptom
2. THINK through the root cause, not just patch symptoms
3. UNDERSTAND the full context before making changes
4. TEST your assumptions by looking at related code
5. PROPOSE comprehensive fixes, not one-liners

When analyzing issues:
- Read the full file, not just the error line
- Look for patterns that caused this issue
- Consider side effects of your changes
- Provide a DETAILED explanation of what you changed and WHY

When proposing fixes:
- Show the exact code changes (before/after)
- Explain the root cause
- Note any potential side effects
- Suggest how to test the fix

Remember: You're not just fixing bugs, you're understanding the system deeply."""

VIBE_SYSTEM_ANSWER = """You are VibeCoder - an expert on this codebase. 

Your job is to:
1. Search through the code to find relevant information
2. Explain HOW the code works, not just what it does
3. Give practical, actionable answers
4. If something is unclear, say so

Be thorough but concise. Use code snippets where helpful."""

# ── VibeCoder Bot ──────────────────────────────────────────────────────────────

VIBE_TOKEN = os.getenv("VIBE_DISCORD_TOKEN", os.getenv("DISCORD_TOKEN", ""))
VIBE_GUILD_ID = os.getenv("VIBE_GUILD_ID", "")  # Set your server ID here

class VibeCoderBot(commands.Bot):
    def __init__(self):
        intents = discord.Intents.default()
        intents.message_content = True
        super().__init__(command_prefix="vibe!", intents=intents)
    
    async def setup_hook(self):
        if VIBE_GUILD_ID:
            g = discord.Object(id=int(VIBE_GUILD_ID))
            self.tree.copy_global_to(guild=g)
            try:
                await self.tree.sync(guild=g)
                print("✅ VibeCoder commands synced")
            except Exception as e:
                log.warning(f"VibeCoder sync: {e}")
    
    async def on_ready(self):
        print(f"🤖 VibeCoder online as {self.user}")
        await self.change_presence(activity=discord.Activity(
            type=discord.ActivityType.watching, name="/vibehelp"))
    
    async def on_message(self, message: discord.Message):
        if message.author.bot:
            return
        
        # Check if bot is mentioned
        if self.user in message.mentions:
            question = message.content.replace(f'@{self.user.name}', '').strip()
            if question:
                async with message.channel.typing():
                    search_results = await vibe_search_codebase(question)
                    answer = await vibe_call_pollinations(VIBE_SYSTEM_ANSWER, 
                        f"User asked: \"{question}\"\n\nRelated code found in codebase:\n{search_results}",
                        search_results)
                    await message.reply(answer[:4000] or "I couldn't find a good answer for that.")
        
        await self.process_commands(message)

vibe_bot = VibeCoderBot()

@vibe_bot.tree.command(name="report", description="Report an issue for VibeCoder to fix")
async def vibe_report(i: discord.Interaction, issue: str):
    """Report an issue - VibeCoder will analyze and propose a fix"""
    await i.response.defer()
    
    issue_id = vibe_generate_id()
    
    # Search the codebase for related context
    search_results = await vibe_search_codebase(issue)
    
    # Call the API with vibe coding prompt
    analysis = await vibe_call_pollinations(VIBE_SYSTEM_ANALYZE,
        f"""The user reported this issue: "{issue}"

We've searched the codebase and found these related files:
{search_results}

Please analyze this issue thoroughly and propose a fix. Include:
1. Root cause analysis
2. Exact files and lines to change
3. The proposed code changes
4. Why this fixes the issue""",
        search_results)
    
    # Store the proposal for approval
    vibe_pending_approvals[issue_id] = {
        'description': issue,
        'proposed_fix': analysis,
        'timestamp': datetime.datetime.now(),
        'user': i.user.name
    }
    
    # Confirm to user
    embed = discord.Embed(
        title=f"📋 Issue #{issue_id} Received",
        description=issue,
        color=discord.Color.blue()
    )
    embed.add_field(name="Status", value="🔄 Analyzing codebase and proposing fix...")
    embed.add_field(name="Next Step", value="Use `/approve " + issue_id + "` to push changes", inline=False)
    
    await i.followup.send(embed=embed)

@vibe_bot.tree.command(name="ask", description="Ask VibeCoder a question about the codebase")
async def vibe_ask(i: discord.Interaction, question: str):
    """Ask VibeCoder about the codebase - it will search and answer"""
    await i.response.defer()
    
    # Search for relevant code
    search_results = await vibe_search_codebase(question)
    
    answer = await vibe_call_pollinations(VIBE_SYSTEM_ANSWER,
        f"""User question: "{question}"

Related code found in codebase:
{search_results}

Please answer this question by analyzing the relevant code. Explain the implementation and how it works.""",
        search_results)
    
    embed = discord.Embed(
        title=f"💬 Answer: {question[:100]}",
        description=answer[:4000],
        color=discord.Color.green()
    )
    
    await i.followup.send(embed=embed)

@vibe_bot.tree.command(name="approve", description="Approve a pending fix")
@app_commands.describe(issue_id="The issue ID to approve")
async def vibe_approve(i: discord.Interaction, issue_id: str):
    """Approve a pending issue fix"""
    if issue_id not in vibe_pending_approvals:
        await i.response.send_message(f"❌ No pending approval for issue `#{issue_id}`", ephemeral=True)
        return
    
    approval = vibe_pending_approvals[issue_id]
    
    # Commit and push
    success = await vibe_git_commit_push(issue_id, f"Fix: {approval['description'][:50]}")
    
    if success:
        del vibe_pending_approvals[issue_id]
        await i.response.send_message(f"✅ Issue `#{issue_id}` approved and pushed! 🎉")
    else:
        await i.response.send_message(f"❌ Failed to push. Check git status.", ephemeral=True)

@vibe_bot.tree.command(name="reject", description="Reject a pending fix")
@app_commands.describe(issue_id="The issue ID to reject")
async def vibe_reject(i: discord.Interaction, issue_id: str):
    """Reject a pending issue fix"""
    if issue_id not in vibe_pending_approvals:
        await i.response.send_message(f"❌ No pending approval for issue `#{issue_id}`", ephemeral=True)
        return
    
    approval = vibe_pending_approvals[issue_id]
    del vibe_pending_approvals[issue_id]
    
    await i.response.send_message(f"❌ Issue `#{issue_id}` rejected.")

@vibe_bot.tree.command(name="pending", description="Show pending approvals")
async def vibe_pending(i: discord.Interaction):
    """Show all pending approvals"""
    if not vibe_pending_approvals:
        await i.response.send_message("✅ No pending approvals!")
        return
    
    embed = discord.Embed(
        title="📋 Pending Approvals",
        color=discord.Color.yellow()
    )
    
    for issue_id, approval in vibe_pending_approvals.items():
        embed.add_field(
            name=f"Issue #{issue_id}",
            value=f"{approval['description'][:80]}...\nSubmitted by: {approval['user']}",
            inline=False
        )
    
    await i.response.send_message(embed=embed)

@vibe_bot.tree.command(name="vibesync", description="Sync and update the codebase")
async def vibe_sync(i: discord.Interaction):
    """Pull latest from GitHub"""
    await i.response.defer()
    
    try:
        os.chdir(VIBE_REPO_PATH)
        result = subprocess.run(['git', 'pull', 'origin', 'main'], capture_output=True, text=True)
        await i.followup.send(f"✅ Codebase synced!\n```\n{result.stdout[:500]}\n```")
    except Exception as e:
        await i.followup.send(f"❌ Sync failed: {e}")

@vibe_bot.tree.command(name="vibehelp", description="VibeCoder help")
async def vibe_help(i: discord.Interaction):
    embed = discord.Embed(title="🤖 VibeCoder Commands", color=discord.Color.from_rgb(40, 200, 100))
    embed.add_field(name="📝 /report", value="Submit an issue for AI to analyze and fix", inline=False)
    embed.add_field(name="❓ /ask", value="Ask a question about the codebase", inline=False)
    embed.add_field(name="✅ /approve", value="Approve a pending fix to push", inline=False)
    embed.add_field(name="❌ /reject", value="Reject a pending fix", inline=False)
    embed.add_field(name="📋 /pending", value="Show pending approvals", inline=False)
    embed.add_field(name="🔄 /vibesync", value="Sync codebase from GitHub", inline=False)
    embed.set_footer(text="Mention VibeCoder in any channel to ask questions!")
    await i.response.send_message(embed=embed)

# ══════════════════════════════════════════════════════════════════════════════
# MAIN — Run all six bots concurrently
# ══════════════════════════════════════════════════════════════════════════════
async def main():
    print("="*62)
    print(" Starting all bots...")
    print(" 1. WaifuBot — Gacha card game + Celestial Veil AI chars")
    print(" 2. UnityBot — RP + image generation")
    print(" 3. ModBot — Moderation suite")
    print(" 4. NullVector — Adaptive AI assistant")
    print(" 5. LilyBot — Living AI companion")
    print(" 6. VibeCoder — AI Issue Handler & Codebase Q&A")
    print("="*62)
    
    # Only start VibeCoder if token is set
    bots_to_start = [
        waifu_bot.start(WAIFU_TOKEN),
        unity_bot.start(UNITY_TOKEN),
        mod_bot.start(MOD_TOKEN),
        nv_bot.start(NV_TOKEN),
        lily_bot.start(LILY_TOKEN),
    ]
    
    if VIBE_TOKEN:
        bots_to_start.append(vibe_bot.start(VIBE_TOKEN))
        print("  ✅ VibeCoder will start (token set)")
    else:
        print("  ⚠️ VibeCoder skipped (no VIBE_DISCORD_TOKEN set)")
    
    await asyncio.gather(*bots_to_start)

if __name__ == "__main__":
    asyncio.run(main())