"""
Vetra Ticket Bot - Standalone ticket system for Discord
Deploy to: Railway, Render, or a VPS
"""

import os
import asyncio
from datetime import datetime
from dotenv import load_dotenv

import discord
from discord.ext import commands
from discord import ui
import aiosqlite

load_dotenv()

# Configuration
BOT_TOKEN = os.getenv("DISCORD_BOT_TOKEN")
DB_PATH = "tickets.db"

# Intents
intents = discord.Intents.default()
intents.message_content = True
intents.members = True

bot = commands.Bot(command_prefix="!", intents=intents)
bot.remove_command("help")


# Database setup
async def init_db():
    db = await aiosqlite.connect(DB_PATH)
    await db.execute("""
        CREATE TABLE IF NOT EXISTS ticket_config (
            guild_id TEXT PRIMARY KEY,
            ticket_channel_id TEXT,
            support_role_id TEXT,
            category_id TEXT
        )
    """)
    await db.execute("""
        CREATE TABLE IF NOT EXISTS tickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guild_id TEXT,
            channel_id TEXT,
            user_id TEXT,
            status TEXT DEFAULT 'open',
            created_at TEXT,
            closed_at TEXT
        )
    """)
    await db.commit()
    return db


db = None


# ==================== Views ====================


class TicketCreateView(ui.View):
    def __init__(self):
        super().__init__(timeout=None)

    @ui.button(
        label="Create Ticket",
        style=discord.ButtonStyle.primary,
        emoji="🎫",
        custom_id="ticket_create",
    )
    async def create_ticket(self, interaction: discord.Interaction, button: ui.Button):
        await interaction.response.defer(ephemeral=True)
        channel, existing = await create_ticket_for_user(
            interaction.guild, interaction.user
        )

        if existing:
            await interaction.followup.send(
                f"You already have an open ticket: <#{existing}>", ephemeral=True
            )
        elif channel:
            await interaction.followup.send(
                f"Ticket created: {channel.mention}", ephemeral=True
            )
        else:
            await interaction.followup.send(
                "Ticket system not configured. Ask an admin to run `!ticketsetup`.",
                ephemeral=True,
            )


class TicketCloseView(ui.View):
    def __init__(self):
        super().__init__(timeout=None)

    @ui.button(
        label="Close Ticket",
        style=discord.ButtonStyle.danger,
        emoji="🔒",
        custom_id="ticket_close",
    )
    async def close_ticket(self, interaction: discord.Interaction, button: ui.Button):
        await close_ticket(interaction)


# ==================== Ticket Functions ====================


async def create_ticket_for_user(guild: discord.Guild, user: discord.Member):
    """Create a ticket channel for a user."""
    global db
    if not db:
        db = await init_db()

    # Check for existing open ticket
    existing = await db.fetch_one(
        "SELECT channel_id FROM tickets WHERE guild_id = ? AND user_id = ? AND status = 'open'",
        (str(guild.id), str(user.id)),
    )
    if existing:
        return None, int(existing[0])

    # Get config
    config = await db.fetch_one(
        "SELECT ticket_channel_id, category_id FROM ticket_config WHERE guild_id = ?",
        (str(guild.id),),
    )

    if not config or not config[0]:
        return None, None

    ticket_channel = guild.get_channel(int(config[0]))
    if not ticket_channel:
        return None, None

    # Get or create ticket category
    category = None
    if config[1]:
        category = guild.get_channel(int(config[1]))

    # Create ticket channel
    overwrites = {
        guild.default_role: discord.PermissionOverwrite(read_messages=False),
        user: discord.PermissionOverwrite(read_messages=True, send_messages=True),
        guild.me: discord.PermissionOverwrite(read_messages=True, send_messages=True),
    }

    # Add support role if configured
    support_config = await db.fetch_one(
        "SELECT support_role_id FROM ticket_config WHERE guild_id = ?", (str(guild.id),)
    )
    if support_config and support_config[0]:
        support_role = guild.get_role(int(support_config[0]))
        if support_role:
            overwrites[support_role] = discord.PermissionOverwrite(
                read_messages=True, send_messages=True
            )

    channel = await ticket_channel.create_text_channel(
        name=f"ticket-{user.name}",
        category=category,
        overwrites=overwrites,
        topic=f"Ticket for {user.display_name}",
    )

    # Save to database
    await db.execute(
        "INSERT INTO tickets (guild_id, channel_id, user_id, status, created_at) VALUES (?, ?, ?, 'open', ?)",
        (str(guild.id), str(channel.id), str(user.id), datetime.now().isoformat()),
    )
    await db.commit()

    # Send welcome message
    embed = discord.Embed(
        title="🎫 Support Ticket",
        description=f"Hello {user.mention}! Please describe your issue.\nA staff member will assist you shortly.",
        color=discord.Color.blue(),
    )
    embed.add_field(
        name="Close Ticket",
        value="Use the button below or `!close` to close this ticket.",
        inline=False,
    )
    embed.set_footer(text=f"Ticket opened by {user.display_name}")

    await channel.send(embed=embed, view=TicketCloseView())

    return channel, None


