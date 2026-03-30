"""
Economy cog for ZeroX Discord bot.
Handles all economy-related commands (work, crime, rob, gambling, etc.)
"""

from __future__ import annotations
import random
import asyncio
from datetime import datetime
from typing import Optional

import discord
from discord.ext import commands

from utils.cooldowns import cooldown, CooldownManager
from utils.validators import validate_bet, validate_member_target
from utils.formatters import format_currency
from utils.database import get_db, get_user_balance, update_user_balance


class Economy(commands.Cog):
    """Economy and gambling commands."""

    def __init__(self, bot: commands.Bot):
        self.bot = bot

    # ==================== Work Commands ====================

    @commands.command()
    @commands.guild_only()
    @cooldown(900, cooldown_message="You're tired! Rest for {remaining} before working again.")
    async def work(self, ctx: commands.Context):
        """Work to earn dollars! Cooldown: 15 minutes."""
        user_id = str(ctx.author.id)

        # Random job and payment
        jobs = [
            ("coded a Discord bot", (100, 300)),
            ("delivered packages", (80, 200)),
            ("streamed on Twitch", (150, 400)),
            ("designed a website", (120, 350)),
            ("wrote articles", (90, 250)),
            ("tutored students", (100, 280)),
            ("moderated a server", (70, 180)),
            ("created art commissions", (110, 320)),
            ("debugged some code", (130, 380)),
            ("edited videos", (95, 270)),
            ("managed social media", (85, 220)),
            ("tested games", (105, 290)),
        ]

        job, (min_pay, max_pay) = random.choice(jobs)
        earned = random.randint(min_pay, max_pay)

        new_balance = await update_user_balance(user_id, earned)

        embed = discord.Embed(
            title="Work Complete!",
            description=f"You {job} and earned **{format_currency(earned)}**!",
            color=0x3498DB,
        )
        embed.add_field(
            name="New Balance",
            value=f"**{format_currency(new_balance)}**",
            inline=False,
        )
        await ctx.send(embed=embed)

    @commands.command()
    @commands.guild_only()
    @cooldown(1800, cooldown_message="The heat is on! Wait {remaining} before committing another crime.")
    async def crime(self, ctx: commands.Context):
        """Commit a crime! High risk, high reward. Cooldown: 30 minutes."""
        user_id = str(ctx.author.id)

        # Crime scenarios
        crimes = [
            ("robbed a bank", (500, 1500), "bank"),
            ("hacked a crypto wallet", (800, 2000), "computer"),
            ("stole a luxury car", (600, 1800), "car"),
            ("sold illegal items", (400, 1200), "package"),
            ("ran an underground casino", (700, 1900), "casino"),
            ("counterfeited money", (550, 1600), "money"),
            ("smuggled goods", (650, 1750), "mail"),
        ]

        crime_action, (min_pay, max_pay), _ = random.choice(crimes)
        earned = random.randint(min_pay, max_pay)
        fine = random.randint(300, 800)

        # 65% success chance
        success = random.random() < 0.65

        embed = discord.Embed(title="Crime Attempt", color=0x3498DB)

        if success:
            new_balance = await update_user_balance(user_id, earned)
            embed.description = f"**Success!** You {crime_action} and earned **{format_currency(earned)}**!"
            embed.add_field(name="New Balance", value=f"**{format_currency(new_balance)}**", inline=False)
            embed.color = 0x2ECC71
        else:
            new_balance = await update_user_balance(user_id, -fine)
            embed.description = f"**Caught!** You were fined **{format_currency(fine)}**!"
            embed.add_field(name="New Balance", value=f"**{format_currency(new_balance)}**", inline=False)
            embed.color = 0xE74C3C

        embed.set_footer(text="Try again in 30 minutes!")
        await ctx.send(embed=embed)

    @commands.command()
    @commands.guild_only()
    @cooldown(60, cooldown_message="Wait {remaining} before begging again.")
    async def beg(self, ctx: commands.Context):
        """Beg for dollars. Small random amounts. Cooldown: 1 minute."""
        user_id = str(ctx.author.id)

        responses = [
            ("A kind stranger gave you", (5, 50)),
            ("Someone felt bad and gave you", (10, 40)),
            ("A generous person donated", (15, 60)),
            ("You found", (5, 35)),
            ("Someone tossed you", (8, 45)),
            ("A passerby gave you", (12, 55)),
        ]

        response, (min_pay, max_pay) = random.choice(responses)
        earned = random.randint(min_pay, max_pay)

        new_balance = await update_user_balance(user_id, earned)

        embed = discord.Embed(
            title="Begging",
            description=f"{response} **{format_currency(earned)}**!",
            color=0x3498DB,
        )
        embed.add_field(name="Balance", value=f"**{format_currency(new_balance)}**", inline=False)
        await ctx.send(embed=embed)

    # ==================== Robbery (with transaction safety) ====================

    @commands.command()
    @commands.guild_only()
    @cooldown(900, cooldown_message="The cops are watching! Wait {remaining} before trying again.")
    async def rob(self, ctx: commands.Context, member: discord.Member = None):
        """Try to rob another user! 50% chance. Cooldown: 15 minutes."""
        valid, error = validate_member_target(member, ctx.author, "rob")
        if not valid:
            await ctx.send(f"{error}")
            return

        user_id = str(ctx.author.id)
        target_id = str(member.id)

        # Use transaction to prevent race conditions
        db = get_db()
        async with db.acquire() as conn:
            # Start transaction
            await conn.execute("BEGIN IMMEDIATE")
            try:
                # Get balances within transaction
                async with conn.execute(
                    "SELECT coins FROM levels WHERE user_id = ?", (user_id,)
                ) as cursor:
                    row = await cursor.fetchone()
                    robber_balance = row[0] if row else 100

                async with conn.execute(
                    "SELECT coins FROM levels WHERE user_id = ?", (target_id,)
                ) as cursor:
                    row = await cursor.fetchone()
                    target_balance = row[0] if row else 100

                # Check debt limit
                DEBT_LIMIT = -1000
                if robber_balance < DEBT_LIMIT:
                    await conn.execute("ROLLBACK")
                    await ctx.send(
                        f"**You're banned from criminal activity!**\n\n"
                        f"You're **{format_currency(abs(robber_balance))}** in debt. Pay off your debt first."
                    )
                    return

                if target_balance < 100:
                    await conn.execute("ROLLBACK")
                    await ctx.send(f"{member.display_name} doesn't have enough to rob! (minimum $100)")
                    return

                if robber_balance < 50:
                    await conn.execute("ROLLBACK")
                    await ctx.send("You need at least $50 to attempt a robbery!")
                    return

                # Calculate steal amount (10-25% of target's balance)
                steal_percentage = random.uniform(0.10, 0.25)
                steal_amount = int(target_balance * steal_percentage)
                fine_amount = int(steal_amount * 0.5)

                # 50% success chance
                success = random.random() < 0.5

                embed = discord.Embed(title="Robbery Attempt", color=0x3498DB)

                if success:
                    # Update both balances atomically
                    await conn.execute(
                        "UPDATE levels SET coins = coins - ? WHERE user_id = ?",
                        (steal_amount, target_id)
                    )
                    await conn.execute(
                        "UPDATE levels SET coins = coins + ? WHERE user_id = ?",
                        (steal_amount, user_id)
                    )
                    new_balance = robber_balance + steal_amount

                    embed.description = f"**Success!** You stole **{format_currency(steal_amount)}** from {member.mention}!"
                    embed.add_field(name="Your Balance", value=f"**{format_currency(new_balance)}**", inline=True)
                    embed.color = 0x2ECC71
                else:
                    await conn.execute(
                        "UPDATE levels SET coins = coins - ? WHERE user_id = ?",
                        (fine_amount, user_id)
                    )
                    new_balance = robber_balance - fine_amount

                    embed.description = f"**Caught!** You were fined **{format_currency(fine_amount)}**!"
                    embed.add_field(name="Your Balance", value=f"**{format_currency(new_balance)}**", inline=True)
                    embed.color = 0xE74C3C

                await conn.commit()
                await ctx.send(embed=embed)

            except Exception as e:
                await conn.execute("ROLLBACK")
                print(f"Rob transaction error: {e}")
                await ctx.send("Something went wrong. Please try again.")

    # ==================== Gambling ====================

    @commands.command()
    @commands.guild_only()
    async def coinflip(self, ctx: commands.Context, choice: str = None, bet: int = None):
        """Flip a coin! Bet on heads or tails. 50% chance to double your bet."""
        if choice is None or bet is None:
            await ctx.send("Usage: `!coinflip <heads/tails> <bet>` (minimum 10 dollars)")
            return

        choice = choice.lower()
        if choice not in ["heads", "tails", "h", "t"]:
            await ctx.send("Choose either `heads` or `tails` (or `h`/`t`)")
            return

        # Normalize choice
        if choice == "h":
            choice = "heads"
        elif choice == "t":
            choice = "tails"

        user_id = str(ctx.author.id)
        balance = await get_user_balance(user_id)

        valid, validated_bet, error = validate_bet(bet, balance)
        if not valid:
            await ctx.send(f"{error}")
            return

        # Remove bet
        await update_user_balance(user_id, -validated_bet)

        # Flip the coin
        result = random.choice(["heads", "tails"])
        won = result == choice

        embed = discord.Embed(title="Coin Flip", color=0x3498DB)

        # Animated message
        flip_msg = await ctx.send("Flipping...")
        await asyncio.sleep(1)
        await flip_msg.edit(content="Flipping...")
        await asyncio.sleep(1)

        if won:
            winnings = validated_bet * 2
            new_balance = await update_user_balance(user_id, winnings)

            embed.description = f"The coin landed on **{result.upper()}**!"
            embed.add_field(name="Your Choice", value=f"**{choice.upper()}**", inline=True)
            embed.add_field(name="Result", value=f"**{result.upper()}**", inline=True)
            embed.add_field(
                name="Outcome",
                value=f"You won **{format_currency(winnings)}**!\n\nBalance: **{format_currency(new_balance)}**",
                inline=False,
            )
            embed.color = 0x2ECC71
        else:
            new_balance = await get_user_balance(user_id)

            embed.description = f"The coin landed on **{result.upper()}**!"
            embed.add_field(name="Your Choice", value=f"**{choice.upper()}**", inline=True)
            embed.add_field(name="Result", value=f"**{result.upper()}**", inline=True)
            embed.add_field(
                name="Outcome",
                value=f"You lost **{format_currency(validated_bet)}**.\n\nBalance: **{format_currency(new_balance)}**",
                inline=False,
            )
            embed.color = 0xE74C3C

        await flip_msg.delete()
        await ctx.send(embed=embed)

    @commands.command()
    @commands.guild_only()
    async def balance(self, ctx: commands.Context, member: discord.Member = None):
        """Check your or another user's balance."""
        target = member or ctx.author
        user_id = str(target.id)
        balance = await get_user_balance(user_id)

        embed = discord.Embed(
            title=f"{target.display_name}'s Balance",
            description=f"**{format_currency(balance)}**",
            color=0x3498DB if balance >= 0 else 0xE74C3C,
        )

        if balance < 0:
            embed.set_footer(text="In debt! Use !work or !daily to earn more.")

        await ctx.send(embed=embed)


async def setup(bot: commands.Bot):
    """Load the Economy cog."""
    await bot.add_cog(Economy(bot))
