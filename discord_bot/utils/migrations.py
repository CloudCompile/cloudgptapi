"""
Database migration system for Discord bot.
Tracks and applies schema changes in order.
"""

from __future__ import annotations
import asyncio
from datetime import datetime
from typing import Optional, Callable, Awaitable
import aiosqlite


# Type alias for migration functions
MigrationFunc = Callable[[aiosqlite.Connection], Awaitable[None]]


class Migration:
    """Represents a single database migration."""

    def __init__(
        self,
        version: int,
        name: str,
        up: MigrationFunc,
        down: Optional[MigrationFunc] = None
    ):
        self.version = version
        self.name = name
        self.up = up
        self.down = down

    def __repr__(self) -> str:
        return f"Migration({self.version}, '{self.name}')"


class MigrationManager:
    """
    Manages database migrations.
    Tracks applied migrations and applies pending ones in order.
    """

    def __init__(self, db_path: str):
        self.db_path = db_path
        self._migrations: list[Migration] = []

    def register(self, version: int, name: str):
        """Decorator to register a migration function."""
        def decorator(func: MigrationFunc) -> MigrationFunc:
            self._migrations.append(Migration(version, name, func))
            return func
        return decorator

    def add_migration(self, migration: Migration) -> None:
        """Add a migration to the registry."""
        self._migrations.append(migration)

    async def init_migrations_table(self, db: aiosqlite.Connection) -> None:
        """Create the migrations tracking table if it doesn't exist."""
        await db.execute("""
            CREATE TABLE IF NOT EXISTS _migrations (
                version INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                applied_at TEXT NOT NULL
            )
        """)
        await db.commit()

    async def get_applied_versions(self, db: aiosqlite.Connection) -> set[int]:
        """Get set of already applied migration versions."""
        await self.init_migrations_table(db)
        async with db.execute("SELECT version FROM _migrations") as cursor:
            rows = await cursor.fetchall()
        return {row[0] for row in rows}

    async def get_pending_migrations(self) -> list[Migration]:
        """Get list of migrations that haven't been applied yet."""
        async with aiosqlite.connect(self.db_path) as db:
            applied = await self.get_applied_versions(db)

        pending = [m for m in self._migrations if m.version not in applied]
        return sorted(pending, key=lambda m: m.version)

    async def apply_migration(self, db: aiosqlite.Connection, migration: Migration) -> None:
        """Apply a single migration."""
        print(f"  Applying migration {migration.version}: {migration.name}...")

        try:
            await migration.up(db)
            await db.execute(
                "INSERT INTO _migrations (version, name, applied_at) VALUES (?, ?, ?)",
                (migration.version, migration.name, datetime.now().isoformat())
            )
            await db.commit()
            print(f"  ✓ Migration {migration.version} applied successfully")
        except Exception as e:
            await db.rollback()
            print(f"  ✗ Migration {migration.version} failed: {e}")
            raise

    async def migrate(self, target_version: Optional[int] = None) -> int:
        """
        Apply all pending migrations up to target_version.
        Returns number of migrations applied.
        """
        pending = await self.get_pending_migrations()

        if target_version is not None:
            pending = [m for m in pending if m.version <= target_version]

        if not pending:
            print("No pending migrations.")
            return 0

        print(f"Found {len(pending)} pending migration(s):")
        for m in pending:
            print(f"  - {m.version}: {m.name}")

        async with aiosqlite.connect(self.db_path) as db:
            await self.init_migrations_table(db)

            for migration in pending:
                await self.apply_migration(db, migration)

        print(f"\n✓ Applied {len(pending)} migration(s)")
        return len(pending)

    async def get_status(self) -> dict:
        """Get migration status."""
        async with aiosqlite.connect(self.db_path) as db:
            applied = await self.get_applied_versions(db)

            async with db.execute(
                "SELECT version, name, applied_at FROM _migrations ORDER BY version"
            ) as cursor:
                applied_list = await cursor.fetchall()

        pending = await self.get_pending_migrations()

        return {
            "applied": [
                {"version": v, "name": n, "applied_at": a}
                for v, n, a in applied_list
            ],
            "pending": [
                {"version": m.version, "name": m.name}
                for m in pending
            ],
            "current_version": max(applied) if applied else 0,
            "latest_version": max((m.version for m in self._migrations), default=0)
        }


