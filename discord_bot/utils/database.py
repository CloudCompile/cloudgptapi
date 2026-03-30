"""
Database utilities for ZeroX Discord bot.
Provides connection pooling, caching layer, and common database operations.
"""

from __future__ import annotations
import asyncio
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Optional, Any, TYPE_CHECKING
import aiosqlite

from .cache import user_cache, cached

if TYPE_CHECKING:
    from aiosqlite import Connection


class DatabasePool:
    """
    Async connection pool for SQLite database.
    Provides connection reuse and WAL mode for better concurrency.
    """

    def __init__(self, db_path: str, pool_size: int = 10):
        self.db_path = db_path
        self.pool_size = pool_size
        self._pool: asyncio.Queue[Connection] = asyncio.Queue(maxsize=pool_size)
        self._initialized = False
        self._lock = asyncio.Lock()

    async def init(self) -> None:
        """Initialize the connection pool."""
        async with self._lock:
            if self._initialized:
                return

            # Set WAL mode with first connection only
            first_conn = await aiosqlite.connect(self.db_path, timeout=30.0)
            await first_conn.execute("PRAGMA journal_mode=WAL")
            await first_conn.execute("PRAGMA busy_timeout=30000")
            await first_conn.execute("PRAGMA synchronous=NORMAL")
            await first_conn.execute("PRAGMA cache_size=-64000")  # 64MB cache
            await first_conn.commit()
            await self._pool.put(first_conn)

            # Create remaining connections
            for _ in range(self.pool_size - 1):
                conn = await aiosqlite.connect(self.db_path, timeout=30.0)
                await conn.execute("PRAGMA busy_timeout=30000")
                await self._pool.put(conn)

            self._initialized = True

            # Start cache cleanup task
            user_cache.start_cleanup_task()

    @asynccontextmanager
    async def acquire(self):
        """Acquire a connection from the pool."""
        if not self._initialized:
            await self.init()

        conn = await self._pool.get()
        try:
            yield conn
        finally:
            await self._pool.put(conn)

    async def close(self) -> None:
        """Close all connections in the pool."""
        await user_cache.stop_cleanup_task()
        while not self._pool.empty():
            conn = await self._pool.get()
            await conn.close()
        self._initialized = False

    async def execute(
        self,
        query: str,
        params: tuple = (),
        commit: bool = True,
    ) -> Optional[int]:
        """
        Execute a query and optionally commit.

        Args:
            query: SQL query to execute
            params: Query parameters
            commit: Whether to commit after execution

        Returns:
            Last row ID for INSERT, None otherwise
        """
        async with self.acquire() as conn:
            cursor = await conn.execute(query, params)
            if commit:
                await conn.commit()
            return cursor.lastrowid if cursor.lastrowid else None

    async def fetch_one(
        self,
        query: str,
        params: tuple = (),
    ) -> Optional[tuple]:
        """Fetch a single row."""
        async with self.acquire() as conn:
            async with conn.execute(query, params) as cursor:
                return await cursor.fetchone()

    async def fetch_all(
        self,
        query: str,
        params: tuple = (),
    ) -> list[tuple]:
        """Fetch all rows."""
        async with self.acquire() as conn:
            async with conn.execute(query, params) as cursor:
                return await cursor.fetchall()

    async def fetch_value(
        self,
        query: str,
        params: tuple = (),
        default: Any = None,
    ) -> Any:
        """Fetch a single value (first column of first row)."""
        row = await self.fetch_one(query, params)
        return row[0] if row else default


# Global database pool instance (set during bot setup)
_db_pool: Optional[DatabasePool] = None


def set_db_pool(pool: DatabasePool) -> None:
    """Set the global database pool."""
    global _db_pool
    _db_pool = pool


def get_db() -> DatabasePool:
    """Get the global database pool."""
    if _db_pool is None:
        raise RuntimeError("Database pool not initialized. Call set_db_pool() first.")
    return _db_pool


# ==================== CACHED USER BALANCE OPERATIONS ====================

async def get_user_balance(user_id: str) -> int:
    """
    Get user's coin balance with caching.
    Cache TTL: 60 seconds
    """
    # Check cache first
    cached_balance = await user_cache.get_balance(user_id)
    if cached_balance is not None:
        return cached_balance

    # Fetch from database
    db = get_db()
    result = await db.fetch_value(
        "SELECT coins FROM levels WHERE user_id = ?",
        (user_id,),
        default=100,
    )
    balance = int(result) if result else 100

    # Update cache
    await user_cache.set_balance(user_id, balance)

    return balance


