import os
import discord
import sqlite3
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()
DISCORD_TOKEN = os.getenv('DISCORD_TOKEN')

intents = discord.Intents.default()
intents.message_content = True
client = discord.Client(intents=intents)

def init_db():
    conn = sqlite3.connect('server_memory.db')
    c = conn.cursor()
    # Match schema with bot.py
    c.execute('''CREATE TABLE IF NOT EXISTS messages (
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 user_id TEXT, 
                 username TEXT, 
                 content TEXT, 
                 timestamp TEXT
                 )''')
    conn.commit()
    return conn

@client.event
async def on_ready():
    print(f'Logged in as {client.user}. Starting history scrape...')
    db_conn = init_db()
    c = db_conn.cursor()
    
    total_count = 0
    
    for guild in client.guilds:
        for channel in guild.text_channels:
            if channel.permissions_for(guild.me).read_message_history:
                print(f'Scraping #{channel.name}...')
                try:
                    async for message in channel.history(limit=200):
                        if not message.author.bot and not message.content.startswith('!'):
                            # Use isoformat() for TEXT timestamp
                            # Explicit columns to allow ID auto-increment
                            c.execute("INSERT INTO messages (user_id, username, content, timestamp) VALUES (?, ?, ?, ?)",
                                      (str(message.author.id), message.author.display_name, message.content, message.created_at.isoformat()))
                            total_count += 1
                except Exception as e:
                    print(f'Could not scrape {channel.name}: {e}')
    
    db_conn.commit()
    print(f'Done! Added {total_count} messages to memory.')
    await client.close()

if __name__ == '__main__':
    if not DISCORD_TOKEN:
        print("Error: DISCORD_TOKEN not found in .env")
    else:
        client.run(DISCORD_TOKEN)