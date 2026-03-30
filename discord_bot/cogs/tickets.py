"""
Tickets cog for ZeroX Discord bot.
Handles support ticket system.
"""

from __future__ import annotations
import asyncio
from datetime import datetime

import discord
from discord.ext import commands
from discord import ui

from utils.database import get_db

# Max support members to add to a ticket (prevents rate limit issues)
MAX_SUPPORT_MEMBERS = 10


class TicketCreateButton(ui.View):
    """Persistent view for creating tickets."""

    def __init__(self):
        super().__init__(timeout=None)

    @ui.button(
        label="Create Ticket",
        style=discord.ButtonStyle.primary,
        emoji="\U0001F3AB",  # Ticket emoji
        custom_id="ticket_create",
    )
    async def create_ticket(self, interaction: discord.Interaction, button: ui.Button):
        guild = interaction.guild
        user = interaction.user

        cog = interaction.client.get_cog("Tickets")
        if cog:
            channel, existing_id = await cog.create_ticket_for_user(guild, user)

            if existing_id:
                await interaction.response.send_message(
                    f"You already have an open ticket: <#{existing_id}>",
                    ephemeral=True,
                )
            elif channel:
                await interaction.response.send_message(
                    f"Ticket created: {channel.mention}",
                    ephemeral=True,
                )
            else:
                await interaction.response.send_message(
                    "Ticket system not configured. Ask an admin to run `!ticketsetup`.",
                    ephemeral=True,
                )


class TicketCloseButton(ui.View):
    """Persistent view for closing tickets."""

    def __init__(self):
        super().__init__(timeout=None)

    @ui.button(
        label="Close Ticket",
        style=discord.ButtonStyle.danger,
        emoji="\U0001F512",  # Lock emoji
        custom_id="ticket_close",
    )
    async def close_ticket(self, interaction: discord.Interaction, button: ui.Button):
        channel = interaction.channel
        db = get_db()

        await db.execute(
            "UPDATE tickets SET status = 'closed', closed_at = ? WHERE channel_id = ?",
            (datetime.now().isoformat(), str(channel.id)),
        )

        embed = discord.Embed(
            title="Ticket Closed",
            description="This ticket has been closed and archived.",
            color=0xE74C3C,
        )
        embed.set_footer(text=f"Closed by {interaction.user.display_name}")
        await interaction.response.send_message(embed=embed)

        if isinstance(channel, discord.Thread):
            try:
                await channel.edit(name=f"closed-{channel.name}", archived=True, locked=True)
            except:
                pass
        else:
            await asyncio.sleep(5)
            await channel.delete()