async def update_user_balance(user_id: str, amount: int) -> int:
    """
    Update user's balance by adding/subtracting amount.
    Invalidates cache after update.
    Returns new balance.
    """
    db = get_db()

    # Ensure user exists
    await db.execute(
        "INSERT OR IGNORE INTO levels (user_id, coins) VALUES (?, 100)",
        (user_id,),
    )

    # Update balance
    await db.execute(
        "UPDATE levels SET coins = coins + ? WHERE user_id = ?",
        (amount, user_id),
    )

    # Invalidate cache
    await user_cache.invalidate_balance(user_id)

    # Fetch and cache new balance
    return await get_user_balance(user_id)


async def set_user_balance(user_id: str, balance: int) -> None:
    """
    Set user's balance to a specific value.
    Invalidates cache after update.
    """
    db = get_db()

    await db.execute(
        "INSERT INTO levels (user_id, coins) VALUES (?, ?) "
        "ON CONFLICT(user_id) DO UPDATE SET coins = ?",
        (user_id, balance, balance),
    )

    # Invalidate and update cache
    await user_cache.set_balance(user_id, balance)


# ==================== CACHED LEVEL OPERATIONS ====================

async def get_user_level(user_id: str) -> dict:
    """
    Get user's level info with caching.
    Returns dict with level, xp, total_messages.
    Cache TTL: 120 seconds
    """
    # Check cache first
    cached_data = await user_cache.get_level_data(user_id)
    if cached_data is not None:
        return cached_data

    # Fetch from database
    db = get_db()
    row = await db.fetch_one(
        "SELECT level, xp, total_messages FROM levels WHERE user_id = ?",
        (user_id,),
    )

    if row:
        data = {
            "level": int(row[0]),
            "xp": int(row[1]),
            "total_messages": int(row[2])
        }
    else:
        data = {"level": 1, "xp": 0, "total_messages": 0}

    # Update cache
    await user_cache.set_level_data(user_id, data)

    return data


async def add_user_xp(
    user_id: str,
    xp_amount: int,
    xp_per_level: int = 100,
) -> tuple[int, int, bool]:
    """
    Add XP to user with level-up calculation.
    Invalidates level cache after update.
    Returns (new_level, new_xp, did_level_up).
    """
    db = get_db()

    # Ensure user exists
    await db.execute(
        "INSERT OR IGNORE INTO levels (user_id, xp, level, total_messages) VALUES (?, 0, 1, 0)",
        (user_id,),
    )

    # Get current stats
    row = await db.fetch_one(
        "SELECT level, xp FROM levels WHERE user_id = ?",
        (user_id,),
    )
    current_level = int(row[0]) if row else 1
    current_xp = int(row[1]) if row else 0

    # Add XP
    new_xp = current_xp + xp_amount
    new_level = current_level

    # Check for level up
    xp_needed = new_level * xp_per_level
    leveled_up = False

    while new_xp >= xp_needed:
        new_xp -= xp_needed
        new_level += 1
        xp_needed = new_level * xp_per_level
        leveled_up = True

    # Update database
    await db.execute(
        "UPDATE levels SET xp = ?, level = ?, total_messages = total_messages + 1 WHERE user_id = ?",
        (new_xp, new_level, user_id),
    )

    # Invalidate cache
    await user_cache.invalidate_level(user_id)

    return new_level, new_xp, leveled_up


# ==================== CACHED API KEY OPERATIONS ====================

async def get_api_key_data(user_id: str) -> Optional[dict]:
    """
    Get user's API key data with caching.
    Returns dict with api_key, disabled, rpd, created_at or None.
    Cache TTL: 300 seconds
    """
    # Check cache first
    cached_data = await user_cache.get_api_key_data(user_id)
    if cached_data is not None:
        return cached_data

    # Fetch from database
    db = get_db()
    row = await db.fetch_one(
        "SELECT api_key, disabled, rpd, created_at, username FROM api_keys WHERE discord_id = ?",
        (user_id,),
    )

    if row:
        data = {
            "api_key": row[0],
            "disabled": bool(row[1]),
            "rpd": int(row[2]) if row[2] else 100,
            "created_at": row[3],
            "username": row[4]
        }
        # Update cache
        await user_cache.set_api_key_data(user_id, data)
        return data

    return None


