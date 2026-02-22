# 🗂️ Lifestyle Tracker

A personal lifestyle tracker for finances (₦), health, sleep, and reading — built with React + Vite. All data is stored locally in the user's browser (`localStorage`). No backend. No database. No data ever leaves the device.

---

## 🚀 Deploy to Vercel (Recommended — ~5 minutes)

### Step 1 — Put the project on GitHub

1. Go to [github.com](https://github.com) and sign in (or create a free account)
2. Click **"New repository"** (the green button)
3. Name it `lifestyle-tracker`, set it to **Public** or **Private** (both work), click **Create repository**
4. On your computer, open a terminal in this project folder and run:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/lifestyle-tracker.git
git push -u origin main
```

> Replace `YOUR_USERNAME` with your actual GitHub username shown on the repo page.

---

### Step 2 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and click **"Sign Up"**
2. Choose **"Continue with GitHub"** — this connects your GitHub account
3. Click **"Add New Project"**
4. Find and select your `lifestyle-tracker` repository
5. Vercel will auto-detect it as a Vite project. Leave all settings as-is.
6. Click **"Deploy"**

That's it. In about 30 seconds you'll get a live URL like:
```
https://lifestyle-tracker-abc123.vercel.app
```

Every time you push changes to GitHub, Vercel redeploys automatically.

---

## 🌐 Alternative: Deploy to Netlify

1. Go to [netlify.com](https://netlify.com) → **Sign up with GitHub**
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose GitHub → select `lifestyle-tracker`
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Click **Deploy site**

---

## 💻 Run Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🔒 Security & Privacy

- **No server, no database** — all data lives in the user's own browser `localStorage`
- **No tracking, no analytics, no ads**
- **HTTPS enforced** by Vercel/Netlify automatically
- Security headers (XSS protection, CSP, etc.) are pre-configured in `vercel.json` and `netlify.toml`
- Users' data cannot be accessed by anyone else — not even you as the developer

### ⚠️ One thing to tell your users
Since data is stored in the browser, it will be lost if they:
- Clear their browser data / cookies
- Switch to a different browser or device

Consider adding an export feature so users can back up their data as a JSON file.

---

## 📁 Project Structure

```
lifestyle-tracker/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx          # Main application (all components)
│   ├── main.jsx         # React entry point
│   └── index.css        # Global reset styles
├── index.html           # HTML shell
├── vite.config.js       # Vite configuration
├── package.json         # Dependencies
├── vercel.json          # Vercel deployment + security headers
├── netlify.toml         # Netlify deployment config
└── .gitignore
```

---

## 🛠️ Built With

- [React 18](https://react.dev)
- [Vite 5](https://vitejs.dev)
- Google Fonts (Playfair Display + DM Sans)
- Zero external runtime dependencies
