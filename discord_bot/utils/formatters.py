"""
Formatting utilities for Discord bot output.
Provides consistent formatting for currency, time, and other data.
"""

from __future__ import annotations
from datetime import datetime, timedelta
from typing import Optional, Union


def format_currency(
    amount: Union[int, float],
    symbol: str = "$",
    show_sign: bool = False,
    compact: bool = False,
) -> str:
    """
    Format a currency amount for display.

    Args:
        amount: The amount to format
        symbol: Currency symbol (default: $)
        show_sign: Whether to show + for positive amounts
        compact: Use compact notation (1.5K, 2.3M, etc.)

    Returns:
        Formatted currency string
    """
    amount = int(amount)

    if compact and abs(amount) >= 1000:
        if abs(amount) >= 1_000_000_000:
            formatted = f"{amount / 1_000_000_000:.1f}B"
        elif abs(amount) >= 1_000_000:
            formatted = f"{amount / 1_000_000:.1f}M"
        elif abs(amount) >= 1000:
            formatted = f"{amount / 1000:.1f}K"
        else:
            formatted = f"{amount:,}"
    else:
        formatted = f"{abs(amount):,}"

    if amount < 0:
        return f"-{symbol}{formatted.lstrip('-')}"
    elif show_sign and amount > 0:
        return f"+{symbol}{formatted}"
    else:
        return f"{symbol}{formatted}"


def format_duration(
    seconds: Union[int, float],
    compact: bool = False,
    max_units: int = 2,
) -> str:
    """
    Format a duration in seconds to human-readable string.

    Args:
        seconds: Duration in seconds
        compact: Use compact format (1d 2h vs 1 day 2 hours)
        max_units: Maximum number of time units to show

    Returns:
        Formatted duration string
    """
    seconds = int(seconds)

    if seconds < 0:
        return "0s" if compact else "0 seconds"

    units = []

    days, seconds = divmod(seconds, 86400)
    hours, seconds = divmod(seconds, 3600)
    minutes, seconds = divmod(seconds, 60)

    if compact:
        if days > 0:
            units.append(f"{days}d")
        if hours > 0:
            units.append(f"{hours}h")
        if minutes > 0:
            units.append(f"{minutes}m")
        if seconds > 0 or not units:
            units.append(f"{seconds}s")
    else:
        if days > 0:
            units.append(f"{days} day{'s' if days != 1 else ''}")
        if hours > 0:
            units.append(f"{hours} hour{'s' if hours != 1 else ''}")
        if minutes > 0:
            units.append(f"{minutes} minute{'s' if minutes != 1 else ''}")
        if seconds > 0 or not units:
            units.append(f"{seconds} second{'s' if seconds != 1 else ''}")

    return " ".join(units[:max_units])


def format_timestamp(
    dt: Optional[datetime] = None,
    style: str = "f",
) -> str:
    """
    Format a datetime as a Discord timestamp.

    Args:
        dt: Datetime to format (default: now)
        style: Discord timestamp style:
            - t: Short time (16:20)
            - T: Long time (16:20:30)
            - d: Short date (20/04/2021)
            - D: Long date (20 April 2021)
            - f: Short date/time (20 April 2021 16:20)
            - F: Long date/time (Tuesday, 20 April 2021 16:20)
            - R: Relative (2 hours ago)

    Returns:
        Discord timestamp string
    """
    if dt is None:
        dt = datetime.now()

    timestamp = int(dt.timestamp())
    return f"<t:{timestamp}:{style}>"


