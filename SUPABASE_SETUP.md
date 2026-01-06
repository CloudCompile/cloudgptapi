# 🚀 Super Easy Supabase Setup Guide

Hey! Since you're the boss of this project, you need to set up your "Brain" (the database) so it can remember things like API keys and how many people are using your app.

Follow these simple steps and you'll be done in 2 minutes! 🍬

## Step 1: Go to your Supabase Dashboard
1. Open your browser and go to [Supabase.com](https://supabase.com).
2. Log in and click on your project (the one you made for CloudGPT).

## Step 2: Open the Magic Code Box (SQL Editor)
1. On the left side, look for a little icon that looks like this: `SQL` (It's called the **SQL Editor**).
2. Click **"+ New query"** at the top. This opens a blank page where you can paste magic code.

## Step 3: Paste the Magic Code
1. Open the file in this folder called `SUPABASE_SETUP.sql`.
2. Copy **EVERYTHING** inside that file.
3. Paste it into the blank page you just opened in Supabase.
4. Click the big **"Run"** button at the bottom right.

## What did we just do? 🧠
You just gave your app two notebooks:
*   **API Keys Notebook**: This remembers who is allowed to use your app.
*   **Usage Logs Notebook**: This writes down every time someone asks the AI a question, so you can see how popular your app is!

## Step 4: Check your Secrets! 🤫
Make sure your `.env.local` file has the right "Secret Keys" from your Supabase settings:
1. Go to **Project Settings** (the gear icon ⚙️).
2. Click **API**.
3. Copy the `URL` and `anon public` key and put them in your `.env.local` file.

**You're all set! Now go build something awesome! 🌈**