class Tickets(commands.Cog):
    """Support ticket system."""

    def __init__(self, bot: commands.Bot):
        self.bot = bot
        # Register persistent views
        bot.add_view(TicketCreateButton())
        bot.add_view(TicketCloseButton())

    # ==================== Helper Functions ====================

    async def create_ticket_for_user(self, guild: discord.Guild, user: discord.Member):
        """Create a ticket thread for a user."""
        db = get_db()

        # Check if user already has an open ticket
        existing = await db.fetch_one(
            "SELECT channel_id FROM tickets WHERE guild_id = ? AND user_id = ? AND status = 'open'",
            (str(guild.id), str(user.id)),
        )

        if existing:
            return None, int(existing[0])

        # Get ticket config
        config = await db.fetch_one(
            "SELECT ticket_channel_id, support_role_id FROM ticket_config WHERE guild_id = ?",
            (str(guild.id),),
        )

        if not config or not config[0]:
            return None, None

        ticket_channel = guild.get_channel(int(config[0]))
        if not ticket_channel:
            return None, None

        # Create a private thread for the ticket
        thread = await ticket_channel.create_thread(
            name=f"ticket-{user.display_name}",
            type=discord.ChannelType.private_thread,
            auto_archive_duration=10080,  # 7 days
            invitable=False,
        )

        # Add the user to the thread
        await thread.add_user(user)

        # Add support role members to the thread (limited to prevent rate limits)
        if config[1]:
            support_role = guild.get_role(int(config[1]))
            if support_role:
                added = 0
                for member in support_role.members:
                    if added >= MAX_SUPPORT_MEMBERS:
                        break
                    try:
                        await thread.add_user(member)
                        added += 1
                        await asyncio.sleep(0.3)  # Prevent rate limits
                    except:
                        pass

        # Save ticket to database
        await db.execute(
            "INSERT INTO tickets (guild_id, channel_id, user_id, status, created_at) VALUES (?, ?, ?, 'open', ?)",
            (str(guild.id), str(thread.id), str(user.id), datetime.now().isoformat()),
        )

        # Send welcome message
        embed = discord.Embed(
            title="Support Ticket",
            description=f"Hello {user.mention}! Support will be with you shortly.\nDescribe your issue below.",
            color=0x3498DB,
        )
        embed.add_field(
            name="Close Ticket",
            value="Use `!close` or click the button below to close this ticket.",
            inline=False,
        )
        embed.set_footer(text=f"Ticket opened by {user.display_name}")
        await thread.send(embed=embed, view=TicketCloseButton())

        return thread, None

    # ==================== Commands ====================

    @commands.command()
    @commands.has_permissions(administrator=True)
    async def ticketsetup(self, ctx: commands.Context, channel: discord.TextChannel = None, support_role: discord.Role = None):
        """Set up the ticket system. Usage: !ticketsetup [#channel] [@support-role]"""
        channel = channel or ctx.channel
        db = get_db()

        await db.execute(
            "INSERT INTO ticket_config (guild_id, ticket_channel_id, support_role_id) VALUES (?, ?, ?) "
            "ON CONFLICT(guild_id) DO UPDATE SET ticket_channel_id = ?, support_role_id = ?",
            (str(ctx.guild.id), str(channel.id), str(support_role.id) if support_role else None,
             str(channel.id), str(support_role.id) if support_role else None),
        )

        # Send the ticket panel
        embed = discord.Embed(
            title="Support Tickets",
            description="Click the button below to create a support ticket.\n\n"
                        "A staff member will assist you as soon as possible.",
            color=0x3498DB,
        )
        embed.set_footer(text="Please be patient and provide details about your issue.")

        await channel.send(embed=embed, view=TicketCreateButton())

        if ctx.channel != channel:
            await ctx.send(f"Ticket system set up in {channel.mention}")

    @commands.command()
    async def close(self, ctx: commands.Context):
        """Close the current ticket."""
        db = get_db()

        # Check if this is a ticket channel
        ticket = await db.fetch_one(
            "SELECT id FROM tickets WHERE channel_id = ? AND status = 'open'",
            (str(ctx.channel.id),),
        )

        if not ticket:
            await ctx.send("This is not an open ticket channel.")
            return

        await db.execute(
            "UPDATE tickets SET status = 'closed', closed_at = ? WHERE channel_id = ?",
            (datetime.now().isoformat(), str(ctx.channel.id)),
        )

        embed = discord.Embed(
            title="Ticket Closed",
            description="This ticket has been closed.",
            color=0xE74C3C,
        )
        embed.set_footer(text=f"Closed by {ctx.author.display_name}")
        await ctx.send(embed=embed)

        if isinstance(ctx.channel, discord.Thread):
            try:
                await ctx.channel.edit(name=f"closed-{ctx.channel.name}", archived=True, locked=True)
            except:
                pass
        else:
            await asyncio.sleep(5)
            await ctx.channel.delete()

    @commands.command()
    @commands.guild_only()
    @commands.cooldown(1, 300, commands.BucketType.user)  # 5 minute cooldown
    async def ticket(self, ctx: commands.Context):
        """Create a support ticket."""
        channel, existing_id = await self.create_ticket_for_user(ctx.guild, ctx.author)

        if existing_id:
            await ctx.send(f"You already have an open ticket: <#{existing_id}>", delete_after=10)
        elif channel:
            await ctx.send(f"Ticket created: {channel.mention}", delete_after=10)
        else:
            await ctx.send("Ticket system not configured. Ask an admin to run `!ticketsetup`.")

        try:
            await ctx.message.delete()
        except:
            pass

    @commands.command()
    @commands.has_permissions(manage_threads=True)
    async def addtoticket(self, ctx: commands.Context, member: discord.Member):
        """Add a user to the current ticket. Usage: !addtoticket @user"""
        db = get_db()

        ticket = await db.fetch_one(
            "SELECT id FROM tickets WHERE channel_id = ? AND status = 'open'",
            (str(ctx.channel.id),),
        )

        if not ticket:
            await ctx.send("This is not an open ticket channel.")
            return

        if isinstance(ctx.channel, discord.Thread):
            await ctx.channel.add_user(member)
            await ctx.send(f"Added {member.mention} to this ticket.")
        else:
            await ctx.send("Can only add users to thread-based tickets.")

    @commands.command()
    @commands.has_permissions(manage_threads=True)
    async def removefromticket(self, ctx: commands.Context, member: discord.Member):
        """Remove a user from the current ticket. Usage: !removefromticket @user"""
        db = get_db()

        ticket = await db.fetch_one(
            "SELECT id FROM tickets WHERE channel_id = ? AND status = 'open'",
            (str(ctx.channel.id),),
        )

        if not ticket:
            await ctx.send("This is not an open ticket channel.")
            return

        if isinstance(ctx.channel, discord.Thread):
            await ctx.channel.remove_user(member)
            await ctx.send(f"Removed {member.mention} from this ticket.")
        else:
            await ctx.send("Can only remove users from thread-based tickets.")


async def setup(bot: commands.Bot):
    """Load the Tickets cog."""
    await bot.add_cog(Tickets(bot))