# ============== MIGRATIONS REGISTRY ==============
# All migrations for the bot database

migrations = MigrationManager("server_memory.db")


# ==================== Base Tables (v1-10) ====================

@migrations.register(1, "create_messages_table")
async def migration_001(db: aiosqlite.Connection):
    await db.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            username TEXT,
            content TEXT,
            timestamp TEXT,
            guild_id TEXT,
            channel_id TEXT
        )
    """)


@migrations.register(2, "create_warnings_table")
async def migration_002(db: aiosqlite.Connection):
    await db.execute("""
        CREATE TABLE IF NOT EXISTS warnings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            username TEXT,
            reason TEXT,
            timestamp TEXT,
            warner_id TEXT
        )
    """)


@migrations.register(3, "create_mod_actions_table")
async def migration_003(db: aiosqlite.Connection):
    await db.execute("""
        CREATE TABLE IF NOT EXISTS mod_actions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            action_type TEXT,
            reason TEXT,
            timestamp TEXT,
            moderator_id TEXT,
            duration TEXT
        )
    """)


@migrations.register(4, "create_levels_table")
async def migration_004(db: aiosqlite.Connection):
    await db.execute("""
        CREATE TABLE IF NOT EXISTS levels (
            user_id TEXT PRIMARY KEY,
            xp INTEGER DEFAULT 0,
            level INTEGER DEFAULT 1,
            total_messages INTEGER DEFAULT 0,
            last_xp_time TEXT,
            coins INTEGER DEFAULT 100,
            last_daily TEXT,
            last_rob_time TEXT
        )
    """)


@migrations.register(5, "create_reminders_table")
async def migration_005(db: aiosqlite.Connection):
    await db.execute("""
        CREATE TABLE IF NOT EXISTS reminders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            channel_id TEXT,
            reminder_time TEXT,
            message TEXT,
            created_at TEXT
        )
    """)


@migrations.register(6, "create_api_keys_table")
async def migration_006(db: aiosqlite.Connection):
    await db.execute("""
        CREATE TABLE IF NOT EXISTS api_keys (
            discord_id TEXT PRIMARY KEY,
            api_key TEXT UNIQUE,
            username TEXT,
            created_at TEXT,
            disabled INTEGER DEFAULT 0,
            rpd INTEGER DEFAULT 100
        )
    """)


@migrations.register(7, "create_api_key_audit_table")
async def migration_007(db: aiosqlite.Connection):
    await db.execute("""
        CREATE TABLE IF NOT EXISTS api_key_audit (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            discord_id TEXT,
            action TEXT,
            performed_by TEXT,
            details TEXT,
            timestamp TEXT
        )
    """)


@migrations.register(8, "create_invites_table")
async def migration_008(db: aiosqlite.Connection):
    await db.execute("""
        CREATE TABLE IF NOT EXISTS invites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guild_id TEXT,
            inviter_id TEXT,
            invited_id TEXT,
            invite_code TEXT,
            joined_at TEXT,
            verified INTEGER DEFAULT 0,
            UNIQUE(guild_id, invited_id)
        )
    """)


@migrations.register(9, "create_guild_config_table")
async def migration_009(db: aiosqlite.Connection):
    await db.execute("""
        CREATE TABLE IF NOT EXISTS guild_config (
            guild_id TEXT PRIMARY KEY,
            welcome_channel_id TEXT,
            leave_channel_id TEXT,
            welcome_message TEXT,
            leave_message TEXT,
            auto_role_id TEXT
        )
    """)


@migrations.register(10, "create_tickets_tables")
async def migration_010(db: aiosqlite.Connection):
    await db.execute("""
        CREATE TABLE IF NOT EXISTS tickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guild_id TEXT,
            channel_id TEXT,
            user_id TEXT,
            status TEXT,
            created_at TEXT,
            closed_at TEXT
        )
    """)
    await db.execute("""
        CREATE TABLE IF NOT EXISTS ticket_config (
            guild_id TEXT PRIMARY KEY,
            ticket_channel_id TEXT,
            support_role_id TEXT,
            log_channel_id TEXT
        )
    """)


# ==================== Economy Tables (v11-15) ====================

@migrations.register(11, "create_economy_cooldowns_table")
async def migration_011(db: aiosqlite.Connection):
    await db.execute("""
        CREATE TABLE IF NOT EXISTS economy_cooldowns (
            user_id TEXT,
            command TEXT,
            last_used TEXT,
            streak INTEGER DEFAULT 0,
            PRIMARY KEY (user_id, command)
        )
    """)


@migrations.register(12, "create_bank_accounts_table")
async def migration_012(db: aiosqlite.Connection):
    await db.execute("""
        CREATE TABLE IF NOT EXISTS bank_accounts (
            user_id TEXT PRIMARY KEY,
            balance INTEGER DEFAULT 0,
            capacity INTEGER DEFAULT 10000,
            last_interest TEXT
        )
    """)


@migrations.register(13, "create_shop_tables")
async def migration_013(db: aiosqlite.Connection):
    await db.execute("""
        CREATE TABLE IF NOT EXISTS shop_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            description TEXT,
            price INTEGER,
            category TEXT,
            role_id TEXT,
            consumable INTEGER DEFAULT 0
        )
    """)
    await db.execute("""
        CREATE TABLE IF NOT EXISTS user_inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            item_id INTEGER,
            quantity INTEGER DEFAULT 1,
            acquired_at TEXT,
            FOREIGN KEY (item_id) REFERENCES shop_items(id)
        )
    """)


@migrations.register(14, "add_levels_work_time_column")
async def migration_014(db: aiosqlite.Connection):
    try:
        await db.execute("ALTER TABLE levels ADD COLUMN last_work_time TEXT")
    except:
        pass  # Column may already exist


@migrations.register(15, "create_marriages_table")
async def migration_015(db: aiosqlite.Connection):
    await db.execute("""
        CREATE TABLE IF NOT EXISTS marriages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user1_id TEXT,
            user2_id TEXT,
            married_at TEXT,
            UNIQUE(user1_id, user2_id)
        )
    """)


# ==================== Features Tables (v16-20) ====================

@migrations.register(16, "create_reaction_roles_table")
async def migration_016(db: aiosqlite.Connection):
    await db.execute("""
        CREATE TABLE IF NOT EXISTS reaction_roles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message_id TEXT,
            emoji TEXT,
            role_id TEXT,
            guild_id TEXT
        )
    """)


@migrations.register(17, "create_polls_table")
async def migration_017(db: aiosqlite.Connection):
    await db.execute("""
        CREATE TABLE IF NOT EXISTS polls (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message_id TEXT,
            channel_id TEXT,
            question TEXT,
            options TEXT,
            creator_id TEXT,
            created_at TEXT,
            ends_at TEXT
        )
    """)


@migrations.register(18, "create_giveaways_table")
async def migration_018(db: aiosqlite.Connection):
    await db.execute("""
        CREATE TABLE IF NOT EXISTS giveaways (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message_id TEXT,
            channel_id TEXT,
            guild_id TEXT,
            prize TEXT,
            winners_count INTEGER,
            end_time TEXT,
            ended INTEGER DEFAULT 0,
            host_id TEXT
        )
    """)


@migrations.register(19, "create_afk_table")
async def migration_019(db: aiosqlite.Connection):
    await db.execute("""
        CREATE TABLE IF NOT EXISTS afk (
            user_id TEXT PRIMARY KEY,
            reason TEXT,
            timestamp TEXT
        )
    """)


@migrations.register(20, "create_user_achievements_table")
async def migration_020(db: aiosqlite.Connection):
    await db.execute("""
        CREATE TABLE IF NOT EXISTS achievements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            description TEXT,
            icon TEXT,
            xp_reward INTEGER DEFAULT 0,
            coin_reward INTEGER DEFAULT 0
        )
    """)
    await db.execute("""
        CREATE TABLE IF NOT EXISTS user_achievements (
            user_id TEXT,
            achievement_id INTEGER,
            earned_at TEXT,
            PRIMARY KEY (user_id, achievement_id),
            FOREIGN KEY (achievement_id) REFERENCES achievements(id)
        )
    """)


# ==================== Indexes (v21-25) ====================

@migrations.register(21, "create_performance_indexes")
async def migration_021(db: aiosqlite.Connection):
    indexes = [
        "CREATE INDEX IF NOT EXISTS idx_api_keys_discord_id ON api_keys(discord_id)",
        "CREATE INDEX IF NOT EXISTS idx_api_keys_api_key ON api_keys(api_key)",
        "CREATE INDEX IF NOT EXISTS idx_api_keys_disabled ON api_keys(disabled)",
        "CREATE INDEX IF NOT EXISTS idx_api_key_audit_timestamp ON api_key_audit(timestamp DESC)",
        "CREATE INDEX IF NOT EXISTS idx_api_key_audit_discord_id ON api_key_audit(discord_id)",
        "CREATE INDEX IF NOT EXISTS idx_levels_user_id ON levels(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_levels_level ON levels(level DESC)",
        "CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC)",
        "CREATE INDEX IF NOT EXISTS idx_invites_guild_inviter ON invites(guild_id, inviter_id)",
        "CREATE INDEX IF NOT EXISTS idx_warnings_user_id ON warnings(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_economy_cooldowns_user_cmd ON economy_cooldowns(user_id, command)",
        "CREATE INDEX IF NOT EXISTS idx_user_inventory_user ON user_inventory(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_marriages_users ON marriages(user1_id, user2_id)",
    ]
    for sql in indexes:
        try:
            await db.execute(sql)
        except Exception as e:
            print(f"  Warning: Could not create index: {e}")


@migrations.register(22, "create_rules_table")
async def migration_022(db: aiosqlite.Connection):
    await db.execute("""
        CREATE TABLE IF NOT EXISTS rules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guild_id TEXT,
            rule_id TEXT,
            title TEXT,
            description TEXT,
            category TEXT,
            auto_enforce INTEGER DEFAULT 0,
            created_at TEXT,
            UNIQUE(guild_id, rule_id)
        )
    """)


@migrations.register(23, "create_invite_rewards_table")
async def migration_023(db: aiosqlite.Connection):
    await db.execute("""
        CREATE TABLE IF NOT EXISTS invite_rewards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guild_id TEXT,
            invites_required INTEGER,
            reward_description TEXT,
            role_id TEXT,
            created_at TEXT,
            UNIQUE(guild_id, invites_required)
        )
    """)


@migrations.register(24, "create_stats_channels_table")
async def migration_024(db: aiosqlite.Connection):
    await db.execute("""
        CREATE TABLE IF NOT EXISTS stats_channels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guild_id TEXT,
            channel_id TEXT,
            stat_type TEXT
        )
    """)


@migrations.register(25, "create_personas_and_memory_tables")
async def migration_025(db: aiosqlite.Connection):
    await db.execute("""
        CREATE TABLE IF NOT EXISTS personas (
            guild_id TEXT PRIMARY KEY,
            persona_name TEXT,
            custom_prompt TEXT
        )
    """)
    await db.execute("""
        CREATE TABLE IF NOT EXISTS user_memory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            fact TEXT,
            timestamp TEXT,
            UNIQUE(user_id, fact)
        )
    """)


# ==================== CLI Entry Point ====================

async def run_migrations():
    """Run all pending migrations."""
    import sys
    from pathlib import Path

    # Change to discord_bot directory
    db_path = Path(__file__).parent.parent / "server_memory.db"
    migrations.db_path = str(db_path)

    if len(sys.argv) > 1 and sys.argv[1] == "status":
        status = await migrations.get_status()
        print(f"\nMigration Status:")
        print(f"  Current version: {status['current_version']}")
        print(f"  Latest version: {status['latest_version']}")
        print(f"\nApplied ({len(status['applied'])}):")
        for m in status['applied']:
            print(f"  ✓ {m['version']}: {m['name']} ({m['applied_at'][:10]})")
        print(f"\nPending ({len(status['pending'])}):")
        for m in status['pending']:
            print(f"  ○ {m['version']}: {m['name']}")
    else:
        print(f"Running migrations on {db_path}...")
        await migrations.migrate()


if __name__ == "__main__":
    asyncio.run(run_migrations())
