"""
AI cog for ZeroX Discord bot.
Handles AI chat, image generation, and related commands.
"""

from __future__ import annotations
import io
import base64
from datetime import datetime
from typing import Optional

import discord
from discord.ext import commands
from openai import AsyncOpenAI
import aiohttp

from utils.config import (
    AI_API_KEY,
    AI_BASE_URL,
    AI_MODEL_FAST,
    AI_MODEL_POWERFUL,
    IMAGE_MODEL,
    TENOR_API_KEY,
    DEFAULT_PERSONAS,
    SAFETY_SETTINGS,
)
from utils.helpers import clean_output, get_extra_body
from utils.database import get_db


class AI(commands.Cog):
    """AI chat and image generation commands."""

    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.client = AsyncOpenAI(base_url=AI_BASE_URL, api_key=AI_API_KEY)
        self.chat_enabled = True
        self.draw_enabled = True

    async def cog_check(self, ctx: commands.Context) -> bool:
        """Ensure all commands in this cog are guild-only."""
        if ctx.guild is None:
            return False
        return True

    # ==================== Helper Functions ====================

    async def _fetch_tenor_gif(self, query: str, limit: int = 10) -> Optional[str]:
        """Fetch a random GIF from Tenor."""
        if not TENOR_API_KEY:
            return None
        try:
            import random
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"https://tenor.googleapis.com/v2/search?q={query}&key={TENOR_API_KEY}&limit={limit}"
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        if data.get("results"):
                            result = random.choice(data["results"])
                            return result["media_formats"]["gif"]["url"]
        except Exception as e:
            print(f"Tenor error: {e}")
        return None

    async def _fetch_webpage_content(self, url: str) -> Optional[str]:
        """Fetch text content from a webpage."""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=10) as resp:
                    if resp.status == 200:
                        text = await resp.text()
                        # Basic HTML to text conversion
                        import re
                        text = re.sub(r"<script[^>]*>.*?</script>", "", text, flags=re.DOTALL)
                        text = re.sub(r"<style[^>]*>.*?</style>", "", text, flags=re.DOTALL)
                        text = re.sub(r"<[^>]+>", " ", text)
                        text = re.sub(r"\s+", " ", text).strip()
                        return text[:15000]
        except:
            pass
        return None

    # ==================== Commands ====================

    @commands.command()
    @commands.cooldown(1, 30, commands.BucketType.user)
    async def draw(self, ctx: commands.Context, *, prompt: str):
        """Generate an image from a text prompt. Usage: !draw <prompt>"""
        if not self.draw_enabled:
            await ctx.send("Image generation is currently disabled.")
            return

        async with ctx.typing():
            try:
                res = await self.client.images.generate(
                    model=IMAGE_MODEL,
                    prompt=prompt,
                    response_format="b64_json"
                )

                if not res or not res.data or len(res.data) == 0:
                    await ctx.reply("Image generation returned no results. The model may be unavailable.")
                    return

                if not res.data[0].b64_json:
                    await ctx.reply("Image generation returned empty data. Try a different prompt.")
                    return

                image_data = base64.b64decode(res.data[0].b64_json)
                await ctx.reply(file=discord.File(io.BytesIO(image_data), "generated.png"))

            except Exception as e:
                print(f"Draw error: {clean_output(str(e))}")
                await ctx.reply("Failed to generate image. Try again later.")

    @commands.command()
    @commands.cooldown(3, 10, commands.BucketType.user)
    async def gif(self, ctx: commands.Context, *, query: str):
        """Search for a GIF. Usage: !gif <query>"""
        if not TENOR_API_KEY:
            await ctx.send("GIF search not configured.")
            return

        gif_url = await self._fetch_tenor_gif(query, limit=10)
        if gif_url:
            await ctx.send(gif_url)
        else:
            await ctx.send(f"No GIFs found for: {query}")

    @commands.command()
    async def summarize(self, ctx: commands.Context, count: int = 50):
        """Summarize recent messages. Usage: !summarize [count]"""
        if not self.chat_enabled:
            await ctx.send("AI chat is currently disabled.")
            return

        if count < 10 or count > 200:
            await ctx.send("Count must be between 10 and 200.")
            return

        async with ctx.typing():
            messages = []
            async for msg in ctx.channel.history(limit=count):
                if not msg.author.bot and msg.content:
                    messages.append(f"{msg.author.display_name}: {msg.content}")

            if len(messages) < 5:
                await ctx.send("Not enough messages to summarize.")
                return

            messages.reverse()

            try:
                response = await self.client.chat.completions.create(
                    model=AI_MODEL_FAST,
                    messages=[
                        {"role": "system", "content": "Summarize this Discord conversation concisely."},
                        {"role": "user", "content": "\n".join(messages)[:12000]},
                    ],
                    extra_body=get_extra_body(AI_MODEL_FAST),
                )

                embed = discord.Embed(
                    title=f"Summary (Last {count} messages)",
                    description=response.choices[0].message.content[:4000],
                    color=0x3498DB,
                )
                await ctx.send(embed=embed)

            except Exception as e:
                print(f"Summarize error: {clean_output(str(e))}")
                await ctx.send("Something went wrong. Try again later.")

    @commands.command()
    async def translate(self, ctx: commands.Context, lang: str, *, text: str):
        """Translate text to another language. Usage: !translate <language> <text>"""
        if not self.chat_enabled:
            await ctx.send("AI chat is currently disabled.")
            return

        async with ctx.typing():
            try:
                response = await self.client.chat.completions.create(
                    model=AI_MODEL_FAST,
                    messages=[
                        {"role": "system", "content": f"Translate to {lang}. Only respond with the translation."},
                        {"role": "user", "content": text},
                    ],
                    extra_body=get_extra_body(AI_MODEL_FAST),
                )

                embed = discord.Embed(title=f"Translation to {lang.title()}", color=0x3498DB)
                embed.add_field(name="Original", value=text[:1000], inline=False)
                embed.add_field(name="Translation", value=response.choices[0].message.content[:1000], inline=False)
                await ctx.send(embed=embed)

            except Exception as e:
                print(f"Translate error: {clean_output(str(e))}")
                await ctx.send("Something went wrong. Try again later.")

    @commands.command()
    async def tldr(self, ctx: commands.Context, url: str):
        """Get a TL;DR summary of a webpage. Usage: !tldr <url>"""
        if not self.chat_enabled:
            await ctx.send("AI chat is currently disabled.")
            return

        async with ctx.typing():
            content = await self._fetch_webpage_content(url)
            if not content:
                await ctx.send("Couldn't fetch that webpage.")
                return

            try:
                response = await self.client.chat.completions.create(
                    model=AI_MODEL_FAST,
                    messages=[
                        {"role": "system", "content": "Provide a concise TL;DR summary."},
                        {"role": "user", "content": content},
                    ],
                    extra_body=get_extra_body(AI_MODEL_FAST),
                )

                embed = discord.Embed(
                    title="TL;DR",
                    description=response.choices[0].message.content[:4000],
                    color=0x3498DB,
                )
                await ctx.send(embed=embed)

            except Exception as e:
                print(f"TLDR error: {clean_output(str(e))}")
                await ctx.send("Something went wrong. Try again later.")

    @commands.command()
    @commands.has_permissions(manage_guild=True)
    async def persona(self, ctx: commands.Context, name: str = None, *, custom: str = None):
        """Set the AI persona for this server. Usage: !persona <name|list|custom> [prompt]"""
        if name is None or name.lower() == "list":
            embed = discord.Embed(title="Available Personas", color=0x9B59B6)
            for pname, pdesc in DEFAULT_PERSONAS.items():
                embed.add_field(name=pname, value=pdesc[:100] + "...", inline=False)
            await ctx.send(embed=embed)
            return

        db = get_db()
        if name.lower() == "custom" and custom:
            await db.execute(
                "INSERT OR REPLACE INTO personas (guild_id, persona_name, custom_prompt) VALUES (?, ?, ?)",
                (str(ctx.guild.id), "custom", custom),
            )
            await ctx.send("Custom persona set!")
        elif name.lower() in DEFAULT_PERSONAS:
            await db.execute(
                "INSERT OR REPLACE INTO personas (guild_id, persona_name, custom_prompt) VALUES (?, ?, ?)",
                (str(ctx.guild.id), name.lower(), None),
            )
            await ctx.send(f"Persona set to **{name}**!")
        else:
            await ctx.send("Unknown persona. Use `!persona list` to see available options.")

    @commands.command()
    @commands.has_permissions(administrator=True)
    async def togglechat(self, ctx: commands.Context):
        """Toggle AI chat on/off for this server."""
        self.chat_enabled = not self.chat_enabled
        status = "enabled" if self.chat_enabled else "disabled"
        await ctx.send(f"AI chat is now **{status}**.")

    @commands.command()
    @commands.has_permissions(administrator=True)
    async def toggledraw(self, ctx: commands.Context):
        """Toggle image generation on/off for this server."""
        self.draw_enabled = not self.draw_enabled
        status = "enabled" if self.draw_enabled else "disabled"
        await ctx.send(f"Image generation is now **{status}**.")


async def setup(bot: commands.Bot):
    """Load the AI cog."""
    await bot.add_cog(AI(bot))
