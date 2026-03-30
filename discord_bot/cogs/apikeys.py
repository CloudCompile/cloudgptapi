"""
API Keys cog for ZeroX Discord bot.
Handles API key generation, verification, and management.
"""

from __future__ import annotations
import json
import re
import subprocess
from datetime import datetime
from typing import Optional

import aiohttp
import discord
from discord.ext import commands
from discord import app_commands

from utils.database import get_db, record_audit_log
from utils.config import (
    APIKEY_ACCOUNT_AGE_DAYS,
    APIKEY_SERVER_DAYS,
    APIKEY_MIN_LEVEL,
    APIKEY_MIN_INVITES,
    APIKEY_DEFAULT_RPD,
    APIKEY_APPROVED_ROLE,
    PROXY_PATH,
    PROXY_URL,
    ADMIN_LOG_CHANNEL,
    LOG_CHANNEL_ID,
    DEV_ID,
    CF_ACCOUNT_ID,
    CF_KV_NAMESPACE_ID,
    CF_API_TOKEN,
)
from utils.helpers import sanitize_username, clean_output


class APIKeys(commands.Cog):
    """API key management commands."""

    def __init__(self, bot: commands.Bot):
        self.bot = bot

    async def cog_check(self, ctx: commands.Context) -> bool:
        """Ensure all commands in this cog are guild-only."""
        if ctx.guild is None:
            return False
        return True

    # ==================== Helper Functions ====================

    async def _get_user_level(self, user_id: int) -> int:
        """Get user's level from database."""
        db = get_db()
        result = await db.fetch_value(
            "SELECT level FROM levels WHERE user_id = ?",
            (str(user_id),),
            default=1,
        )
        return int(result) if result else 1

    async def _get_user_invite_count(self, user_id: int, guild_id: int) -> int:
        """Get user's verified invite count."""
        db = get_db()
        result = await db.fetch_value(
            "SELECT COUNT(*) FROM invites WHERE guild_id = ? AND inviter_id = ? AND verified = 1",
            (str(guild_id), str(user_id)),
            default=0,
        )
        return int(result) if result else 0

    async def _admin_log(self, message: str, title: str, color: int, fields: dict = None):
        """Log to admin channel."""
        channel_id = ADMIN_LOG_CHANNEL or LOG_CHANNEL_ID
        if not channel_id:
            return
        try:
            channel = self.bot.get_channel(int(channel_id))
            if channel:
                embed = discord.Embed(
                    title=title,
                    description=clean_output(str(message))[:4000],
                    color=color,
                    timestamp=datetime.now(),
                )
                if fields:
                    for name, value in fields.items():
                        embed.add_field(name=name, value=str(value)[:1024], inline=True)
                await channel.send(embed=embed)
        except Exception as e:
            print(f"Admin Log Error: {e}")

    async def _check_requirements(self, user: discord.Member, guild: discord.Guild) -> tuple[list, int, int]:
        """Check all API key requirements.
        Returns (errors list, user_level, user_invites)
        """
        errors = []
        now = datetime.now(user.created_at.tzinfo) if user.created_at.tzinfo else datetime.utcnow()

        # Account age check
        account_age = (now - user.created_at).days
        if account_age < APIKEY_ACCOUNT_AGE_DAYS:
            errors.append(f"Account must be {APIKEY_ACCOUNT_AGE_DAYS}+ days old (yours: {account_age} days)")

        # Server membership check
        if guild and user.joined_at:
            server_days = (now - user.joined_at).days
            if server_days < APIKEY_SERVER_DAYS:
                errors.append(f"Must be in server for {APIKEY_SERVER_DAYS}+ days (yours: {server_days} days)")

        # Level OR Invites check
        user_level = await self._get_user_level(user.id)
        user_invites = await self._get_user_invite_count(user.id, guild.id) if guild else 0

        if user_level < APIKEY_MIN_LEVEL and user_invites < APIKEY_MIN_INVITES:
            errors.append(
                f"Need Level {APIKEY_MIN_LEVEL}+ OR {APIKEY_MIN_INVITES}+ invites "
                f"(yours: Level {user_level}, {user_invites} invites)"
            )

        return errors, user_level, user_invites

    async def _create_api_key(self, username: str) -> Optional[str]:
        """Create API key via manage-users.js."""
        try:
            result = subprocess.run(
                ["node", "manage-users.js", "create", username, str(APIKEY_DEFAULT_RPD)],
                cwd=PROXY_PATH,
                capture_output=True,
                text=True,
                timeout=30,
            )
            output = result.stdout
            if "sk-aurapi-" in output:
                match = re.search(r"sk-aurapi-[A-Za-z0-9]+", output)
                if match:
                    return match.group(0)
        except Exception as e:
            print(f"API key creation error: {e}")
        return None

    # ==================== Regular Commands ====================

    @commands.command()
    @commands.cooldown(1, 60, commands.BucketType.user)
    async def getkey(self, ctx: commands.Context):
        """Get your ZeroX API key (with verification checks)."""
        user = ctx.author
        guild = ctx.guild

        # Check if user already has a key
        db = get_db()
        existing = await db.fetch_one(
            "SELECT api_key, disabled FROM api_keys WHERE discord_id = ?",
            (str(user.id),),
        )

        if existing:
            if existing[1]:
                await ctx.send("Your API key has been disabled. Contact an admin.", delete_after=15)
            else:
                await ctx.send("You already have an API key. Use `!mykey` to view it.", delete_after=15)
            try:
                await ctx.message.delete()
            except:
                pass
            return

        # Check requirements
        errors, user_level, user_invites = await self._check_requirements(user, guild)

        if errors:
            embed = discord.Embed(
                title="Verification Failed",
                description="You don't meet the requirements:\n\n" + "\n".join(f"- {e}" for e in errors),
                color=0xE74C3C,
            )
            embed.add_field(
                name="Requirements",
                value=f"- Account {APIKEY_ACCOUNT_AGE_DAYS}+ days old\n"
                      f"- In server {APIKEY_SERVER_DAYS}+ days\n"
                      f"- Level {APIKEY_MIN_LEVEL}+ OR {APIKEY_MIN_INVITES}+ invites",
                inline=False,
            )
            await ctx.send(embed=embed, delete_after=30)
            try:
                await ctx.message.delete()
            except:
                pass
            return

        # Check for approval role
        if APIKEY_APPROVED_ROLE:
            approved_role = guild.get_role(int(APIKEY_APPROVED_ROLE))
            if approved_role and approved_role not in user.roles:
                embed = discord.Embed(
                    title="Requirements Met!",
                    description="You meet all the requirements!\n\n**Please ping a dev to get approved.**",
                    color=0xF1C40F,
                )
                await ctx.send(embed=embed, delete_after=30)
                try:
                    await ctx.message.delete()
                except:
                    pass
                return

        # Create the key
        api_key = await self._create_api_key(sanitize_username(user.name))

        if not api_key:
            await ctx.send("Failed to create API key. Contact a dev.", delete_after=15)
            try:
                await ctx.message.delete()
            except:
                pass
            return

        # Save to database
        await db.execute(
            "INSERT INTO api_keys (discord_id, api_key, username, created_at, rpd) VALUES (?, ?, ?, ?, ?)",
            (str(user.id), api_key, sanitize_username(user.name), datetime.now().isoformat(), APIKEY_DEFAULT_RPD),
        )

        await record_audit_log(str(user.id), "KEY_CREATED", "self", "Via !getkey command")

        await ctx.send(
            "API key created! Use `/mykey` to view it privately.\nWait 30-60 seconds before using the key (activation time).",
            delete_after=30,
        )

        try:
            await ctx.message.delete()
        except:
            pass

    @commands.command()
    async def mykey(self, ctx: commands.Context):
        """View your API key - redirects to slash command."""
        await ctx.send("Use `/mykey` to view your key privately (only you can see it).", delete_after=15)
        try:
            await ctx.message.delete()
        except:
            pass

    @commands.command()
    @commands.cooldown(1, 30, commands.BucketType.user)
    async def keyprogress(self, ctx: commands.Context):
        """Check your progress towards getting an API key."""
        user = ctx.author
        guild = ctx.guild

        db = get_db()
        existing = await db.fetch_one(
            "SELECT api_key FROM api_keys WHERE discord_id = ?",
            (str(user.id),),
        )

        if existing:
            await ctx.send("You already have an API key! Use `/mykey` to view it.")
            return

        now = datetime.now(user.created_at.tzinfo) if user.created_at.tzinfo else datetime.utcnow()

        # Account age
        account_age = (now - user.created_at).days
        account_ok = account_age >= APIKEY_ACCOUNT_AGE_DAYS
        account_text = f"{'[x]' if account_ok else '[ ]'} Account Age: **{account_age}** / {APIKEY_ACCOUNT_AGE_DAYS} days"

        # Server days
        server_days = (now - user.joined_at).days if user.joined_at else 0
        server_ok = server_days >= APIKEY_SERVER_DAYS
        server_text = f"{'[x]' if server_ok else '[ ]'} Server Time: **{server_days}** / {APIKEY_SERVER_DAYS} days"

        # Level
        user_level = await self._get_user_level(user.id)
        level_ok = user_level >= APIKEY_MIN_LEVEL
        level_text = f"{'[x]' if level_ok else '[ ]'} Level: **{user_level}** / {APIKEY_MIN_LEVEL}"

        # Invites
        user_invites = await self._get_user_invite_count(user.id, guild.id) if guild else 0
        invites_ok = user_invites >= APIKEY_MIN_INVITES
        invites_text = f"{'[x]' if invites_ok else '[ ]'} Invites: **{user_invites}** / {APIKEY_MIN_INVITES}"

        activity_ok = level_ok or invites_ok
        eligible = account_ok and server_ok and activity_ok

        embed = discord.Embed(
            title="API Key Progress",
            color=0x2ECC71 if eligible else 0xE74C3C,
        )
        embed.description = f"{account_text}\n{server_text}\n\n**Activity (need one):**\n{level_text}\n{invites_text}"

        if eligible:
            embed.add_field(name="You're Eligible!", value="Use `/getkey` to get your API key!", inline=False)
        else:
            embed.add_field(name="Keep Going!", value="Keep chatting and inviting friends!", inline=False)

        await ctx.send(embed=embed)

    # ==================== Slash Commands ====================

    @app_commands.command(name="getkey", description="Get your personal API key")
    @app_commands.checks.cooldown(1, 60)
    @app_commands.guild_only()
    async def slash_getkey(self, interaction: discord.Interaction):
        """Get your API key (ephemeral message)."""
        try:
            await interaction.response.defer(ephemeral=True)
        except discord.errors.NotFound:
            return

        user = interaction.user
        guild = interaction.guild

        db = get_db()
        existing = await db.fetch_one(
            "SELECT api_key, disabled FROM api_keys WHERE discord_id = ?",
            (str(user.id),),
        )

        if existing:
            if existing[1]:
                await interaction.followup.send("Your API key has been disabled. Contact an admin.", ephemeral=True)
            else:
                await interaction.followup.send("You already have an API key. Use `/mykey` to view it.", ephemeral=True)
            return

        errors, user_level, user_invites = await self._check_requirements(user, guild)

        if errors:
            embed = discord.Embed(
                title="Verification Failed",
                description="You don't meet the requirements:\n\n" + "\n".join(f"- {e}" for e in errors),
                color=0xE74C3C,
            )
            await interaction.followup.send(embed=embed, ephemeral=True)
            return

        if APIKEY_APPROVED_ROLE:
            approved_role = guild.get_role(int(APIKEY_APPROVED_ROLE))
            if approved_role and approved_role not in user.roles:
                embed = discord.Embed(
                    title="Requirements Met!",
                    description="You meet all the requirements!\n\n**Please ping a dev to get approved.**",
                    color=0xF1C40F,
                )
                await interaction.followup.send(embed=embed, ephemeral=True)
                return

        api_key = await self._create_api_key(sanitize_username(user.name))

        if not api_key:
            await interaction.followup.send("Failed to create API key. Contact a dev.", ephemeral=True)
            return

        await db.execute(
            "INSERT INTO api_keys (discord_id, api_key, username, created_at, rpd) VALUES (?, ?, ?, ?, ?)",
            (str(user.id), api_key, sanitize_username(user.name), datetime.now().isoformat(), APIKEY_DEFAULT_RPD),
        )

        await record_audit_log(str(user.id), "KEY_CREATED", "self", "Via /getkey command")

        embed = discord.Embed(
            title="Your Personal API Key",
            description=f"**Only you can see this message!**\n\n`{api_key}`\n\n"
                        f"**Important:** Wait 30-60 seconds before using your key!",
            color=0x2ECC71,
        )
        embed.add_field(name="Base URL", value=f"`{PROXY_URL}/v1`", inline=False)
        embed.add_field(name="Daily Limit", value=f"{APIKEY_DEFAULT_RPD} requests/day", inline=True)
        embed.set_footer(text="Don't share this key! Use /mykey to view it again.")

        await interaction.followup.send(embed=embed, ephemeral=True)

        await self._admin_log(
            "New API key created via `/getkey`",
            title="API Key Created",
            color=0x2ECC71,
            fields={
                "User": f"{user.mention} ({user.name})",
                "User ID": str(user.id),
                "RPD": str(APIKEY_DEFAULT_RPD),
                "Key (last 8)": f"...{api_key[-8:]}",
            },
        )

    @app_commands.command(name="mykey", description="View your personal API key")
    @app_commands.checks.cooldown(1, 30)
    @app_commands.guild_only()
    async def slash_mykey(self, interaction: discord.Interaction):
        """View your API key (ephemeral message)."""
        try:
            await interaction.response.defer(ephemeral=True)
        except discord.errors.NotFound:
            return

        user = interaction.user
        db = get_db()
        row = await db.fetch_one(
            "SELECT api_key, created_at, disabled, rpd FROM api_keys WHERE discord_id = ?",
            (str(user.id),),
        )

        if not row:
            await interaction.followup.send("You don't have an API key. Use `/getkey` to get one.")
            return

        api_key, created_at, disabled, rpd = row
        rpd = rpd or APIKEY_DEFAULT_RPD

        if disabled:
            await interaction.followup.send("Your API key has been disabled. Contact an admin.")
            return

        embed = discord.Embed(
            title="Your Personal API Key",
            description=f"**Only you can see this message!**\n\n`{api_key}`",
            color=0x3498DB,
        )
        embed.add_field(name="Base URL", value=f"`{PROXY_URL}/v1/chat/completions`", inline=False)
        embed.add_field(name="Created", value=created_at.split("T")[0] if created_at else "Unknown", inline=True)
        embed.add_field(name="Daily Limit", value=f"{rpd} requests/day", inline=True)
        embed.set_footer(text="Don't share this key with anyone!")

        await interaction.followup.send(embed=embed)

    @app_commands.command(name="keyprogress", description="Check your progress towards getting an API key")
    @app_commands.checks.cooldown(1, 30)
    @app_commands.guild_only()
    async def slash_keyprogress(self, interaction: discord.Interaction):
        """Check your progress (ephemeral message)."""
        try:
            await interaction.response.defer(ephemeral=True)
        except discord.errors.NotFound:
            return

        user = interaction.user
        guild = interaction.guild

        db = get_db()
        existing = await db.fetch_one(
            "SELECT api_key FROM api_keys WHERE discord_id = ?",
            (str(user.id),),
        )

        if existing:
            await interaction.followup.send("You already have an API key! Use `/mykey` to view it.")
            return

        now = datetime.now(user.created_at.tzinfo) if user.created_at.tzinfo else datetime.utcnow()

        account_age = (now - user.created_at).days
        account_ok = account_age >= APIKEY_ACCOUNT_AGE_DAYS

        server_days = (now - user.joined_at).days if user.joined_at else 0
        server_ok = server_days >= APIKEY_SERVER_DAYS

        user_level = await self._get_user_level(user.id)
        level_ok = user_level >= APIKEY_MIN_LEVEL

        user_invites = await self._get_user_invite_count(user.id, guild.id) if guild else 0
        invites_ok = user_invites >= APIKEY_MIN_INVITES

        activity_ok = level_ok or invites_ok
        eligible = account_ok and server_ok and activity_ok

        embed = discord.Embed(title="API Key Progress", color=0x2ECC71 if eligible else 0xE74C3C)
        embed.description = (
            f"{'[x]' if account_ok else '[ ]'} Account Age: **{account_age}** / {APIKEY_ACCOUNT_AGE_DAYS} days\n"
            f"{'[x]' if server_ok else '[ ]'} Server Time: **{server_days}** / {APIKEY_SERVER_DAYS} days\n\n"
            f"**Activity (need one):**\n"
            f"{'[x]' if level_ok else '[ ]'} Level: **{user_level}** / {APIKEY_MIN_LEVEL}\n"
            f"{'[x]' if invites_ok else '[ ]'} Invites: **{user_invites}** / {APIKEY_MIN_INVITES}"
        )

        if eligible:
            embed.add_field(name="You're Eligible!", value="Use `/getkey` to get your API key!", inline=False)
        else:
            embed.add_field(name="Keep Going!", value="Keep chatting and inviting friends!", inline=False)

        await interaction.followup.send(embed=embed)

    # ==================== Admin Key Management (Dev Only) ====================

    @commands.command()
    async def keyadmintest(self, ctx: commands.Context):
        """Test if the apikeys cog is loaded and working."""
        await ctx.send(f"APIKeys cog is working! DEV_ID is {'set' if DEV_ID else 'NOT SET'}. Your ID: `{ctx.author.id}`")

    async def _get_kv_user(self, api_key: str) -> Optional[dict]:
        """Get user data from Cloudflare KV."""
        if not all([CF_ACCOUNT_ID, CF_KV_NAMESPACE_ID, CF_API_TOKEN]):
            return None

        url = f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/storage/kv/namespaces/{CF_KV_NAMESPACE_ID}/values/user:{api_key}"
        headers = {"Authorization": f"Bearer {CF_API_TOKEN}"}

        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as resp:
                if resp.status == 200:
                    text = await resp.text()
                    try:
                        return json.loads(text)
                    except json.JSONDecodeError:
                        return None
        return None

    async def _update_kv_user(self, api_key: str, user_data: dict) -> bool:
        """Update user data in Cloudflare KV."""
        if not all([CF_ACCOUNT_ID, CF_KV_NAMESPACE_ID, CF_API_TOKEN]):
            return False

        url = f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/storage/kv/namespaces/{CF_KV_NAMESPACE_ID}/values/user:{api_key}"
        headers = {
            "Authorization": f"Bearer {CF_API_TOKEN}",
            "Content-Type": "application/json",
        }

        async with aiohttp.ClientSession() as session:
            async with session.put(url, headers=headers, data=json.dumps(user_data)) as resp:
                return resp.status == 200

    @commands.command()
    async def keyadmin(self, ctx: commands.Context, member: discord.Member = None):
        """Grant admin access to a user's API key. Dev only. Usage: !keyadmin @user"""
        # Dev-only check
        if not DEV_ID or str(ctx.author.id) != str(DEV_ID):
            await ctx.send("This command is restricted to the bot developer.")
            return

        if member is None:
            await ctx.send("Usage: `!keyadmin @user`")
            return

        # Check if Cloudflare config is set
        if not all([CF_ACCOUNT_ID, CF_KV_NAMESPACE_ID, CF_API_TOKEN]):
            await ctx.send("Cloudflare KV is not configured. Set `CF_ACCOUNT_ID`, `CF_KV_NAMESPACE_ID`, and `CF_API_TOKEN` in your environment.")
            return

        # Get user's API key from local database
        db = get_db()
        row = await db.fetch_one(
            "SELECT api_key FROM api_keys WHERE discord_id = ?",
            (str(member.id),),
        )

        if not row:
            await ctx.send(f"{member.mention} doesn't have an API key.")
            return

        api_key = row[0]

        # Get current user data from KV
        user_data = await self._get_kv_user(api_key)

        if not user_data:
            await ctx.send(f"Could not find user data in KV for {member.mention}. The key may not be synced yet.")
            return

        # Check if already admin
        if user_data.get("admin"):
            await ctx.send(f"{member.mention} is already an admin.")
            return

        # Update with admin flag
        user_data["admin"] = True

        success = await self._update_kv_user(api_key, user_data)

        if success:
            await record_audit_log(str(member.id), "ADMIN_GRANTED", str(ctx.author.id), f"Admin access granted by {ctx.author}")

            embed = discord.Embed(
                title="Admin Access Granted",
                description=f"{member.mention} now has admin access to the API dashboard.",
                color=0x2ECC71,
            )
            embed.add_field(name="Granted By", value=ctx.author.mention, inline=True)
            embed.add_field(name="Dashboard URL", value=f"`{PROXY_URL}/admin`", inline=False)
            await ctx.send(embed=embed)

            await self._admin_log(
                f"Admin access granted to {member.display_name}",
                title="Admin Access Granted",
                color=0x2ECC71,
                fields={"User": member.mention, "User ID": str(member.id), "Granted By": ctx.author.mention},
            )
        else:
            await ctx.send("Failed to update KV. Check Cloudflare API token permissions.")

    @commands.command()
    async def keyunadmin(self, ctx: commands.Context, member: discord.Member = None):
        """Revoke admin access from a user's API key. Dev only. Usage: !keyunadmin @user"""
        # Dev-only check
        if not DEV_ID or str(ctx.author.id) != str(DEV_ID):
            await ctx.send("This command is restricted to the bot developer.")
            return

        if member is None:
            await ctx.send("Usage: `!keyunadmin @user`")
            return

        if not all([CF_ACCOUNT_ID, CF_KV_NAMESPACE_ID, CF_API_TOKEN]):
            await ctx.send("Cloudflare KV is not configured.")
            return

        db = get_db()
        row = await db.fetch_one(
            "SELECT api_key FROM api_keys WHERE discord_id = ?",
            (str(member.id),),
        )

        if not row:
            await ctx.send(f"{member.mention} doesn't have an API key.")
            return

        api_key = row[0]
        user_data = await self._get_kv_user(api_key)

        if not user_data:
            await ctx.send(f"Could not find user data in KV for {member.mention}.")
            return

        if not user_data.get("admin"):
            await ctx.send(f"{member.mention} is not an admin.")
            return

        user_data["admin"] = False

        success = await self._update_kv_user(api_key, user_data)

        if success:
            await record_audit_log(str(member.id), "ADMIN_REVOKED", str(ctx.author.id), f"Admin access revoked by {ctx.author}")

            embed = discord.Embed(
                title="Admin Access Revoked",
                description=f"{member.mention} no longer has admin access.",
                color=0xE74C3C,
            )
            await ctx.send(embed=embed)
        else:
            await ctx.send("Failed to update KV.")

    @commands.command()
    async def keydonor(self, ctx: commands.Context, member: discord.Member = None):
        """Grant donor status to a user's API key. Dev only. Usage: !keydonor @user"""
        if not DEV_ID or str(ctx.author.id) != str(DEV_ID):
            await ctx.send("This command is restricted to the bot developer.")
            return

        if member is None:
            await ctx.send("Usage: `!keydonor @user`")
            return

        if not all([CF_ACCOUNT_ID, CF_KV_NAMESPACE_ID, CF_API_TOKEN]):
            await ctx.send("Cloudflare KV is not configured.")
            return

        db = get_db()
        row = await db.fetch_one(
            "SELECT api_key FROM api_keys WHERE discord_id = ?",
            (str(member.id),),
        )

        if not row:
            await ctx.send(f"{member.mention} doesn't have an API key.")
            return

        api_key = row[0]
        user_data = await self._get_kv_user(api_key)

        if not user_data:
            await ctx.send(f"Could not find user data in KV for {member.mention}.")
            return

        if user_data.get("donor"):
            await ctx.send(f"{member.mention} already has donor status.")
            return

        user_data["donor"] = True

        success = await self._update_kv_user(api_key, user_data)

        if success:
            await record_audit_log(str(member.id), "DONOR_GRANTED", str(ctx.author.id), f"Donor status granted by {ctx.author}")

            embed = discord.Embed(
                title="Donor Status Granted",
                description=f"{member.mention} now has donor status (priority API access).",
                color=0xF1C40F,
            )
            await ctx.send(embed=embed)
        else:
            await ctx.send("Failed to update KV.")


async def setup(bot: commands.Bot):
    """Load the APIKeys cog."""
    await bot.add_cog(APIKeys(bot))
