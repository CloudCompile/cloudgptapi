"""
Moderation cog for ZeroX Discord bot.
Handles all moderation commands (warn, ban, kick, mute, etc.)
"""

from __future__ import annotations
import re
from datetime import datetime, timedelta
from typing import Optional

import discord
from discord.ext import commands

from utils.database import get_db


class Moderation(commands.Cog):
    """Moderation and admin commands."""

    def __init__(self, bot: commands.Bot):
        self.bot = bot

    async def cog_check(self, ctx: commands.Context) -> bool:
        """Ensure all commands in this cog are guild-only."""
        if ctx.guild is None:
            return False
        return True

    # ==================== Helper Functions ====================

    async def _log_warning(self, user_id: int, username: str, reason: str, warner_id: int):
        """Record a warning in the database."""
        db = get_db()
        await db.execute(
            "INSERT INTO warnings (user_id, username, reason, timestamp, warner_id) VALUES (?, ?, ?, ?, ?)",
            (str(user_id), username, reason, datetime.now().isoformat(), str(warner_id)),
        )

    async def _log_mod_action(self, user_id: int, action_type: str, reason: str,
                               moderator_id: int, duration: str = None):
        """Record a moderation action in the database."""
        db = get_db()
        await db.execute(
            "INSERT INTO mod_actions (user_id, action_type, reason, timestamp, moderator_id, duration) VALUES (?, ?, ?, ?, ?, ?)",
            (str(user_id), action_type, reason, datetime.now().isoformat(), str(moderator_id), duration),
        )

    async def _get_warning_count(self, user_id: int) -> int:
        """Get the number of warnings for a user."""
        db = get_db()
        result = await db.fetch_value(
            "SELECT COUNT(*) FROM warnings WHERE user_id = ?",
            (str(user_id),),
            default=0,
        )
        return int(result)

    async def _get_rule(self, guild_id: int, rule_id: str) -> Optional[tuple]:
        """Get a specific rule from the database."""
        db = get_db()
        return await db.fetch_one(
            "SELECT rule_id, title, description, category FROM rules WHERE guild_id = ? AND rule_id = ?",
            (str(guild_id), rule_id),
        )

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

    async def _discord_log(self, message: str, title: str = "SYSTEM LOG", color: int = 0x3498DB):
        """Log to the configured log channel."""
        from utils.config import LOG_CHANNEL_ID
        from utils.helpers import clean_output

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

    # ==================== Moderation Commands ====================

    @commands.command()
    @commands.has_permissions(manage_messages=True)
    async def purge(self, ctx: commands.Context, amount: int):
        """Delete multiple messages at once. Usage: !purge <amount>"""
        if amount < 1 or amount > 99:
            await ctx.send("Amount must be between 1 and 99.")
            return
        # Delete amount + 1 to include the command message (total max 100)
        deleted = await ctx.channel.purge(limit=amount + 1)
        msg = await ctx.send(f"Deleted {len(deleted) - 1} messages.")
        await msg.delete(delay=3)
        await self._discord_log(
            f"{ctx.author} purged {len(deleted) - 1} messages in {ctx.channel}",
            title="PURGE"
        )

    @commands.command()
    @commands.has_permissions(kick_members=True)
    async def kick(self, ctx: commands.Context, member: discord.Member, *, reason: str = None):
        """Kick a member from the server. Usage: !kick <@user> [reason]"""
        await member.kick(reason=reason)
        await self._log_mod_action(member.id, "KICK", reason or "No reason", ctx.author.id)
        await ctx.send(f"Kicked {member.display_name}. Reason: {reason or 'No reason provided'}")

    @commands.command()
    @commands.has_permissions(ban_members=True)
    async def ban(self, ctx: commands.Context, member: discord.Member, *, reason: str = None):
        """Ban a member from the server. Usage: !ban <@user> [reason]"""
        await member.ban(reason=reason)
        await self._log_mod_action(member.id, "BAN", reason or "No reason", ctx.author.id)
        await ctx.send(f"Banned {member.display_name}. Reason: {reason or 'No reason provided'}")

    @commands.command()
    @commands.has_permissions(manage_messages=True)
    async def warn(self, ctx: commands.Context, member: discord.Member, *, reason: str = "No reason provided"):
        """Warn a member. Use r1.1 format to reference rules. Usage: !warn <@user> <reason>"""
        # Check if reason starts with 'r' followed by a rule number (e.g., r1.1, r3.2)
        rule_match = re.match(r"^r(\d+\.?\d*)\s*(.*)?$", reason, re.IGNORECASE)

        if rule_match:
            rule_id = rule_match.group(1)
            extra_reason = rule_match.group(2) or ""

            # Get the rule from database
            rule = await self._get_rule(ctx.guild.id, rule_id)
            if rule:
                rule_id, title, desc, category = rule
                reason = f"Rule {rule_id}: {title}"
                if extra_reason:
                    reason += f" - {extra_reason}"
            else:
                reason = f"Rule {rule_id} (not found in database)"
                if extra_reason:
                    reason += f" - {extra_reason}"

        await self._log_warning(member.id, member.display_name, reason, ctx.author.id)
        await self._log_mod_action(member.id, "WARN", reason, ctx.author.id)
        count = await self._get_warning_count(member.id)
        await ctx.send(f"{member.mention} warned. Reason: {reason} (Total: {count})")

    @commands.command()
    @commands.has_permissions(manage_messages=True)
    async def unwarn(self, ctx: commands.Context, member: discord.Member):
        """Remove the latest warning from a member. Usage: !unwarn <@user>"""
        db = get_db()
        result = await db.fetch_one(
            "SELECT id FROM warnings WHERE user_id = ? ORDER BY timestamp DESC LIMIT 1",
            (str(member.id),),
        )
        if result:
            await db.execute("DELETE FROM warnings WHERE id = ?", (result[0],))
            await ctx.send(f"Removed latest warning for {member.display_name}.")
        else:
            await ctx.send(f"{member.display_name} has no warnings.")

    @commands.command()
    @commands.has_permissions(manage_messages=True)
    async def warnings(self, ctx: commands.Context, member: discord.Member):
        """View all warnings for a member. Usage: !warnings <@user>"""
        db = get_db()
        results = await db.fetch_all(
            "SELECT reason, timestamp FROM warnings WHERE user_id = ? ORDER BY timestamp DESC",
            (str(member.id),),
        )
        if not results:
            await ctx.send(f"{member.display_name} has no warnings.")
            return
        embed = discord.Embed(title=f"Warnings: {member.display_name}", color=0xFFA500)
        for reason, ts in results[:10]:
            embed.add_field(name=ts.split("T")[0], value=reason, inline=False)
        await ctx.send(embed=embed)

    @commands.command()
    @commands.has_permissions(manage_messages=True)
    async def history(self, ctx: commands.Context, member: discord.Member):
        """View moderation history for a member. Usage: !history <@user>"""
        db = get_db()
        results = await db.fetch_all(
            "SELECT action_type, reason, timestamp, moderator_id, duration FROM mod_actions WHERE user_id = ? ORDER BY timestamp DESC LIMIT 15",
            (str(member.id),),
        )
        if not results:
            await ctx.send(f"{member.display_name} has no moderation history.")
            return
        embed = discord.Embed(title=f"Mod History: {member.display_name}", color=0xE74C3C)
        for action_type, reason, ts, mod_id, duration in results:
            duration_str = f" ({duration})" if duration else ""
            embed.add_field(
                name=f"{action_type}{duration_str} - {ts.split('T')[0]}",
                value=f"{reason}\nBy: <@{mod_id}>",
                inline=False,
            )
        await ctx.send(embed=embed)

    @commands.command()
    @commands.has_permissions(moderate_members=True)
    async def mute(self, ctx: commands.Context, member: discord.Member,
                   duration: str = "10m", *, reason: str = "No reason provided"):
        """Timeout a member. Usage: !mute <@user> [duration] [reason]"""
        td = self._parse_time(duration)
        if not td:
            await ctx.send("Invalid format. Use: 10m, 1h, 1d")
            return
        await member.timeout(td, reason=reason)
        await self._log_mod_action(member.id, "MUTE", reason, ctx.author.id, duration)
        await ctx.send(f"Muted {member.display_name} for {duration}. Reason: {reason}")

    @commands.command()
    @commands.has_permissions(moderate_members=True)
    async def unmute(self, ctx: commands.Context, member: discord.Member):
        """Remove timeout from a member. Usage: !unmute <@user>"""
        await member.timeout(None)
        await self._log_mod_action(member.id, "UNMUTE", "Unmuted", ctx.author.id)
        await ctx.send(f"Unmuted {member.display_name}.")

    @commands.command()
    @commands.has_permissions(manage_channels=True)
    async def slowmode(self, ctx: commands.Context, seconds: int):
        """Set slowmode for the current channel. Usage: !slowmode <seconds>"""
        if seconds < 0 or seconds > 21600:
            await ctx.send("Slowmode must be 0-21600 seconds.")
            return
        await ctx.channel.edit(slowmode_delay=seconds)
        await ctx.send(f"Slowmode {'disabled' if seconds == 0 else f'set to {seconds}s'}.")

    @commands.command()
    @commands.has_permissions(manage_channels=True)
    async def lockdown(self, ctx: commands.Context):
        """Lock or unlock ALL server channels (prevents @everyone from sending messages)."""
        guild = ctx.guild

        # Check current state by looking at the first text channel
        first_channel = None
        for channel in guild.text_channels:
            first_channel = channel
            break

        if not first_channel:
            await ctx.send("No text channels found.")
            return

        overwrite = first_channel.overwrites_for(guild.default_role)
        is_locked = overwrite.send_messages is False

        # Toggle: if locked, unlock all; if unlocked, lock all
        status_msg = await ctx.send(
            f"{'Unlocking' if is_locked else 'Locking'} all channels..."
        )

        locked_count = 0
        for channel in guild.text_channels:
            try:
                overwrite = channel.overwrites_for(guild.default_role)
                if is_locked:
                    overwrite.send_messages = None
                else:
                    overwrite.send_messages = False
                await channel.set_permissions(guild.default_role, overwrite=overwrite)
                locked_count += 1
            except:
                pass

        if is_locked:
            await status_msg.edit(content=f"**Server Unlocked** - {locked_count} channels unlocked.")
            await self._discord_log(f"{ctx.author} unlocked {locked_count} channels", title="LOCKDOWN LIFTED")
        else:
            await status_msg.edit(content=f"**Server Locked** - {locked_count} channels locked. Only staff can send messages.")
            await self._discord_log(f"{ctx.author} locked down {locked_count} channels", title="LOCKDOWN ENABLED")

    @commands.command()
    @commands.has_permissions(administrator=True)
    async def raidmode(self, ctx: commands.Context, min_account_age_days: int = 7):
        """Emergency raid protection: locks all channels and kicks young accounts.

        Usage: !raidmode [days]
        Example: !raidmode 14  (kicks accounts under 14 days old)

        Run again to disable raid mode.
        """
        guild = ctx.guild

        # Check if raid mode is already active
        first_channel = None
        for channel in guild.text_channels:
            first_channel = channel
            break

        if not first_channel:
            await ctx.send("No text channels found.")
            return

        overwrite = first_channel.overwrites_for(guild.default_role)
        is_locked = overwrite.send_messages is False

        if is_locked:
            # Disable raid mode (unlock all channels)
            status_msg = await ctx.send("**Disabling Raid Mode...**")

            unlocked_count = 0
            for channel in guild.text_channels:
                try:
                    overwrite = channel.overwrites_for(guild.default_role)
                    overwrite.send_messages = None
                    await channel.set_permissions(guild.default_role, overwrite=overwrite)
                    unlocked_count += 1
                except:
                    pass

            await status_msg.edit(content=f"**Raid Mode Disabled** - {unlocked_count} channels unlocked.")
            await self._discord_log(f"{ctx.author} disabled raid mode", title="RAID MODE DISABLED", color=0x2ECC71)
            return

        # Enable raid mode
        status_msg = await ctx.send("**RAID MODE ACTIVATING...**")

        # Step 1: Lock all channels
        locked_count = 0
        for channel in guild.text_channels:
            try:
                overwrite = channel.overwrites_for(guild.default_role)
                overwrite.send_messages = False
                await channel.set_permissions(guild.default_role, overwrite=overwrite)
                locked_count += 1
            except:
                pass

        await status_msg.edit(
            content=f"**RAID MODE ACTIVE**\n\nLocked {locked_count} channels\nScanning for new accounts..."
        )

        # Step 2: Kick members with accounts younger than min_account_age_days
        from datetime import datetime
        now = datetime.utcnow()
        kicked_members = []
        protected_members = []

        for member in guild.members:
            if member.bot:
                continue
            if member.guild_permissions.manage_messages or member.guild_permissions.administrator:
                continue

            account_age_days = (now - member.created_at.replace(tzinfo=None)).days

            if account_age_days < min_account_age_days:
                try:
                    await member.kick(
                        reason=f"Raid Mode: Account under {min_account_age_days} days old ({account_age_days} days)"
                    )
                    kicked_members.append(f"{member.name} ({account_age_days}d old)")
                except:
                    protected_members.append(f"{member.name} (failed to kick)")

        # Final report
        embed = discord.Embed(
            title="RAID MODE ACTIVATED",
            description="Server is now in emergency lockdown mode.",
            color=0xE74C3C,
        )
        embed.add_field(name="Channels Locked", value=str(locked_count), inline=True)
        embed.add_field(name="Members Kicked", value=str(len(kicked_members)), inline=True)
        embed.add_field(name="Min Account Age", value=f"{min_account_age_days} days", inline=True)

        if kicked_members:
            kicked_list = "\n".join(kicked_members[:10])
            if len(kicked_members) > 10:
                kicked_list += f"\n...and {len(kicked_members) - 10} more"
            embed.add_field(name="Kicked Members", value=kicked_list, inline=False)

        if protected_members:
            embed.add_field(name="Failed to Kick", value="\n".join(protected_members[:5]), inline=False)

        embed.set_footer(text="Run !raidmode again to disable | Only staff can send messages")

        await status_msg.edit(content=None, embed=embed)

        await self._discord_log(
            f"{ctx.author} activated raid mode - Kicked {len(kicked_members)} members under {min_account_age_days} days old",
            title="RAID MODE ACTIVATED",
            color=0xE74C3C,
        )


async def setup(bot: commands.Bot):
    """Load the Moderation cog."""
    await bot.add_cog(Moderation(bot))
