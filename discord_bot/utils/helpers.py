"""
Shared helper functions for the ZeroX Discord bot.
"""
import re
import discord
from datetime import datetime
from typing import Optional
from .config import SENSITIVE_PATTERNS, SAFETY_SETTINGS


def clean_output(text: str) -> str:
    """Remove sensitive information from text before displaying."""
    if not text:
        return ""
    for pattern in SENSITIVE_PATTERNS:
        if pattern:
            text = re.sub(pattern, "proxy", text, flags=re.IGNORECASE)
    return text


def sanitize_username(username: str) -> str:
    """Sanitize a username for safe use in commands/storage."""
    if not username:
        return "user"
    # Remove special characters, keep alphanumeric and underscores
    sanitized = re.sub(r'[^a-zA-Z0-9_]', '', username)
    return sanitized[:32] if sanitized else "user"


def get_extra_body(model: str) -> Optional[dict]:
    """Get the appropriate extra_body for a model. Only Gemini needs safety_settings."""
    if "gemini" in model.lower():
        return {
            "use_search": True,
            "safety_settings": SAFETY_SETTINGS,
            "provider": {"allow_fallbacks": False, "require_parameters": True},
        }
    return None


def parse_duration(duration_str: str) -> Optional[int]:
    """Parse a duration string like '1h', '30m', '2d' into seconds."""
    if not duration_str:
        return None

    duration_str = duration_str.lower().strip()
    multipliers = {'s': 1, 'm': 60, 'h': 3600, 'd': 86400, 'w': 604800}

    match = re.match(r'^(\d+)([smhdw]?)$', duration_str)
    if not match:
        return None

    amount = int(match.group(1))
    unit = match.group(2) or 'm'  # Default to minutes

    return amount * multipliers.get(unit, 60)


def format_duration(seconds: int) -> str:
    """Format seconds into a human-readable duration string."""
    if seconds < 60:
        return f"{seconds}s"
    elif seconds < 3600:
        return f"{seconds // 60}m"
    elif seconds < 86400:
        return f"{seconds // 3600}h {(seconds % 3600) // 60}m"
    else:
        days = seconds // 86400
        hours = (seconds % 86400) // 3600
        return f"{days}d {hours}h"


def xp_for_level(level: int) -> int:
    """Calculate XP required for a given level."""
    return 100 * (level ** 2)


def level_from_xp(xp: int) -> int:
    """Calculate level from total XP."""
    level = 1
    while xp >= xp_for_level(level + 1):
        level += 1
    return level


def create_embed(
    title: str = None,
    description: str = None,
    color: int = 0x3498DB,
    fields: dict = None,
    footer: str = None,
    thumbnail: str = None,
    image: str = None,
    author: discord.Member = None
) -> discord.Embed:
    """Create a standardized embed."""
    embed = discord.Embed(
        title=title,
        description=description,
        color=color,
        timestamp=datetime.now()
    )

    if fields:
        for name, value in fields.items():
            inline = not isinstance(value, str) or len(value) < 50
            embed.add_field(name=name, value=str(value)[:1024], inline=inline)

    if footer:
        embed.set_footer(text=footer)

    if thumbnail:
        embed.set_thumbnail(url=thumbnail)

    if image:
        embed.set_image(url=image)

    if author:
        embed.set_author(name=author.display_name, icon_url=author.display_avatar.url)

    return embed


def truncate(text: str, max_length: int = 2000, suffix: str = "...") -> str:
    """Truncate text to a maximum length."""
    if len(text) <= max_length:
        return text
    return text[:max_length - len(suffix)] + suffix


async def safe_send(ctx, content: str = None, embed: discord.Embed = None, **kwargs):
    """Safely send a message, handling common errors."""
    try:
        if content and len(content) > 2000:
            content = truncate(content)
        return await ctx.send(content=content, embed=embed, **kwargs)
    except discord.Forbidden:
        pass  # Can't send to this channel
    except discord.HTTPException as e:
        print(f"Failed to send message: {e}")
    return None
