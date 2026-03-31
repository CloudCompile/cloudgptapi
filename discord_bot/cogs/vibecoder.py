"""
VibeCoder - AI-Powered Issue Handler & Codebase Q&A
Hears issues, thinks through fixes, asks for approval, pushes changes.
Also answers questions by searching the codebase.
"""

import os
import re
import subprocess
import asyncio
import aiohttp
import discord
from discord import app_commands
from discord.ext import commands
from datetime import datetime
import json
import base64
from typing import Optional, List, Dict
import google.auth
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

# Configuration
REPO_PATH = os.path.expanduser("~/Documents/GitHub/cloudgptapi")
POLLINATIONS_API_URL = "https://gen.pollinations.ai/v1/chat/completions"
APPROVAL_EMAIL_FROM = "christopherhauser1234@gmail.com"
APPROVAL_EMAIL_TO = "cjhauser_techie@icloud.com"

# Gmail scopes for reading replies
GMAIL_SCOPES = ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.modify']

# Store pending approvals: {issue_id: {description, proposed_fix, files_changed, timestamp}}
pending_approvals: Dict[str, dict] = {}


class VibeCoder(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.session: Optional[aiohttp.ClientSession] = None
        self.gmail_service = None
        
    async def cog_load(self):
        self.session = aiohttp.ClientSession()
        # Try to set up Gmail API (will fail gracefully if no credentials)
        try:
            self._setup_gmail()
        except Exception as e:
            print(f"Gmail API setup skipped: {e}")
    
    def _setup_gmail(self):
        """Initialize Gmail API with OAuth"""
        # Note: You'll need to set up OAuth2 credentials via Google Cloud Console
        # For now, we'll use a simpler approach with app password
        pass
    
    async def call_pollinations(self, system_prompt: str, user_prompt: str, context: str = "") -> str:
        """Call Pollinations API with proper vibe coding prompts"""
        
        full_prompt = f"""{system_prompt}

CODEBASE CONTEXT:
```
{context}
```

USER REQUEST:
{user_prompt}

Think carefully, analyze the codebase, and provide a thorough response."""

        payload = {
            "model": "minimax",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"{context}\n\n{user_prompt}"}
            ],
            "temperature": 0.7,
            "max_tokens": 4000
        }

        headers = {
            "Content-Type": "application/json"
        }

        async with self.session.post(POLLINATIONS_API_URL, json=payload, headers=headers) as resp:
            if resp.status == 200:
                data = await resp.json()
                return data.get("choices", [{}])[0].get("message", {}).get("content", "No response")
            else:
                return f"Error: {resp.status} - {await resp.text()}"

    async def search_codebase(self, query: str, file_types: List[str] = None) -> str:
        """Search the codebase for relevant files and content"""
        if file_types is None:
            file_types = ['.ts', '.tsx', '.js', '.jsx', '.py', '.json', '.md']
        
        results = []
        
        # Search for files containing the query
        for root, dirs, files in os.walk(REPO_PATH):
            # Skip node_modules, .git, etc
            dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', '__pycache__', '.next']]
            
            for file in files:
                ext = os.path.splitext(file)[1]
                if ext in file_types:
                    filepath = os.path.join(root, file)
                    rel_path = os.path.relpath(filepath, REPO_PATH)
                    
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
                                            'content': line.strip()[:100]
                                        })
                    except:
                        pass
        
        if not results:
            return f"No matches found for '{query}' in the codebase."
        
        # Return top 10 results
        output = f"Found {len(results)} matches for '{query}':\n\n"
        for r in results[:10]:
            output += f"📁 {r['file']}:{r['line']}\n   {r['content']}\n\n"
        
        return output

    async def read_file(self, filepath: str) -> str:
        """Read a file from the repo"""
        full_path = os.path.join(REPO_PATH, filepath)
        try:
            with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read()
        except Exception as e:
            return f"Error reading {filepath}: {e}"

    async def write_file(self, filepath: str, content: str) -> bool:
        """Write to a file in the repo"""
        full_path = os.path.join(REPO_PATH, filepath)
        try:
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        except Exception as e:
            print(f"Error writing {filepath}: {e}")
            return False

    def generate_issue_id(self) -> str:
        """Generate a unique issue ID"""
        import uuid
        return str(uuid.uuid4())[:8]

    async def send_approval_email(self, issue_id: str, description: str, proposed_fix: str, files_changed: List[str]) -> bool:
        """Send approval email via Gmail"""
        # For now, we'll use a simple SMTP approach
        # In production, you'd use Gmail API with OAuth2
        
        email_content = f"""Subject: [VibeCoder] Issue #{issue_id} - Approval Request

Hi CJ,

A fix has been proposed for your review.

ISSUE: {description}

PROPOSED FIX:
{proposed_fix}

FILES TO BE MODIFIED:
{', '.join(files_changed)}

---
To approve, simply reply to this email with: APPROVE {issue_id}
To reject, reply with: REJECT {issue_id}

VibeCoder 🤖
"""
        
        print(f"📧 Would send email to {APPROVAL_EMAIL_TO}:")
        print(email_content)
        
        # TODO: Implement actual email sending
        # For now, just log it. Real implementation would use:
        # - Gmail API (requires OAuth2 setup)
        # - Or smtplib with app password
        
        return True

    async def check_approval_replies(self) -> List[str]:
        """Check for approval replies in Gmail"""
        # TODO: Implement Gmail API polling
        # This would check for replies to the approval emails
        
        # For now, we'll handle approvals via Discord commands instead
        return []

    async def git_commit_and_push(self, issue_id: str, message: str) -> bool:
        """Commit changes and push to GitHub"""
        try:
            os.chdir(REPO_PATH)
            
            # Add all changes
            subprocess.run(['git', 'add', '-A'], check=True)
            
            # Commit with descriptive message
            subprocess.run(['git', 'commit', '-m', f'{message} [Issue #{issue_id}]'], check=True)
            
            # Push
            subprocess.run(['git', 'push', 'origin', 'main'], check=True)
            
            return True
        except Exception as e:
            print(f"Git error: {e}")
            return False

    @app_commands.command(name="report", description="Report an issue for VibeCoder to fix")
    async def report_issue(self, interaction: discord.Interaction, issue: str):
        """Report an issue - VibeCoder will analyze and propose a fix"""
        await interaction.response.defer()
        
        issue_id = self.generate_issue_id()
        
        # Search the codebase for related context
        search_results = await self.search_codebase(issue)
        
        # Build system prompt for vibe coding
        system_prompt = """You are VibeCoder - an elite AI developer with "vibe coding" philosophy.

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
        
        user_prompt = f"""The user reported this issue: "{issue}"