async def create_api_key(
    user_id: str,
    api_key: str,
    username: str,
    rpd: int = 100
) -> None:
    """Create a new API key for user. Invalidates cache."""
    db = get_db()

    await db.execute(
        "INSERT INTO api_keys (discord_id, api_key, username, created_at, rpd) VALUES (?, ?, ?, ?, ?)",
        (user_id, api_key, username, datetime.now().isoformat(), rpd),
    )

    # Invalidate cache
    await user_cache.invalidate_api_key(user_id)


async def update_api_key_status(user_id: str, disabled: bool) -> None:
    """Enable or disable an API key. Invalidates cache."""
    db = get_db()

    await db.execute(
        "UPDATE api_keys SET disabled = ? WHERE discord_id = ?",
        (1 if disabled else 0, user_id),
    )

    # Invalidate cache
    await user_cache.invalidate_api_key(user_id)


async def update_api_key_rpd(user_id: str, rpd: int) -> None:
    """Update API key rate limit. Invalidates cache."""
    db = get_db()

    await db.execute(
        "UPDATE api_keys SET rpd = ? WHERE discord_id = ?",
        (rpd, user_id),
    )

    # Invalidate cache
    await user_cache.invalidate_api_key(user_id)


async def delete_api_key(user_id: str) -> bool:
    """Delete an API key. Invalidates cache. Returns True if key existed."""
    db = get_db()

    # Check if exists
    existing = await get_api_key_data(user_id)
    if not existing:
        return False

    await db.execute(
        "DELETE FROM api_keys WHERE discord_id = ?",
        (user_id,),
    )

    # Invalidate cache
    await user_cache.invalidate_api_key(user_id)

    return True


# ==================== AUDIT LOGGING ====================

async def record_audit_log(
    user_id: str,
    action: str,
    performed_by: str,
    details: Optional[str] = None,
) -> None:
    """Record an audit log entry (not cached)."""
    db = get_db()
    await db.execute(
        """INSERT INTO api_key_audit
           (discord_id, action, performed_by, details, timestamp)
           VALUES (?, ?, ?, ?, ?)""",
        (user_id, action, performed_by, details, datetime.now().isoformat()),
    )


# ==================== COOLDOWN OPERATIONS ====================

async def get_cooldown(user_id: str, command: str) -> Optional[datetime]:
    """
    Get cooldown timestamp for a command with caching.
    Returns datetime of last use or None.
    """
    # Check cache first
    cached_cd = await user_cache.get_cooldown(user_id, command)
    if cached_cd is not None:
        return cached_cd

    # Fetch from database
    db = get_db()
    row = await db.fetch_one(
        "SELECT last_used FROM economy_cooldowns WHERE user_id = ? AND command = ?",
        (user_id, command),
    )

    if row and row[0]:
        last_used = datetime.fromisoformat(row[0])
        # Don't cache old cooldowns
        return last_used

    return None


async def set_cooldown(user_id: str, command: str, streak: int = 0) -> None:
    """Set cooldown for a command. Updates cache."""
    db = get_db()
    now = datetime.now()

    await db.execute(
        """INSERT INTO economy_cooldowns (user_id, command, last_used, streak)
           VALUES (?, ?, ?, ?)
           ON CONFLICT(user_id, command) DO UPDATE SET last_used = ?, streak = ?""",
        (user_id, command, now.isoformat(), streak, now.isoformat(), streak),
    )

    # Update cache with estimated expiry (1 hour max cache)
    await user_cache.set_cooldown(user_id, command, now)


# ==================== CACHE STATISTICS ====================

def get_cache_stats() -> dict:
    """Get cache statistics for monitoring."""
    return user_cache.get_all_stats()


async def clear_user_cache(user_id: str) -> None:
    """Clear all cached data for a specific user."""
    await user_cache.invalidate_user(user_id)


async def clear_all_caches() -> dict:
    """Clear all caches. Returns count of items cleared per cache."""
    results = {}
    for cache_name in ['balances', 'levels', 'api_keys', 'cooldowns', 'user_info']:
        cache = getattr(user_cache, cache_name)
        count = await cache.clear()
        results[cache_name] = count
    return results
