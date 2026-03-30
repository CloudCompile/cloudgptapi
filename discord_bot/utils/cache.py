"""
In-memory caching system for Discord bot.
Provides TTL-based caching to reduce database hits for frequently accessed data.
"""

from __future__ import annotations
import asyncio
from datetime import datetime, timedelta
from typing import Optional, Any, Callable, TypeVar, Generic
from collections import OrderedDict
import functools

T = TypeVar('T')


class CacheEntry(Generic[T]):
    """A single cache entry with expiration tracking."""

    __slots__ = ('value', 'expires_at', 'created_at')

    def __init__(self, value: T, ttl_seconds: int):
        self.value = value
        self.created_at = datetime.now()
        self.expires_at = self.created_at + timedelta(seconds=ttl_seconds)

    @property
    def is_expired(self) -> bool:
        return datetime.now() >= self.expires_at

    @property
    def age_seconds(self) -> float:
        return (datetime.now() - self.created_at).total_seconds()


class LRUCache(Generic[T]):
    """
    Least Recently Used (LRU) cache with TTL support.
    Thread-safe for async operations.
    """

    def __init__(
        self,
        max_size: int = 1000,
        default_ttl: int = 300,  # 5 minutes
        name: str = "cache"
    ):
        self.max_size = max_size
        self.default_ttl = default_ttl
        self.name = name
        self._cache: OrderedDict[str, CacheEntry[T]] = OrderedDict()
        self._lock = asyncio.Lock()
        self._hits = 0
        self._misses = 0

    async def get(self, key: str) -> Optional[T]:
        """Get a value from cache. Returns None if not found or expired."""
        async with self._lock:
            entry = self._cache.get(key)

            if entry is None:
                self._misses += 1
                return None

            if entry.is_expired:
                del self._cache[key]
                self._misses += 1
                return None

            # Move to end (most recently used)
            self._cache.move_to_end(key)
            self._hits += 1
            return entry.value

    async def set(self, key: str, value: T, ttl: Optional[int] = None) -> None:
        """Set a value in cache with optional custom TTL."""
        async with self._lock:
            ttl = ttl if ttl is not None else self.default_ttl

            # Remove if exists to update position
            if key in self._cache:
                del self._cache[key]

            # Evict oldest if at capacity
            while len(self._cache) >= self.max_size:
                self._cache.popitem(last=False)

            self._cache[key] = CacheEntry(value, ttl)

    async def delete(self, key: str) -> bool:
        """Delete a key from cache. Returns True if key existed."""
        async with self._lock:
            if key in self._cache:
                del self._cache[key]
                return True
            return False

    async def delete_pattern(self, pattern: str) -> int:
        """Delete all keys matching a pattern (prefix match). Returns count deleted."""
        async with self._lock:
            to_delete = [k for k in self._cache.keys() if k.startswith(pattern)]
            for key in to_delete:
                del self._cache[key]
            return len(to_delete)

    async def clear(self) -> int:
        """Clear all entries. Returns count cleared."""
        async with self._lock:
            count = len(self._cache)
            self._cache.clear()
            return count

    async def cleanup_expired(self) -> int:
        """Remove all expired entries. Returns count removed."""
        async with self._lock:
            expired = [k for k, v in self._cache.items() if v.is_expired]
            for key in expired:
                del self._cache[key]
            return len(expired)

    @property
    def stats(self) -> dict:
        """Get cache statistics."""
        total = self._hits + self._misses
        hit_rate = (self._hits / total * 100) if total > 0 else 0
        return {
            "name": self.name,
            "size": len(self._cache),
            "max_size": self.max_size,
            "hits": self._hits,
            "misses": self._misses,
            "hit_rate": f"{hit_rate:.1f}%",
            "default_ttl": self.default_ttl
        }


