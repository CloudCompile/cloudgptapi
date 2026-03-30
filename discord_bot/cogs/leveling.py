"""
Leveling cog for ZeroX Discord bot.
Handles XP, levels, leaderboards, and user/server info.
"""

from __future__ import annotations
from datetime import datetime
from typing import Optional

import discord
from discord.ext import commands

from utils.database import get_db


class Leveling(commands.Cog):
    """Leveling and user info commands."""

    def __init__(self, bot: commands.Bot):
        self.bot = bot

    async def cog_check(self, ctx: commands.Context) -> bool:
        """Ensure all commands in this cog are guild-only."""
        if ctx.guild is None:
            return False
        return True

    # ==================== Helper Functions ====================

    def _xp_for_level(self, level: int) -> int:
        """Calculate XP required for a given level."""
        return ((level - 1) ** 2) * 150

    def _calculate_level(self, xp: int) -> int:
        """Calculate level from XP."""
        return 1 + int((xp / 150) ** 0.5)

    async def _get_user_stats(self, user_id: int) -> dict:
        """Get user's level stats from database."""
        db = get_db()
        row = await db.fetch_one(
            "SELECT xp, level, total_messages, coins FROM levels WHERE user_id = ?",
            (str(user_id),),
        )
        if row:
            return {"xp": row[0], "level": row[1], "messages": row[2], "coins": row[3]}
        return {"xp": 0, "level": 1, "messages": 0, "coins": 100}

    async def _get_warning_count(self, user_id: int) -> int:
        """Get the number of warnings for a user."""
        db = get_db()
        result = await db.fetch_value(
            "SELECT COUNT(*) FROM warnings WHERE user_id = ?",
            (str(user_id),),
            default=0,
        )
        return int(result)

    # ==================== Commands ====================

    @commands.command()
    async def level(self, ctx: commands.Context, member: discord.Member = None):
        """Check your or another user's level. Usage: !level [@user]"""
        member = member or ctx.author
        stats = await self._get_user_stats(member.id)

        current_level = stats["level"]
        current_xp = stats["xp"]
        next_level_xp = self._xp_for_level(current_level + 1)
        current_level_xp = self._xp_for_level(current_level)
        progress_xp = current_xp - current_level_xp
        needed_xp = next_level_xp - current_level_xp
        progress = int((progress_xp / needed_xp) * 10) if needed_xp > 0 else 10
        bar = "=" * progress + "-" * (10 - progress)

        embed = discord.Embed(title=f"Level: {member.display_name}", color=0x9B59B6)
        embed.add_field(name="Level", value=f"**{current_level}**", inline=True)
        embed.add_field(name="Total XP", value=f"**{current_xp}**", inline=True)
        embed.add_field(name="Messages", value=f"**{stats['messages']}**", inline=True)
        embed.add_field(
            name="Progress",
            value=f"[{bar}]\n{progress_xp}/{needed_xp} XP to level {current_level + 1}",
            inline=False,
        )
        await ctx.send(embed=embed)

    @commands.command()
    async def leaderboard(self, ctx: commands.Context, board_type: str = "xp"):
        """View the leaderboard. Types: xp, messages, dollars, warnings"""
        embed = discord.Embed(color=0xF1C40F)
        db = get_db()

        if board_type.lower() in ["xp", "level"]:
            embed.title = "XP Leaderboard"
            rows = await db.fetch_all(
                "SELECT user_id, xp, level FROM levels ORDER BY xp DESC LIMIT 10"
            )
            desc = ""
            for i, (user_id, xp, level) in enumerate(rows, 1):
                medal = ["1.", "2.", "3."][i - 1] if i <= 3 else f"{i}."
                desc += f"**{medal}** <@{user_id}> - Level {level} ({xp} XP)\n"

        elif board_type.lower() in ["dollars", "money", "balance", "rich"]:
            embed.title = "Dollar Leaderboard"
            rows = await db.fetch_all(
                "SELECT user_id, coins FROM levels ORDER BY coins DESC LIMIT 10"
            )
            desc = ""
            for i, (user_id, coins) in enumerate(rows, 1):
                medal = ["1.", "2.", "3."][i - 1] if i <= 3 else f"{i}."
                desc += f"**{medal}** <@{user_id}> - ${coins:,}\n"

        elif board_type.lower() in ["msg", "messages"]:
            embed.title = "Message Leaderboard"
            rows = await db.fetch_all(
                "SELECT user_id, total_messages FROM levels ORDER BY total_messages DESC LIMIT 10"
            )
            desc = ""
            for i, (user_id, messages) in enumerate(rows, 1):
                medal = ["1.", "2.", "3."][i - 1] if i <= 3 else f"{i}."
                desc += f"**{medal}** <@{user_id}> - {messages} messages\n"

        elif board_type.lower() in ["warn", "warnings"]:
            embed.title = "Warning Leaderboard"
            rows = await db.fetch_all(
                "SELECT user_id, COUNT(*) as count FROM warnings GROUP BY user_id ORDER BY count DESC LIMIT 10"
            )
            desc = ""
            for i, (user_id, count) in enumerate(rows, 1):
                medal = ["1.", "2.", "3."][i - 1] if i <= 3 else f"{i}."
                desc += f"**{medal}** <@{user_id}> - {count} warnings\n"

        else:
            await ctx.send("Invalid type. Use: xp, messages, dollars, or warnings")
            return

        embed.description = desc or "No data yet!"
        await ctx.send(embed=embed)

    @commands.command()
    async def userinfo(self, ctx: commands.Context, member: discord.Member = None):
        """View info about a user. Usage: !userinfo [@user]"""
        member = member or ctx.author
        stats = await self._get_user_stats(member.id)
        warning_count = await self._get_warning_count(member.id)

        embed = discord.Embed(title=f"User Info: {member.display_name}", color=member.color)
        embed.set_thumbnail(url=member.display_avatar.url)
        embed.add_field(name="Username", value=f"{member.name}", inline=True)
        embed.add_field(name="ID", value=member.id, inline=True)
        embed.add_field(name="Status", value=str(member.status).title(), inline=True)
        embed.add_field(
            name="Joined Server",
            value=member.joined_at.strftime("%Y-%m-%d %H:%M UTC") if member.joined_at else "Unknown",
            inline=True,
        )
        embed.add_field(
            name="Account Created",
            value=member.created_at.strftime("%Y-%m-%d %H:%M UTC"),
            inline=True,
        )
        embed.add_field(
            name="Top Role",
            value=member.top_role.mention if member.top_role.name != "@everyone" else "None",
            inline=True,
        )
        embed.add_field(name="Level", value=f"**{stats['level']}** ({stats['xp']} XP)", inline=True)
        embed.add_field(name="Messages", value=stats["messages"], inline=True)
        embed.add_field(name="Warnings", value=warning_count, inline=True)

        await ctx.send(embed=embed)

    @commands.command()
    async def serverinfo(self, ctx: commands.Context):
        """View info about the current server."""
        guild = ctx.guild

        embed = discord.Embed(title=f"Server Info: {guild.name}", color=0x3498DB)
        if guild.icon:
            embed.set_thumbnail(url=guild.icon.url)
        embed.add_field(
            name="Owner",
            value=guild.owner.mention if guild.owner else "Unknown",
            inline=True,
        )
        embed.add_field(name="Created", value=guild.created_at.strftime("%Y-%m-%d"), inline=True)
        embed.add_field(name="Server ID", value=guild.id, inline=True)
        embed.add_field(name="Members", value=guild.member_count, inline=True)
        embed.add_field(name="Channels", value=len(guild.channels), inline=True)
        embed.add_field(name="Roles", value=len(guild.roles), inline=True)
        embed.add_field(name="Boost Level", value=f"Level {guild.premium_tier}", inline=True)
        embed.add_field(name="Boosts", value=guild.premium_subscription_count, inline=True)
        embed.add_field(name="Emojis", value=len(guild.emojis), inline=True)

        await ctx.send(embed=embed)

    @commands.command()
    async def rank(self, ctx: commands.Context, member: discord.Member = None):
        """Alias for !level. Check your or another user's rank."""
        await self.level(ctx, member)


async def setup(bot: commands.Bot):
    """Load the Leveling cog."""
    await bot.add_cog(Leveling(bot))