def format_relative_time(dt: datetime) -> str:
    """
    Format a datetime as relative time (e.g., "2 hours ago").

    Args:
        dt: Datetime to format

    Returns:
        Relative time string
    """
    now = datetime.now()
    diff = now - dt

    if diff.total_seconds() < 0:
        # Future time
        diff = dt - now
        suffix = "from now"
    else:
        suffix = "ago"

    seconds = int(diff.total_seconds())

    if seconds < 60:
        return f"{seconds} second{'s' if seconds != 1 else ''} {suffix}"

    minutes = seconds // 60
    if minutes < 60:
        return f"{minutes} minute{'s' if minutes != 1 else ''} {suffix}"

    hours = minutes // 60
    if hours < 24:
        return f"{hours} hour{'s' if hours != 1 else ''} {suffix}"

    days = hours // 24
    if days < 30:
        return f"{days} day{'s' if days != 1 else ''} {suffix}"

    months = days // 30
    if months < 12:
        return f"{months} month{'s' if months != 1 else ''} {suffix}"

    years = months // 12
    return f"{years} year{'s' if years != 1 else ''} {suffix}"


def format_progress_bar(
    current: int,
    maximum: int,
    length: int = 10,
    filled: str = "█",
    empty: str = "░",
) -> str:
    """
    Create a text-based progress bar.

    Args:
        current: Current value
        maximum: Maximum value
        length: Length of the bar in characters
        filled: Character for filled portion
        empty: Character for empty portion

    Returns:
        Progress bar string
    """
    if maximum <= 0:
        percentage = 0
    else:
        percentage = min(100, max(0, (current / maximum) * 100))

    filled_length = int(length * percentage / 100)
    bar = filled * filled_length + empty * (length - filled_length)

    return f"{bar} {percentage:.1f}%"


def format_list(
    items: list,
    style: str = "bullet",
    max_items: int = 10,
) -> str:
    """
    Format a list of items for display.

    Args:
        items: List of items to format
        style: List style ("bullet", "numbered", "inline")
        max_items: Maximum items to show before truncating

    Returns:
        Formatted list string
    """
    if not items:
        return "*None*"

    truncated = len(items) > max_items
    display_items = items[:max_items]

    if style == "inline":
        result = ", ".join(str(item) for item in display_items)
        if truncated:
            result += f", ... (+{len(items) - max_items} more)"
        return result

    elif style == "numbered":
        lines = [f"{i+1}. {item}" for i, item in enumerate(display_items)]

    else:  # bullet
        lines = [f"• {item}" for item in display_items]

    if truncated:
        lines.append(f"*... and {len(items) - max_items} more*")

    return "\n".join(lines)


def truncate_text(
    text: str,
    max_length: int = 1024,
    suffix: str = "...",
) -> str:
    """
    Truncate text to a maximum length.

    Args:
        text: Text to truncate
        max_length: Maximum length including suffix
        suffix: Suffix to add when truncated

    Returns:
        Truncated text
    """
    if len(text) <= max_length:
        return text

    return text[:max_length - len(suffix)] + suffix


def format_table(
    headers: list[str],
    rows: list[list[str]],
    max_col_width: int = 20,
) -> str:
    """
    Format data as a simple text table.

    Args:
        headers: Column headers
        rows: List of rows (each row is a list of values)
        max_col_width: Maximum column width

    Returns:
        Formatted table string
    """
    # Truncate and pad columns
    def format_cell(value: str, width: int) -> str:
        value = str(value)
        if len(value) > width:
            return value[:width-2] + ".."
        return value.ljust(width)

    # Calculate column widths
    col_widths = []
    for i, header in enumerate(headers):
        max_width = min(max_col_width, len(header))
        for row in rows:
            if i < len(row):
                max_width = max(max_width, min(max_col_width, len(str(row[i]))))
        col_widths.append(max_width)

    # Build table
    lines = []

    # Header
    header_line = " | ".join(format_cell(h, col_widths[i]) for i, h in enumerate(headers))
    lines.append(header_line)

    # Separator
    separator = "-+-".join("-" * w for w in col_widths)
    lines.append(separator)

    # Rows
    for row in rows:
        row_line = " | ".join(
            format_cell(row[i] if i < len(row) else "", col_widths[i])
            for i in range(len(headers))
        )
        lines.append(row_line)

    return "```\n" + "\n".join(lines) + "\n```"
