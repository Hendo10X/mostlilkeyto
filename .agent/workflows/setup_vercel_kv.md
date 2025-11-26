---
description: How to set up Vercel KV for persistent storage
---

# Setting up Vercel KV

Vercel KV (Redis) is required for your polls to persist when deployed to Vercel.

## Step 1: Create the Database
1.  Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2.  Select your project (`mostlikeyto`).
3.  Click on the **Storage** tab at the top.
4.  Click **Create Database**.
5.  **Select "Upstash"** (or "Redis") from the Marketplace list. Vercel KV is powered by Upstash.
6.  Click **Create**.
7.  Select the **Region** that matches your Function Region (usually `iad1` or similar).
8.  Click **Create**.

## Step 2: Connect to Project
1.  Once created, you should see a "Connect to Project" screen (or go to the database settings).
2.  Ensure your `mostlikeyto` project is selected.
3.  Click **Connect**.

## Step 3: Environment Variables
Vercel automatically adds the necessary environment variables (`KV_URL`, `KV_REST_API_URL`, etc.) to your project when you connect the database.

**To verify:**
1.  Go to your Project Settings > **Environment Variables**.
2.  You should see variables starting with `KV_`.

## Step 4: Redeploy
For the new environment variables to take effect, you must **redeploy** your application.
1.  Go to the **Deployments** tab.
2.  Click the three dots (`...`) next to your latest deployment.
3.  Select **Redeploy**.

## Step 5: Local Development (Optional)
If you want to use the same database locally:
1.  Run `npx vercel env pull .env.local` in your terminal.
2.  This will download the `KV_*` variables to your local `.env` file.
