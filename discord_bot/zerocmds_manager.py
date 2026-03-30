"""
Zero Commands Panel Manager - Admin Commands
Add these to bot.py or import as needed
"""

import json
import os
import discord
from discord.ext import commands


def setup_zerocmd_commands(bot):
    """Add all Zero Commands management commands to the bot"""

    @bot.command()
    @commands.has_permissions(administrator=True)
    async def addzerocmd(ctx, message_id: str, section: str, *, content: str):
        """Add a new command to the Zero Commands panel and update the embed.
        Usage: !addzerocmd <message_id> Tools <NEW_CMD> - Description here
        """
        try:
            config_path = os.path.join(os.path.dirname(__file__), 'zerocmds_config.json')
            with open(config_path, 'r', encoding='utf-8') as f:
                config = json.load(f)

            # Find the section
            section_found = False
            for field in config['fields']:
                if section.lower() in field['name'].lower():
                    # Smart formatting: only wrap <COMMAND> in backticks, not the description
                    if not content.startswith('`'):
                        # Check if it starts with <COMMAND>
                        if content.startswith('<'):
                            # Find the end of the command code
                            if '>' in content:
                                end_bracket = content.index('>')
                                command_code = content[:end_bracket + 1]
                                rest = content[end_bracket + 1:]
                                content = f"`{command_code}`{rest}"
                            else:
                                # No closing bracket, wrap whole thing
                                content = f"`{content}`"
                        else:
                            # Doesn't start with <, wrap whole thing
                            content = f"`{content}`"

                    # Add new line to the section
                    new_line = f"\n{content}"
                    field['value'] += new_line
                    section_found = True
                    break

            if not section_found:
                await ctx.send(f"❌ Section '{section}' not found. Available sections:\n" +
                              "\n".join([f"• {f['name']}" for f in config['fields']]))
                return

            # Save updated config
            with open(config_path, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=2, ensure_ascii=False)

            # Try to edit the original message
            try:
                message = await ctx.channel.fetch_message(int(message_id))

                # Regenerate embed from config
                color = int(config['color'], 16) if isinstance(config['color'], str) else config['color']
                embed = discord.Embed(
                    title=config['title'],
                    description=config['description'],
                    color=color
                )

                for field in config['fields']:
                    embed.add_field(
                        name=field['name'],
                        value=field['value'],
                        inline=field.get('inline', False)
                    )

                embed.set_footer(text=config['footer'])

                await message.edit(embed=embed)
                # Send confirmation that auto-deletes (only visible briefly to admin)
                await ctx.send(f"✅ Added to **{section}**!", delete_after=5)

                # Delete command message
                try:
                    await ctx.message.delete()
                except:
                    pass

            except discord.NotFound:
                await ctx.send(f"❌ Message not found.", delete_after=10)
            except ValueError:
                await ctx.send(f"❌ Invalid message ID.", delete_after=10)

        except Exception as e:
            await ctx.send(f"❌ Error: {e}", delete_after=10)


    @bot.command()
    @commands.has_permissions(administrator=True)
    async def removezerocmd(ctx, message_id: str, command_code: str):
        """Remove a command from the Zero Commands panel.
        Usage: !removezerocmd <message_id> <COMMAND_CODE>
        """
        try:
            config_path = os.path.join(os.path.dirname(__file__), 'zerocmds_config.json')
            with open(config_path, 'r', encoding='utf-8') as f:
                config = json.load(f)

            # Find and remove the command
            found = False
            for field in config['fields']:
                lines = field['value'].split('\n')
                new_lines = [line for line in lines if command_code not in line]
                if len(new_lines) != len(lines):
                    field['value'] = '\n'.join(new_lines)
                    found = True
                    break

            if not found:
                await ctx.send(f"❌ Command `{command_code}` not found in any section.")
                return

            # Save updated config
            with open(config_path, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=2, ensure_ascii=False)

            # Try to edit the original message
            try:
                message = await ctx.channel.fetch_message(int(message_id))

                # Regenerate embed from config
                color = int(config['color'], 16) if isinstance(config['color'], str) else config['color']
                embed = discord.Embed(
                    title=config['title'],
                    description=config['description'],
                    color=color
                )

                for field in config['fields']:
                    embed.add_field(
                        name=field['name'],
                        value=field['value'],
                        inline=field.get('inline', False)
                    )

                embed.set_footer(text=config['footer'])

                await message.edit(embed=embed)
                await ctx.send(f"✅ Removed `{command_code}`!", delete_after=5)

                try:
                    await ctx.message.delete()
                except:
                    pass

            except discord.NotFound:
                await ctx.send(f"❌ Message not found.", delete_after=10)
            except ValueError:
                await ctx.send(f"❌ Invalid message ID.", delete_after=10)

        except Exception as e:
            await ctx.send(f"❌ Error: {e}", delete_after=10)


    @bot.command()
    @commands.has_permissions(administrator=True)
    async def editzerocmd(ctx, message_id: str, command_code: str, *, new_content: str):
        """Edit a command's description in the Zero Commands panel.
        Usage: !editzerocmd <message_id> <COMMAND_CODE> New full line here
        """
        try:
            config_path = os.path.join(os.path.dirname(__file__), 'zerocmds_config.json')
            with open(config_path, 'r', encoding='utf-8') as f:
                config = json.load(f)

            # Smart formatting: only wrap <COMMAND> in backticks, not the description
            if not new_content.startswith('`'):
                if new_content.startswith('<'):
                    if '>' in new_content:
                        end_bracket = new_content.index('>')
                        command_code = new_content[:end_bracket + 1]
                        rest = new_content[end_bracket + 1:]
                        new_content = f"`{command_code}`{rest}"
                    else:
                        new_content = f"`{new_content}`"
                else:
                    new_content = f"`{new_content}`"

            # Find and edit the command
            found = False
            for field in config['fields']:
                lines = field['value'].split('\n')
                for i, line in enumerate(lines):
                    if command_code in line:
                        lines[i] = new_content
                        field['value'] = '\n'.join(lines)
                        found = True
                        break
                if found:
                    break

            if not found:
                await ctx.send(f"❌ Command `{command_code}` not found.")
                return

            # Save updated config
            with open(config_path, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=2, ensure_ascii=False)

            # Try to edit the original message
            try:
                message = await ctx.channel.fetch_message(int(message_id))

                # Regenerate embed from config
                color = int(config['color'], 16) if isinstance(config['color'], str) else config['color']
                embed = discord.Embed(
                    title=config['title'],
                    description=config['description'],
                    color=color
                )

                for field in config['fields']:
                    embed.add_field(
                        name=field['name'],
                        value=field['value'],
                        inline=field.get('inline', False)
                    )

                embed.set_footer(text=config['footer'])

                await message.edit(embed=embed)
                await ctx.send(f"✅ Updated `{command_code}`!", delete_after=5)

                try:
                    await ctx.message.delete()
                except:
                    pass

            except discord.NotFound:
                await ctx.send(f"❌ Message not found.", delete_after=10)
            except ValueError:
                await ctx.send(f"❌ Invalid message ID.", delete_after=10)

        except Exception as e:
            await ctx.send(f"❌ Error: {e}", delete_after=10)


    @bot.command()
    @commands.has_permissions(administrator=True)
    async def addsection(ctx, emoji: str, *, title: str):
        """Add a new section to the Zero Commands panel.
        Usage: !addsection 🎯 Advanced Features
        """
        try:
            config_path = os.path.join(os.path.dirname(__file__), 'zerocmds_config.json')
            with open(config_path, 'r', encoding='utf-8') as f:
                config = json.load(f)

            # Add new section
            new_section = {
                "name": f"{emoji} {title}",
                "value": "(Empty section - use !addzerocmd to add commands)",
                "inline": False
            }
            config['fields'].append(new_section)

            # Save updated config
            with open(config_path, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=2, ensure_ascii=False)

            await ctx.send(f"✅ Added new section: **{emoji} {title}**\n\nUse `!addzerocmd \"{title}\" <CODE> Description` to add commands!")

        except Exception as e:
            await ctx.send(f"❌ Error: {e}")


    @bot.command()
    @commands.has_permissions(administrator=True)
    async def removesection(ctx, *, section_name: str):
        """Remove a section from the Zero Commands panel.
        Usage: !removesection Tools
        """
        try:
            config_path = os.path.join(os.path.dirname(__file__), 'zerocmds_config.json')
            with open(config_path, 'r', encoding='utf-8') as f:
                config = json.load(f)

            # Find and remove section
            original_count = len(config['fields'])
            config['fields'] = [f for f in config['fields'] if section_name.lower() not in f['name'].lower()]

            if len(config['fields']) == original_count:
                await ctx.send(f"❌ Section '{section_name}' not found.")
                return

            # Save updated config
            with open(config_path, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=2, ensure_ascii=False)

            await ctx.send(f"✅ Removed section containing '{section_name}'!")

        except Exception as e:
            await ctx.send(f"❌ Error: {e}")


    @bot.command()
    @commands.has_permissions(administrator=True)
    async def listzerocmds(ctx):
        """List all sections and commands in the Zero Commands panel."""
        try:
            config_path = os.path.join(os.path.dirname(__file__), 'zerocmds_config.json')
            with open(config_path, 'r', encoding='utf-8') as f:
                config = json.load(f)

            embed = discord.Embed(
                title="📋 Zero Commands Configuration",
                description="All sections and commands currently in the panel",
                color=0x3498db
            )

            for field in config['fields']:
                # Truncate long values
                value = field['value']
                if len(value) > 1024:
                    value = value[:1000] + "..."
                embed.add_field(name=field['name'], value=value, inline=False)

            embed.set_footer(text=f"Total sections: {len(config['fields'])}")
            await ctx.send(embed=embed)

        except Exception as e:
            await ctx.send(f"❌ Error: {e}")
