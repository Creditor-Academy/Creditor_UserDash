# GitHub Secrets Setup for CI/CD Pipeline

This document explains how to set up the required GitHub repository secrets for the CI/CD pipeline to work with Netlify deployments.

## Required Secrets

The CI/CD pipeline requires the following secrets to be configured in your GitHub repository:

### 1. NETLIFY_AUTH_TOKEN

- **Description**: Your Netlify personal access token
- **How to get it**:
  1. Log in to your Netlify account
  2. Go to User Settings → Applications → Personal access tokens
  3. Click "New access token"
  4. Give it a descriptive name (e.g., "GitHub Actions Deploy")
  5. Copy the generated token

### 2. NETLIFY_SITE_ID

- **Description**: The unique identifier for your Netlify site
- **How to get it**:
  1. Go to your Netlify site dashboard
  2. Navigate to Site Settings → General
  3. Find the "Site ID" under "Site details"
  4. Copy the site ID (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

## How to Add Secrets to GitHub Repository

1. Go to your GitHub repository
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add each secret:
   - Name: `NETLIFY_AUTH_TOKEN`, Value: [your Netlify token]
   - Name: `NETLIFY_SITE_ID`, Value: [your Netlify site ID]

## Workflow Behavior

- **Without secrets**: The CI/CD pipeline will run tests and build the application, but skip the Netlify deployment steps
- **With secrets**: The pipeline will run the full workflow including automatic deployments to Netlify

## Deployment Branches

- **Staging**: Deployments to staging environment happen on pushes to the `develop` branch
- **Production**: Deployments to production happen on pushes to the `main` branch

## Troubleshooting

If you see warnings about "Context access might be invalid" for Netlify secrets:

- This is expected if the secrets are not yet configured
- The warnings will disappear once you add the required secrets to your repository
- The workflow will still run successfully, just without the deployment steps