async def close_ticket(interaction: discord.Interaction):
    """Close a ticket."""
    global db
    if not db:
        db = await init_db()

    channel = interaction.channel

    # Check if it's a ticket
    ticket = await db.fetch_one(
        "SELECT id, user_id FROM tickets WHERE channel_id = ? AND status = 'open'",
        (str(channel.id),),
    )

    if not ticket:
        await interaction.response.send_message(
            "This is not an open ticket.", ephemeral=True
        )
        return

    await db.execute(
        "UPDATE tickets SET status = 'closed', closed_at = ? WHERE channel_id = ?",
        (datetime.now().isoformat(), str(channel.id)),
    )
    await db.commit()

    embed = discord.Embed(
        title="🔒 Ticket Closed",
        description="This ticket has been closed.",
        color=discord.Color.red(),
    )
    embed.set_footer(text=f"Closed by {interaction.user.display_name}")
    await interaction.response.send_message(embed=embed)

    # Delete channel after delay
    await asyncio.sleep(3)
    try:
        await channel.delete()
    except:
        pass


# ==================== Commands ====================


@bot.command()
@commands.has_permissions(administrator=True)
async def ticketsetup(
    ctx,
    channel: discord.TextChannel = None,
    support_role: discord.Role = None,
    category: discord.CategoryChannel = None,
):
    """Set up the ticket system. Usage: !ticketsetup #channel @Support"""
    global db
    if not db:
        db = await init_db()

    channel = channel or ctx.channel

    await db.execute(
        """INSERT INTO ticket_config (guild_id, ticket_channel_id, support_role_id, category_id) 
           VALUES (?, ?, ?, ?)
           ON CONFLICT(guild_id) DO UPDATE SET 
           ticket_channel_id = ?, support_role_id = ?, category_id = ?""",
        (
            str(ctx.guild.id),
            str(channel.id),
            str(support_role.id) if support_role else None,
            str(category.id) if category else None,
            str(channel.id),
            str(support_role.id) if support_role else None,
            str(category.id) if category else None,
        ),
    )
    await db.commit()

    embed = discord.Embed(
        title="🎫 Support Tickets",
        description="Click the button below to create a support ticket.",
        color=discord.Color.blue(),
    )
    embed.set_footer(text="Please provide details about your issue.")

    await channel.send(embed=embed, view=TicketCreateView())
    await ctx.send(f"Ticket system set up in {channel.mention}")


@bot.command()
async def close(ctx):
    """Close the current ticket."""
    await close_ticket(ctx)


@bot.command()
async def ticket(ctx):
    """Create a support ticket."""
    channel, existing = await create_ticket_for_user(ctx.guild, ctx.author)

    if existing:
        await ctx.send(
            f"You already have an open ticket: <#{existing}>", delete_after=10
        )
    elif channel:
        await ctx.send(f"Ticket created: {channel.mention}", delete_after=10)
    else:
        await ctx.send(
            "Ticket system not configured. Ask an admin to run `!ticketsetup`."
        )

    try:
        await ctx.message.delete()
    except:
        pass


@bot.command()
@commands.has_permissions(manage_channels=True)
async def addtoticket(ctx, member: discord.Member):
    """Add user to ticket. Usage: !addtoticket @user"""
    overwrites = ctx.channel.overwrites
    overwrites[member] = discord.PermissionOverwrite(
        read_messages=True, send_messages=True
    )
    await ctx.channel.edit(overwrites=overwrites)
    await ctx.send(f"Added {member.mention} to this ticket.")


@bot.command()
@commands.has_permissions(manage_channels=True)
async def removefromticket(ctx, member: discord.Member):
    """Remove user from ticket. Usage: !removefromticket @user"""
    overwrites = ctx.channel.overwrites
    if member in overwrites:
        del overwrites[member]
    await ctx.channel.edit(overwrites=overwrites)
    await ctx.send(f"Removed {member.mention} from this ticket.")


# ==================== Events ====================


@bot.event
async def on_ready():
    global db
    db = await init_db()
    print(f"✅ Vetra Ticket Bot logged in as {bot.user}")

    # Register persistent views
    bot.add_view(TicketCreateView())
    bot.add_view(TicketCloseView())


# ==================== Run Bot ====================


async def main():
    async with bot:
        await bot.start(BOT_TOKEN)


if __name__ == "__main__":
    asyncio.run(main())
