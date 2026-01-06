# GitHub Pages Setup Instructions

This repository is now configured to automatically deploy the `/docs` folder to GitHub Pages using GitHub Actions.

## One-Time Setup Required

To enable GitHub Pages for your repository, follow these steps:

### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub: `https://github.com/CloudCompile/cloudgptapi`
2. Click on **Settings** (top menu)
3. In the left sidebar, click on **Pages** (under "Code and automation")

### Step 2: Configure the Source

1. Under "Build and deployment", find the **Source** dropdown
2. Select **GitHub Actions** (NOT "Deploy from a branch")
3. Save the changes

### Step 3: Deploy

The GitHub Actions workflow will automatically deploy your site when:
- You push changes to the `main` branch that affect the `docs/` folder
- You manually trigger the workflow from the Actions tab

### Step 4: Access Your Site

Once deployed (usually takes 1-2 minutes), your documentation will be available at:

```
https://cloudcompile.github.io/cloudgptapi/
```

## Manual Deployment

You can also manually trigger a deployment:

1. Go to the **Actions** tab in your repository
2. Click on **Deploy to GitHub Pages** workflow
3. Click **Run workflow**
4. Select the `main` branch
5. Click **Run workflow**

## Verifying Deployment

1. Go to the **Actions** tab
2. Look for the "Deploy to GitHub Pages" workflow run
3. Click on it to see the deployment progress
4. Once completed successfully, visit your GitHub Pages URL

## Troubleshooting

If the deployment fails:

1. Check the Actions tab for error messages
2. Ensure the `docs/` folder exists and contains `index.html`
3. Verify that GitHub Pages is enabled in Settings > Pages
4. Make sure the source is set to "GitHub Actions"

## Hosting Summary

Your frontend is now hosted in two places:

1. **Vercel**: Your primary deployment with full Next.js functionality
2. **GitHub Pages**: Static documentation site from the `/docs` folder

Both deployments are independent and serve different purposes:
- Vercel hosts the full application with API routes and dynamic features
- GitHub Pages hosts the static documentation for public access
