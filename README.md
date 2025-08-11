# React + Supabase App

This is a React application built with TypeScript and Supabase, deployable to GitHub Pages.

## Prerequisites

- Node Version Manager (nvm)
- Node.js version 18 (installed via nvm)
- npm (comes with Node.js)
- A Supabase account and project

## Local Development Setup

1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd 5th_day_react_app
   ```

2. Set up Node.js with nvm:
   ```bash
   nvm install 18    # Install Node.js 18 if not already installed
   nvm use 18        # Switch to Node.js 18
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## Troubleshooting

If you encounter any issues with the development server:

1. Make sure you're using Node.js 18:
   ```bash
   node -v  # Should show v18.x.x
   ```

2. If using a different version, switch to Node.js 18:
   ```bash
   nvm use 18
   ```

3. If dependencies are causing issues, try cleaning and reinstalling:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## Available Scripts

- `npm run dev` - Starts the development server
- `npm run build` - Builds the app for production
- `npm run preview` - Locally preview the production build

## Environment Variables

The following environment variables are required:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase project anonymous key

## Deployment

This project is configured to deploy to GitHub Pages automatically when pushing to the main branch. Make sure to:

1. Set up your repository secrets for Supabase credentials:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
2. Enable GitHub Pages in your repository settings
3. Set the GitHub Pages source to GitHub Actions

## Tech Stack

- React 18
- TypeScript
- Vite 4
- Supabase
- GitHub Pages 