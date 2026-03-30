"""
Cooldown management utilities for Discord bot commands.
Provides decorators and helpers for handling command cooldowns with database persistence.
"""

from __future__ import annotations
import functools
from datetime import datetime, timedelta
from typing import Optional, Callable, Any, TYPE_CHECKING
import discord
from discord.ext import commands

if TYPE_CHECKING:
    from aiosqlite import Connection


class CooldownManager:
    """Manages command cooldowns with database persistence and streak tracking."""

    def __init__(self, db_pool):
        self.db_pool = db_pool
        self._cache: dict[str, tuple[datetime, int]] = {}  # (user_id, command) -> (last_used, streak)

    async def check_cooldown(
        self,
        user_id: str,
        command: str,
        cooldown_seconds: int,
        use_streak: bool = False,
    ) -> tuple[bool, int, int]:
        """
        Check if user is on cooldown for a command.

        Args:
            user_id: Discord user ID
            command: Command name
            cooldown_seconds: Cooldown duration in seconds
            use_streak: Whether to track streaks

        Returns:
            Tuple of (is_available, seconds_remaining, current_streak)
        """
        now = datetime.now()
        cache_key = f"{user_id}:{command}"

        # Check cache first
        if cache_key in self._cache:
            last_used, streak = self._cache[cache_key]
            time_diff = (now - last_used).total_seconds()
            if time_diff < cooldown_seconds:
                return False, int(cooldown_seconds - time_diff), streak

        # Check database
        async with self.db_pool.acquire() as db:
            async with db.execute(
                "SELECT last_used, streak FROM economy_cooldowns WHERE user_id = ? AND command = ?",
                (user_id, command),
            ) as cursor:
                row = await cursor.fetchone()

        if row and row[0]:
            last_used = datetime.fromisoformat(row[0])
            streak = row[1] if row[1] else 0
            time_diff = (now - last_used).total_seconds()

            # Update cache
            self._cache[cache_key] = (last_used, streak)

            if time_diff < cooldown_seconds:
                return False, int(cooldown_seconds - time_diff), streak

            # Check if streak continues (within grace period for weekly)
            if use_streak and time_diff < cooldown_seconds * 1.15:  # 15% grace period
                streak += 1
            elif use_streak:
                streak = 1

            return True, 0, streak

        return True, 0, 1 if use_streak else 0

    async def set_cooldown(
        self,
        user_id: str,
        command: str,
        streak: int = 0,
    ) -> None:
        """Record that a user used a command (starts cooldown)."""
        now = datetime.now()
        cache_key = f"{user_id}:{command}"

        # Update cache
        self._cache[cache_key] = (now, streak)

        # Update database
        async with self.db_pool.acquire() as db:
            await db.execute(
                """INSERT INTO economy_cooldowns (user_id, command, last_used, streak)
                   VALUES (?, ?, ?, ?)
                   ON CONFLICT(user_id, command) DO UPDATE SET last_used = ?, streak = ?""",
                (user_id, command, now.isoformat(), streak, now.isoformat(), streak),
            )
            await db.commit()

    def format_remaining(self, seconds: int) -> str:
        """Format remaining cooldown time as human-readable string."""
        if seconds >= 86400:
            days = seconds // 86400
            hours = (seconds % 86400) // 3600
            return f"**{days}d {hours}h**"
        elif seconds >= 3600:
            hours = seconds // 3600
            minutes = (seconds % 3600) // 60
            return f"**{hours}h {minutes}m**"
        elif seconds >= 60:
            minutes = seconds // 60
            secs = seconds % 60
            return f"**{minutes}m {secs}s**"
        else:
            return f"**{seconds}s**"


def cooldown(
    seconds: int,
    command_name: Optional[str] = None,
    use_streak: bool = False,
    cooldown_message: str = "You're on cooldown! Try again in {remaining}.",
):
    """
    Decorator for adding cooldown to bot commands with database persistence.

    Args:
        seconds: Cooldown duration in seconds
        command_name: Override command name for cooldown tracking
        use_streak: Whether to track and return streak count
        cooldown_message: Message to send when on cooldown (use {remaining} placeholder)

    Example:
        @bot.command()
        @cooldown(900, cooldown_message="You're tired! Rest for {remaining}.")
        async def work(ctx):
            # ctx.cooldown_streak available if use_streak=True
            ...
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def wrapper(ctx_or_self, *args, **kwargs):
            # Handle both cog methods and standalone commands
            if hasattr(ctx_or_self, 'bot'):
                # It's a cog, first arg is ctx
                ctx = args[0] if args else kwargs.get('ctx')
                cog = ctx_or_self
            else:
                # Standalone command
                ctx = ctx_or_self
                cog = None

            # Get cooldown manager from bot
            bot = ctx.bot
            if not hasattr(bot, 'cooldown_manager'):
                # Fallback: create temporary manager if not set up
                from . import DatabasePool
                bot.cooldown_manager = CooldownManager(bot.db_pool if hasattr(bot, 'db_pool') else None)

            cmd_name = command_name or func.__name__
            user_id = str(ctx.author.id)

            available, remaining, streak = await bot.cooldown_manager.check_cooldown(
                user_id, cmd_name, seconds, use_streak
            )

            if not available:
                formatted_remaining = bot.cooldown_manager.format_remaining(remaining)
                await ctx.send(cooldown_message.format(remaining=formatted_remaining))
                return

            # Store streak for access in command if needed
            ctx.cooldown_streak = streak

            try:
                if cog:
                    result = await func(cog, ctx, *args[1:], **kwargs)
                else:
                    result = await func(ctx, *args, **kwargs)

                # Record cooldown after successful execution
                await bot.cooldown_manager.set_cooldown(user_id, cmd_name, streak)
                return result
            except Exception:
                # Don't record cooldown if command failed
                raise

        return wrapper
    return decorator


# Preset cooldowns for common durations
def work_cooldown(func):
    """15 minute cooldown for work commands."""
    return cooldown(
        900,
        cooldown_message="You're tired! Rest for {remaining} before working again."
    )(func)


def rob_cooldown(func):
    """15 minute cooldown for robbery commands."""
    return cooldown(
        900,
        cooldown_message="The cops are watching! Wait {remaining} before trying again."
    )(func)


def crime_cooldown(func):
    """30 minute cooldown for crime commands."""
    return cooldown(
        1800,
        cooldown_message="The heat is on! Wait {remaining} before committing another crime."
    )(func)


def beg_cooldown(func):
    """1 minute cooldown for beg command."""
    return cooldown(
        60,
        cooldown_message="Wait {remaining} before begging again."
    )(func)


def weekly_cooldown(func):
    """7 day cooldown with streak tracking for weekly rewards."""
    return cooldown(
        604800,
        use_streak=True,
        cooldown_message="You already claimed your weekly! Come back in {remaining}."
    )(func)


def daily_cooldown(func):
    """24 hour cooldown with streak tracking for daily rewards."""
    return cooldown(
        86400,
        use_streak=True,
        cooldown_message="You already claimed your daily! Come back in {remaining}."
    )(func)
