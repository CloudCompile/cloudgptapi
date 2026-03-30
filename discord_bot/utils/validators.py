"""
Input validation utilities for Discord bot commands.
Provides type-safe validation and sanitization functions.
"""

from __future__ import annotations
import re
from typing import Optional, Tuple, Union
import discord


# Constants
MIN_BET = 10
MAX_BET = 1_000_000
DEBT_LIMIT = -12_000
API_KEY_PATTERN = re.compile(r'^sk-aurapi-[a-zA-Z0-9]{32}$')
DANGEROUS_PATTERNS = [
    re.compile(r'<script[^>]*>.*?</script>', re.IGNORECASE | re.DOTALL),
    re.compile(r'javascript:', re.IGNORECASE),
    re.compile(r'on\w+\s*=', re.IGNORECASE),  # onclick, onerror, etc.
]


class ValidationError(Exception):
    """Raised when validation fails."""
    def __init__(self, message: str, user_message: Optional[str] = None):
        self.message = message
        self.user_message = user_message or message
        super().__init__(self.message)


def validate_bet(
    bet: Union[int, str, None],
    balance: int,
    min_bet: int = MIN_BET,
    max_bet: int = MAX_BET,
    debt_limit: int = DEBT_LIMIT,
) -> Tuple[bool, int, str]:
    """
    Validate a bet amount against user balance and limits.

    Args:
        bet: The bet amount (can be int, string, or None)
        balance: User's current balance
        min_bet: Minimum allowed bet
        max_bet: Maximum allowed bet
        debt_limit: Maximum allowed debt

    Returns:
        Tuple of (is_valid, validated_bet, error_message)
        If valid, error_message will be empty string
    """
    if bet is None:
        return False, 0, f"Please specify a bet amount (minimum ${min_bet:,})"

    # Convert string to int if needed
    if isinstance(bet, str):
        # Handle "all" or "max" keywords
        if bet.lower() in ('all', 'max', 'allin'):
            if balance <= 0:
                return False, 0, "You don't have any money to bet!"
            bet = min(balance, max_bet)
        else:
            try:
                # Remove commas and dollar signs
                cleaned = bet.replace(',', '').replace('$', '').strip()
                bet = int(cleaned)
            except ValueError:
                return False, 0, f"Invalid bet amount: `{bet}`"

    if bet < min_bet:
        return False, 0, f"Minimum bet is ${min_bet:,}!"

    if bet > max_bet:
        return False, 0, f"Maximum bet is ${max_bet:,}!"

    # Check if bet would exceed debt limit
    balance_after = balance - bet
    if balance_after < debt_limit:
        if balance < 0:
            return False, 0, (
                f"The casino won't extend more credit!\n\n"
                f"You're already **${abs(balance):,}** in debt. "
                f"Max gambling debt is **${abs(debt_limit):,}**.\n\n"
                f"Use `!work` or `!daily` to earn dollars and pay off your debt."
            )
        else:
            max_allowed = balance - debt_limit
            return False, 0, (
                f"That bet is too risky! You have **${balance:,}**.\n\n"
                f"Max bet allowed: **${max_allowed:,}** (casino debt limit: ${abs(debt_limit):,})"
            )

    return True, bet, ""


def validate_member_target(
    member: Optional[discord.Member],
    author: discord.Member,
    action: str = "target",
    allow_self: bool = False,
    allow_bots: bool = False,
) -> Tuple[bool, str]:
    """
    Validate a member target for commands like rob, gift, etc.

    Args:
        member: The target member (can be None)
        author: The command author
        action: Action name for error messages (e.g., "rob", "gift to")
        allow_self: Whether to allow targeting self
        allow_bots: Whether to allow targeting bots

    Returns:
        Tuple of (is_valid, error_message)
    """
    if member is None:
        return False, f"Please mention a user to {action}!"

    if not allow_self and member.id == author.id:
        return False, f"You can't {action} yourself!"

    if not allow_bots and member.bot:
        return False, f"You can't {action} bots!"

    return True, ""


def sanitize_input(
    text: str,
    max_length: int = 2000,
    strip_mentions: bool = False,
    strip_dangerous: bool = True,
) -> str:
    """
    Sanitize user input for safe processing.

    Args:
        text: Input text to sanitize
        max_length: Maximum allowed length
        strip_mentions: Whether to strip @mentions
        strip_dangerous: Whether to strip potentially dangerous patterns

    Returns:
        Sanitized text
    """
    if not text:
        return ""

    result = text.strip()

    # Strip dangerous patterns (XSS prevention)
    if strip_dangerous:
        for pattern in DANGEROUS_PATTERNS:
            result = pattern.sub('', result)

    # Strip mentions if requested
    if strip_mentions:
        result = re.sub(r'<@!?\d+>', '[mention]', result)
        result = re.sub(r'<@&\d+>', '[role]', result)
        result = re.sub(r'@everyone', '[everyone]', result)
        result = re.sub(r'@here', '[here]', result)

    # Truncate to max length
    if len(result) > max_length:
        result = result[:max_length - 3] + "..."

    return result


def validate_api_key_format(key: str) -> Tuple[bool, str]:
    """
    Validate API key format.

    Args:
        key: API key to validate

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not key:
        return False, "API key cannot be empty"

    if not API_KEY_PATTERN.match(key):
        return False, "Invalid API key format. Expected: sk-aurapi-XXXXXXXX..."

    return True, ""


def validate_positive_int(
    value: Union[int, str, None],
    name: str = "value",
    min_value: int = 1,
    max_value: Optional[int] = None,
) -> Tuple[bool, int, str]:
    """
    Validate that a value is a positive integer within bounds.

    Args:
        value: Value to validate
        name: Name for error messages
        min_value: Minimum allowed value
        max_value: Maximum allowed value (None for no limit)

    Returns:
        Tuple of (is_valid, validated_value, error_message)
    """
    if value is None:
        return False, 0, f"{name} is required"

    try:
        if isinstance(value, str):
            value = int(value.replace(',', '').strip())
        int_value = int(value)
    except (ValueError, TypeError):
        return False, 0, f"{name} must be a number"

    if int_value < min_value:
        return False, 0, f"{name} must be at least {min_value}"

    if max_value is not None and int_value > max_value:
        return False, 0, f"{name} cannot exceed {max_value}"

    return True, int_value, ""


def validate_discord_id(
    id_str: str,
    name: str = "ID",
) -> Tuple[bool, int, str]:
    """
    Validate a Discord snowflake ID.

    Args:
        id_str: ID string to validate
        name: Name for error messages

    Returns:
        Tuple of (is_valid, validated_id, error_message)
    """
    if not id_str:
        return False, 0, f"{name} is required"

    # Strip common prefixes
    cleaned = id_str.strip().lstrip('<@!&').rstrip('>')

    try:
        id_int = int(cleaned)
    except ValueError:
        return False, 0, f"Invalid {name} format"

    # Discord snowflakes are 17-19 digits
    if len(str(id_int)) < 17 or len(str(id_int)) > 19:
        return False, 0, f"Invalid {name}: must be a valid Discord ID"

    return True, id_int, ""
