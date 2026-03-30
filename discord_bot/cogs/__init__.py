# Cogs for ZeroX Bot
# Each cog handles a specific feature area

COGS = [
    "cogs.economy",
    "cogs.moderation",
    "cogs.leveling",
    "cogs.apikeys",
    "cogs.fun",
    "cogs.ai",
    "cogs.admin",
    "cogs.tickets",
]


async def setup_cogs(bot):
    """Load all cogs."""
    loaded = 0
    failed = 0
    for cog in COGS:
        try:
            await bot.load_extension(cog)
            print(f"  [x] Loaded {cog}")
            loaded += 1
        except Exception as e:
            print(f"  [ ] Failed to load {cog}: {e}")
            failed += 1
    return loaded, failed