We've searched the codebase and found these related files:
{search_results}

Please analyze this issue thoroughly and propose a fix. Include:
1. Root cause analysis
2. Exact files and lines to change
3. The proposed code changes
4. Why this fixes the issue"""

        # Call the API
        analysis = await self.call_pollinations(system_prompt, user_prompt, search_results)
        
        # Store the proposal for approval
        pending_approvals[issue_id] = {
            'description': issue,
            'proposed_fix': analysis,
            'timestamp': datetime.now(),
            'user': interaction.user.name
        }
        
        # Send approval request
        await self.send_approval_email(issue_id, issue, analysis, ["various files"])
        
        # Confirm to user
        embed = discord.Embed(
            title=f"📋 Issue #{issue_id} Received",
            description=issue,
            color=discord.Color.blue()
        )
        embed.add_field(name="Status", value="🔄 Analyzing codebase and proposing fix...")
        embed.add_field(name="Next Step", value="Check your email to approve the fix", inline=False)
        
        await interaction.followup.send(embed=embed)

    @app_commands.command(name="ask", description="Ask VibeCoder a question about the codebase")
    async def ask_question(self, interaction: discord.Interaction, question: str):
        """Ask VibeCoder about the codebase - it will search and answer"""
        await interaction.response.defer()
        
        # Search for relevant code
        search_results = await self.search_codebase(question)
        
        system_prompt = """You are VibeCoder - an expert on this codebase. 

Your job is to:
1. Search through the code to find relevant information
2. Explain HOW the code works, not just what it does
3. Give practical, actionable answers
4. If something is unclear, say so

