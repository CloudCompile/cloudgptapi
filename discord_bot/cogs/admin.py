"""
Admin cog for ZeroX Discord bot.
Handles server administration commands.
"""

from __future__ import annotations
from datetime import datetime
from typing import Optional

import discord
from discord.ext import commands

from utils.database import get_db
from utils.config import DEV_ID, LOG_CHANNEL_ID
from utils.helpers import clean_output


class Admin(commands.Cog):
    """Server administration commands."""

    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.bot_start_time = datetime.now()

    async def cog_check(self, ctx: commands.Context) -> bool:
        """Ensure all commands in this cog are guild-only."""
        if ctx.guild is None:
            return False
        return True

    # ==================== Helper Functions ====================

    async def _discord_log(self, message: str, title: str = "ADMIN LOG", color: int = 0x3498DB):
        """Log to the configured log channel."""
        if not LOG_CHANNEL_ID:
            return
        try:
            channel = self.bot.get_channel(int(LOG_CHANNEL_ID))
            if channel:
                embed = discord.Embed(
                    title=title,
                    description=clean_output(str(message))[:4000],
                    color=color,
                    timestamp=datetime.now(),
                )
                await channel.send(embed=embed)
        except Exception as e:
            print(f"Log Error: {e}")

    # ==================== Commands ====================

    @commands.command()
    @commands.has_permissions(administrator=True)
    async def setwelcome(self, ctx: commands.Context, channel: discord.TextChannel = None):
        """Set the welcome channel. Usage: !setwelcome [#channel]"""
        db = get_db()
        if channel:
            await db.execute(
                "INSERT INTO guild_config (guild_id, welcome_channel_id) VALUES (?, ?) "
                "ON CONFLICT(guild_id) DO UPDATE SET welcome_channel_id = ?",
                (str(ctx.guild.id), str(channel.id), str(channel.id)),
            )
            await ctx.send(f"Welcome channel set to {channel.mention}")
        else:
            await db.execute(
                "UPDATE guild_config SET welcome_channel_id = NULL WHERE guild_id = ?",
                (str(ctx.guild.id),),
            )
            await ctx.send("Welcome channel disabled.")

    @commands.command()
    @commands.has_permissions(administrator=True)
    async def setleave(self, ctx: commands.Context, channel: discord.TextChannel = None):
        """Set the leave channel. Usage: !setleave [#channel]"""
        db = get_db()
        if channel:
            await db.execute(
                "INSERT INTO guild_config (guild_id, leave_channel_id) VALUES (?, ?) "
                "ON CONFLICT(guild_id) DO UPDATE SET leave_channel_id = ?",
                (str(ctx.guild.id), str(channel.id), str(channel.id)),
            )
            await ctx.send(f"Leave channel set to {channel.mention}")
        else:
            await db.execute(
                "UPDATE guild_config SET leave_channel_id = NULL WHERE guild_id = ?",
                (str(ctx.guild.id),),
            )
            await ctx.send("Leave channel disabled.")

    @commands.command()
    @commands.has_permissions(administrator=True)
    async def setautorole(self, ctx: commands.Context, role: discord.Role = None):
        """Set auto-role for new members. Usage: !setautorole [@role]"""
        db = get_db()
        if role:
            await db.execute(
                "INSERT INTO guild_config (guild_id, auto_role_id) VALUES (?, ?) "
                "ON CONFLICT(guild_id) DO UPDATE SET auto_role_id = ?",
                (str(ctx.guild.id), str(role.id), str(role.id)),
            )
            await ctx.send(f"Auto-role set to {role.mention}")
        else:
            await db.execute(
                "UPDATE guild_config SET auto_role_id = NULL WHERE guild_id = ?",
                (str(ctx.guild.id),),
            )
            await ctx.send("Auto-role disabled.")

    @commands.command()
    @commands.has_permissions(manage_roles=True)
    async def giverole(self, ctx: commands.Context, member: discord.Member, role: discord.Role):
        """Give a role to a member. Usage: !giverole @user @role"""
        await member.add_roles(role)
        await ctx.send(f"Gave {role.mention} to {member.mention}")
        await self._discord_log(f"{ctx.author} gave {role.name} to {member.display_name}", title="ROLE ADDED")

    @commands.command()
    @commands.has_permissions(manage_roles=True)
    async def takerole(self, ctx: commands.Context, member: discord.Member, role: discord.Role):
        """Remove a role from a member. Usage: !takerole @user @role"""
        await member.remove_roles(role)
        await ctx.send(f"Removed {role.mention} from {member.mention}")
        await self._discord_log(f"{ctx.author} removed {role.name} from {member.display_name}", title="ROLE REMOVED")

    @commands.command()
    @commands.has_permissions(manage_channels=True)
    @commands.cooldown(1, 60, commands.BucketType.guild)  # 1 per minute per guild
    async def announce(self, ctx: commands.Context, channel: discord.TextChannel, *, message: str):
        """Send an announcement to a channel. Usage: !announce #channel <message>"""
        embed = discord.Embed(
            title="Announcement",
            description=message,
            color=0x3498DB,
            timestamp=datetime.now(),
        )
        embed.set_footer(text=f"From {ctx.author.display_name}")
        await channel.send(embed=embed)
        await ctx.send(f"Announcement sent to {channel.mention}")

    @commands.command()
    @commands.has_permissions(manage_messages=True)
    @commands.cooldown(3, 60, commands.BucketType.user)  # 3 per minute per user
    async def embed(self, ctx: commands.Context, *, content: str):
        """Create a custom embed. Format: title | description | color"""
        parts = [p.strip() for p in content.split("|")]
        title = parts[0] if len(parts) > 0 else None
        description = parts[1] if len(parts) > 1 else None
        color = int(parts[2], 16) if len(parts) > 2 else 0x3498DB

        embed = discord.Embed(title=title, description=description, color=color)
        await ctx.send(embed=embed)

    @commands.command()
    @commands.has_permissions(administrator=True)
    async def setlogchannel(self, ctx: commands.Context, channel: discord.TextChannel):
        """Set the log channel for this server."""
        db = get_db()
        await db.execute(
            "INSERT INTO guild_config (guild_id, log_channel_id) VALUES (?, ?) "
            "ON CONFLICT(guild_id) DO UPDATE SET log_channel_id = ?",
            (str(ctx.guild.id), str(channel.id), str(channel.id)),
        )
        await ctx.send(f"Log channel set to {channel.mention}")

    @commands.command()
    async def botstats(self, ctx: commands.Context):
        """View bot statistics."""
        uptime = datetime.now() - self.bot_start_time
        days, remainder = divmod(int(uptime.total_seconds()), 86400)
        hours, remainder = divmod(remainder, 3600)
        minutes, seconds = divmod(remainder, 60)

        embed = discord.Embed(title="Bot Statistics", color=0x3498DB)
        embed.add_field(name="Servers", value=len(self.bot.guilds), inline=True)
        embed.add_field(
            name="Users",
            value=sum(g.member_count for g in self.bot.guilds if g.member_count),
            inline=True,
        )
        embed.add_field(
            name="Uptime",
            value=f"{days}d {hours}h {minutes}m {seconds}s",
            inline=True,
        )
        embed.add_field(name="Latency", value=f"{round(self.bot.latency * 1000)}ms", inline=True)

        db = get_db()
        total_users = await db.fetch_value("SELECT COUNT(*) FROM levels", default=0)
        total_keys = await db.fetch_value("SELECT COUNT(*) FROM api_keys", default=0)

        embed.add_field(name="Tracked Users", value=total_users, inline=True)
        embed.add_field(name="API Keys", value=total_keys, inline=True)

        await ctx.send(embed=embed)

    @commands.command()
    async def ping(self, ctx: commands.Context):
        """Check bot latency."""
        latency = round(self.bot.latency * 1000)
        await ctx.send(f"Pong! {latency}ms")

    @commands.command()
    @commands.has_permissions(administrator=True)
    async def reactionrole(self, ctx: commands.Context, message_id: int, emoji: str, role: discord.Role):
        """Set up a reaction role. Usage: !reactionrole <message_id> <emoji> @role"""
        try:
            message = await ctx.channel.fetch_message(message_id)
            await message.add_reaction(emoji)

            db = get_db()
            await db.execute(
                "INSERT INTO reaction_roles (message_id, emoji, role_id, guild_id) VALUES (?, ?, ?, ?)",
                (str(message_id), emoji, str(role.id), str(ctx.guild.id)),
            )
            await ctx.send(f"Reaction role set! React with {emoji} to get {role.mention}")

        except discord.NotFound:
            await ctx.send("Message not found!")
        except Exception as e:
            await ctx.send(f"Error: {e}")

    @commands.command()
    @commands.has_permissions(administrator=True)
    @commands.cooldown(1, 300, commands.BucketType.guild)  # 1 per 5 minutes per guild
    async def nuke(self, ctx: commands.Context):
        """Clone and delete the current channel (reset it completely)."""
        # Prevent nuking the log channel
        if LOG_CHANNEL_ID and str(ctx.channel.id) == str(LOG_CHANNEL_ID):
            await ctx.send("Cannot nuke the log channel!")
            return

        confirm_msg = await ctx.send(
            "Are you sure you want to nuke this channel? This will delete all messages.\n"
            "React with a checkmark to confirm."
        )
        await confirm_msg.add_reaction("\u2705")

        def check(reaction, user):
            return user == ctx.author and str(reaction.emoji) == "\u2705" and reaction.message.id == confirm_msg.id

        try:
            await self.bot.wait_for("reaction_add", timeout=30.0, check=check)
            # Log BEFORE deleting since the channel will be gone
            await self._discord_log(f"{ctx.author} nuked #{ctx.channel.name}", title="CHANNEL NUKED", color=0xE74C3C)
            new_channel = await ctx.channel.clone(reason=f"Nuked by {ctx.author}")
            await ctx.channel.delete()
            await new_channel.send("Channel has been nuked!")
        except:
            await confirm_msg.delete()


async def setup(bot: commands.Bot):
    """Load the Admin cog."""
    await bot.add_cog(Admin(bot))