class UserDataCache:
    """
    Specialized cache for user data with separate caches for different data types.
    Provides convenient methods for common operations.
    """

    def __init__(self):
        # Separate caches for different data types with appropriate TTLs
        self.balances = LRUCache[int](max_size=5000, default_ttl=60, name="balances")
        self.levels = LRUCache[dict](max_size=5000, default_ttl=120, name="levels")
        self.api_keys = LRUCache[dict](max_size=2000, default_ttl=300, name="api_keys")
        self.cooldowns = LRUCache[datetime](max_size=10000, default_ttl=1800, name="cooldowns")
        self.user_info = LRUCache[dict](max_size=3000, default_ttl=180, name="user_info")

        # Background cleanup task
        self._cleanup_task: Optional[asyncio.Task] = None

    def start_cleanup_task(self, interval: int = 300):
        """Start background task to clean up expired entries."""
        if self._cleanup_task is None:
            self._cleanup_task = asyncio.create_task(self._cleanup_loop(interval))

    async def _cleanup_loop(self, interval: int):
        """Periodically clean up expired entries from all caches."""
        while True:
            await asyncio.sleep(interval)
            for cache in [self.balances, self.levels, self.api_keys, self.cooldowns, self.user_info]:
                await cache.cleanup_expired()

    async def stop_cleanup_task(self):
        """Stop the background cleanup task."""
        if self._cleanup_task:
            self._cleanup_task.cancel()
            try:
                await self._cleanup_task
            except asyncio.CancelledError:
                pass
            self._cleanup_task = None

    # ==================== Balance Cache ====================

    async def get_balance(self, user_id: str) -> Optional[int]:
        """Get cached balance for a user."""
        return await self.balances.get(f"bal:{user_id}")

    async def set_balance(self, user_id: str, balance: int) -> None:
        """Cache a user's balance."""
        await self.balances.set(f"bal:{user_id}", balance)

    async def invalidate_balance(self, user_id: str) -> None:
        """Invalidate cached balance (call after balance changes)."""
        await self.balances.delete(f"bal:{user_id}")

    # ==================== Level Cache ====================

    async def get_level_data(self, user_id: str) -> Optional[dict]:
        """Get cached level data for a user."""
        return await self.levels.get(f"lvl:{user_id}")

    async def set_level_data(self, user_id: str, data: dict) -> None:
        """Cache a user's level data."""
        await self.levels.set(f"lvl:{user_id}", data)

    async def invalidate_level(self, user_id: str) -> None:
        """Invalidate cached level data."""
        await self.levels.delete(f"lvl:{user_id}")

    # ==================== API Key Cache ====================

    async def get_api_key_data(self, user_id: str) -> Optional[dict]:
        """Get cached API key data for a user."""
        return await self.api_keys.get(f"key:{user_id}")

    async def set_api_key_data(self, user_id: str, data: dict) -> None:
        """Cache a user's API key data."""
        await self.api_keys.set(f"key:{user_id}", data)

    async def invalidate_api_key(self, user_id: str) -> None:
        """Invalidate cached API key data."""
        await self.api_keys.delete(f"key:{user_id}")

    # ==================== Cooldown Cache ====================

    async def get_cooldown(self, user_id: str, command: str) -> Optional[datetime]:
        """Get cached cooldown timestamp for a user's command."""
        return await self.cooldowns.get(f"cd:{user_id}:{command}")

    async def set_cooldown(self, user_id: str, command: str, expires_at: datetime) -> None:
        """Cache a cooldown timestamp."""
        ttl = max(1, int((expires_at - datetime.now()).total_seconds()))
        await self.cooldowns.set(f"cd:{user_id}:{command}", expires_at, ttl=ttl)

    async def clear_cooldown(self, user_id: str, command: str) -> None:
        """Clear a cooldown from cache."""
        await self.cooldowns.delete(f"cd:{user_id}:{command}")

    # ==================== User Info Cache ====================

    async def get_user_info(self, user_id: str) -> Optional[dict]:
        """Get cached general user info."""
        return await self.user_info.get(f"usr:{user_id}")

    async def set_user_info(self, user_id: str, info: dict) -> None:
        """Cache general user info."""
        await self.user_info.set(f"usr:{user_id}", info)

    async def invalidate_user(self, user_id: str) -> None:
        """Invalidate all cached data for a user."""
        await self.balances.delete(f"bal:{user_id}")
        await self.levels.delete(f"lvl:{user_id}")
        await self.api_keys.delete(f"key:{user_id}")
        await self.user_info.delete(f"usr:{user_id}")
        await self.cooldowns.delete_pattern(f"cd:{user_id}:")

    # ==================== Stats ====================

    def get_all_stats(self) -> dict:
        """Get statistics for all caches."""
        return {
            "balances": self.balances.stats,
            "levels": self.levels.stats,
            "api_keys": self.api_keys.stats,
            "cooldowns": self.cooldowns.stats,
            "user_info": self.user_info.stats,
        }


# Global cache instance
user_cache = UserDataCache()


def cached(
    cache_name: str,
    key_func: Callable[..., str],
    ttl: Optional[int] = None
):
    """
    Decorator to cache function results.

    Args:
        cache_name: Name of cache to use ('balances', 'levels', 'api_keys', 'user_info')
        key_func: Function to generate cache key from arguments
        ttl: Optional TTL override

    Example:
        @cached('balances', lambda user_id: f"bal:{user_id}", ttl=60)
        async def get_user_balance(user_id: str) -> int:
            # Database query here
            pass
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            cache = getattr(user_cache, cache_name, None)
            if cache is None:
                return await func(*args, **kwargs)

            key = key_func(*args, **kwargs)
            cached_value = await cache.get(key)

            if cached_value is not None:
                return cached_value

            result = await func(*args, **kwargs)

            if result is not None:
                if ttl:
                    await cache.set(key, result, ttl=ttl)
                else:
                    await cache.set(key, result)

            return result

        # Add cache bypass method
        wrapper.uncached = func
        return wrapper

    return decorator