Be thorough but concise. Use code snippets where helpful."""
        
        user_prompt = f"""User question: "{question}"

Related code found in codebase:
{search_results}

Please answer this question by analyzing the relevant code. Explain the implementation and how it works."""
        
        answer = await self.call_pollinations(system_prompt, user_prompt, search_results)
        
        embed = discord.Embed(
            title=f"💬 Answer: {question}",
            description=answer[:4000],  # Discord limit
            color=discord.Color.green()
        )
        
        await interaction.followup.send(embed=embed)

    @app_commands.command(name="approve", description="Approve a pending fix")
    async def approve_fix(self, interaction: discord.Interaction, issue_id: str):
        """Approve a pending issue fix"""
        if issue_id not in pending_approvals:
            await interaction.response.send_message(f"❌ No pending approval for issue #{issue_id}", ephemeral=True)
            return
        
        approval = pending_approvals[issue_id]
        
        # Commit and push
        success = await self.git_commit_and_push(
            issue_id,
            f"Fix: {approval['description'][:50]}..."
        )
        
        if success:
            del pending_approvals[issue_id]
            await interaction.response.send_message(f"✅ Issue #{issue_id} approved and pushed! 🎉")
        else:
            await interaction.response.send_message(f"❌ Failed to push. Check git status.", ephemeral=True)

    @app_commands.command(name="reject", description="Reject a pending fix")
    async def reject_fix(self, interaction: discord.Interaction, issue_id: str):
        """Reject a pending issue fix"""
        if issue_id not in pending_approvals:
            await interaction.response.send_message(f"❌ No pending approval for issue #{issue_id}", ephemeral=True)
            return
        
        approval = pending_approvals[issue_id]
        del pending_approvals[issue_id]
        
        await interaction.response.send_message(f"❌ Issue #{issue_id} rejected.")

    @app_commands.command(name="pending", description="Show pending approvals")
    async def show_pending(self, interaction: discord.Interaction):
        """Show all pending approvals"""
        if not pending_approvals:
            await interaction.response.send_message("✅ No pending approvals!")
            return
        
        embed = discord.Embed(
            title="📋 Pending Approvals",
            color=discord.Color.yellow()
        )
        
        for issue_id, approval in pending_approvals.items():
            embed.add_field(
                name=f"Issue #{issue_id}",
                value=f"{approval['description'][:100]}...\nSubmitted by: {approval['user']}",
                inline=False
            )
        
        await interaction.response.send_message(embed=embed)

    @app_commands.command(name="sync", description="Sync and update the codebase")
    async def sync_codebase(self, interaction: discord.Interaction):
        """Pull latest from GitHub"""
        await interaction.response.defer()
        
        try:
            os.chdir(REPO_PATH)
            result = subprocess.run(['git', 'pull', 'origin', 'main'], capture_output=True, text=True)
            
            await interaction.followup.send(f"✅ Codebase synced!\n```\n{result.stdout}\n```")
        except Exception as e:
            await interaction.followup.send(f"❌ Sync failed: {e}")

    @commands.Cog.listener()
    async def on_message(self, message):
        """Listen for mentions and answer questions"""
        # Ignore bot messages
        if message.author.bot:
            return
        
        # Check if bot is mentioned
        if self.bot.user in message.mentions:
            question = message.content.replace(f'@{self.bot.user.name}', '').strip()
            
            if question:
                # Search and answer
                async with message.channel.typing():
                    search_results = await self.search_codebase(question)
                    
                    system_prompt = """You are VibeCoder - an expert on this codebase. 

Your job is to:
1. Search through the code to find relevant information
2. Explain HOW the code works, not just what it does
3. Give practical, actionable answers
4. If something is unclear, say so

Be thorough but concise. Use code snippets where helpful."""
                    
                    user_prompt = f"""User asked: "{question}"

Related code found in codebase:
{search_results}

Please answer this question by analyzing the relevant code."""
                    
                    answer = await self.call_pollinations(system_prompt, user_prompt, search_results)
                    
                    await message.reply(answer[:4000])


async def setup(bot):
    await bot.add_cog(VibeCoder(bot))