"""
Fun cog for ZeroX Discord bot.
Handles fun commands like polls, reminders, 8ball, AFK, etc.
"""

from __future__ import annotations
import random
import asyncio
from datetime import datetime, timedelta
from typing import Optional

import discord
from discord.ext import commands, tasks

from utils.database import get_db
from utils.config import EIGHT_BALL_RESPONSES


class Fun(commands.Cog):
    """Fun and utility commands."""

    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.afk_users = {}  # user_id -> {reason, timestamp}
        self._cleanup_task = None

    async def cog_load(self):
        """Load AFK data from database and start cleanup task."""
        db = get_db()
        try:
            rows = await db.fetch_all("SELECT user_id, reason, timestamp FROM afk")
            for user_id, reason, ts in rows:
                try:
                    self.afk_users[user_id] = {
                        "reason": reason,
                        "timestamp": datetime.fromisoformat(ts) if ts else datetime.now()
                    }
                except:
                    pass
        except:
            pass
        # Start cleanup task
        self._afk_cleanup.start()

    async def cog_unload(self):
        """Stop cleanup task on unload."""
        if self._afk_cleanup.is_running():
            self._afk_cleanup.cancel()

    @tasks.loop(hours=1)
    async def _afk_cleanup(self):
        """Clean up stale AFK entries older than 7 days."""
        cutoff = datetime.now() - timedelta(days=7)
        stale_users = [
            uid for uid, data in self.afk_users.items()
            if data.get("timestamp", datetime.now()) < cutoff
        ]
        for uid in stale_users:
            del self.afk_users[uid]
            try:
                db = get_db()
                await db.execute("DELETE FROM afk WHERE user_id = ?", (uid,))
            except:
                pass

    async def cog_check(self, ctx: commands.Context) -> bool:
        """Ensure all commands in this cog are guild-only."""
        if ctx.guild is None:
            return False
        return True

    # ==================== Helper Functions ====================

    def _parse_time(self, time_str: str) -> Optional[timedelta]:
        """Parse time string like 1h, 30m, 2d into timedelta."""
        if not time_str:
            return None
        time_unit = time_str[-1].lower()
        try:
            time_amount = int(time_str[:-1])
        except ValueError:
            return None

        if time_unit == "m":
            return timedelta(minutes=time_amount)
        elif time_unit == "h":
            return timedelta(hours=time_amount)
        elif time_unit == "d":
            return timedelta(days=time_amount)
        return None

    # ==================== Commands ====================

    @commands.command()
    async def poll(self, ctx: commands.Context, *, content: str):
        """Create a poll. Usage: !poll Question | Option1 | Option2 | ..."""
        parts = [p.strip() for p in content.split("|")]
        if len(parts) < 3:
            await ctx.send("Format: `!poll Question | Option1 | Option2 | ...`")
            return

        question = parts[0]
        options = parts[1:11]  # Max 10 options
        emojis = ["1\u20e3", "2\u20e3", "3\u20e3", "4\u20e3", "5\u20e3",
                  "6\u20e3", "7\u20e3", "8\u20e3", "9\u20e3", "\U0001f51f"]

        embed = discord.Embed(title=f"Poll: {question}", color=0x3498DB)
        embed.description = "\n".join([f"{emojis[i]} {opt}" for i, opt in enumerate(options)])
        embed.set_footer(text=f"Poll by {ctx.author.display_name}")

        poll_msg = await ctx.send(embed=embed)
        for i in range(len(options)):
            await poll_msg.add_reaction(emojis[i])

    @commands.command()
    async def remindme(self, ctx: commands.Context, time: str, *, message: str):
        """Set a reminder. Usage: !remindme <time> <message>"""
        td = self._parse_time(time)
        if not td:
            await ctx.send("Invalid format. Use: 10m, 1h, 2d")
            return

        reminder_time = datetime.now() + td
        db = get_db()
        await db.execute(
            "INSERT INTO reminders (user_id, channel_id, reminder_time, message, created_at) VALUES (?, ?, ?, ?, ?)",
            (str(ctx.author.id), str(ctx.channel.id), reminder_time.isoformat(), message, datetime.now().isoformat()),
        )
        await ctx.send(f"I'll remind you in {time}: {message}")

    @commands.command(name="8ball")
    async def eightball(self, ctx: commands.Context, *, question: str):
        """Ask the magic 8ball a question."""
        response = random.choice(EIGHT_BALL_RESPONSES)
        embed = discord.Embed(title="Magic 8-Ball", color=0x9B59B6)
        embed.add_field(name="Question", value=question, inline=False)
        embed.add_field(name="Answer", value=response, inline=False)
        await ctx.send(embed=embed)

    @commands.command()
    async def coinflip(self, ctx: commands.Context):
        """Flip a coin (no betting)."""
        result = random.choice(["Heads", "Tails"])
        await ctx.send(f"The coin landed on **{result}**!")

    @commands.command()
    async def roll(self, ctx: commands.Context, dice: str = "1d6"):
        """Roll dice. Usage: !roll [NdS] (e.g., 2d20, 1d6)"""
        try:
            if "d" in dice.lower():
                parts = dice.lower().split("d")
                num_dice = int(parts[0]) if parts[0] else 1
                sides = int(parts[1])
            else:
                num_dice = 1
                sides = int(dice)

            if num_dice > 100 or sides > 1000:
                await ctx.send("Too many dice or sides!")
                return

            rolls = [random.randint(1, sides) for _ in range(num_dice)]
            total = sum(rolls)

            if num_dice == 1:
                await ctx.send(f"You rolled a **{total}**!")
            else:
                rolls_str = ", ".join(str(r) for r in rolls[:20])
                if len(rolls) > 20:
                    rolls_str += f"... (+{len(rolls) - 20} more)"
                await ctx.send(f"Rolls: {rolls_str}\n**Total: {total}**")
        except:
            await ctx.send("Format: !roll [NdS] (e.g., 2d20, 1d6)")

    @commands.command()
    async def choose(self, ctx: commands.Context, *, choices: str):
        """Choose between options. Usage: !choose option1, option2, option3"""
        options = [o.strip() for o in choices.split(",")]
        if len(options) < 2:
            await ctx.send("Give me at least 2 options separated by commas!")
            return
        choice = random.choice(options)
        await ctx.send(f"I choose: **{choice}**")

    @commands.command()
    async def afk(self, ctx: commands.Context, *, reason: str = "AFK"):
        """Set yourself as AFK. Usage: !afk [reason]"""
        user_id = str(ctx.author.id)
        self.afk_users[user_id] = {"reason": reason, "timestamp": datetime.now()}

        db = get_db()
        await db.execute(
            "INSERT OR REPLACE INTO afk (user_id, reason, timestamp) VALUES (?, ?, ?)",
            (user_id, reason, datetime.now().isoformat()),
        )
        await ctx.send(f"You are now AFK: {reason}")

    @commands.command()
    async def say(self, ctx: commands.Context, *, message: str):
        """Make the bot say something."""
        try:
            await ctx.message.delete()
        except:
            pass
        await ctx.send(message)

    @commands.command()
    async def avatar(self, ctx: commands.Context, member: discord.Member = None):
        """Get a user's avatar. Usage: !avatar [@user]"""
        member = member or ctx.author
        embed = discord.Embed(title=f"{member.display_name}'s Avatar", color=member.color)
        embed.set_image(url=member.display_avatar.url)
        await ctx.send(embed=embed)

    @commands.command()
    async def emote(self, ctx: commands.Context, emoji: discord.PartialEmoji = None):
        """Get a larger version of a custom emoji."""
        if emoji is None:
            await ctx.send("Please provide a custom emoji!")
            return
        await ctx.send(emoji.url)

    @commands.Cog.listener()
    async def on_message(self, message: discord.Message):
        """Handle AFK mentions."""
        if message.author.bot:
            return

        # Check if user is back from AFK
        user_id = str(message.author.id)
        if user_id in self.afk_users:
            del self.afk_users[user_id]
            db = get_db()
            await db.execute("DELETE FROM afk WHERE user_id = ?", (user_id,))
            await message.channel.send(f"Welcome back {message.author.mention}! I removed your AFK status.", delete_after=5)

        # Check if mentioned users are AFK
        for user in message.mentions:
            target_id = str(user.id)
            if target_id in self.afk_users:
                afk_data = self.afk_users[target_id]
                await message.channel.send(
                    f"{user.display_name} is AFK: {afk_data['reason']}",
                    delete_after=10,
                )


async def setup(bot: commands.Bot):
    """Load the Fun cog."""
    await bot.add_cog(Fun(bot))
