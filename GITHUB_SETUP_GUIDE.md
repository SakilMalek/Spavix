# GitHub Setup Guide for SPAVIX

## Overview
This guide walks you through preparing the SPAVIX project for GitHub and making your first commit.

---

## STEP 1: Files Already Cleaned Up ✅

### Created Files:
- ✅ `.gitignore` (root) - Comprehensive ignore rules
- ✅ `backend/.gitignore` - Backend-specific rules
- ✅ `frontend/.gitignore` - Frontend-specific rules
- ✅ `.env.example` (root) - Template for root env vars
- ✅ `backend/.env.example` - Updated with all variables
- ✅ `frontend/.env.example` - Updated with API URL

### Files to Delete Manually:
The following files should be deleted before committing (they're in `.gitignore` but better to remove):

1. **backend_output/** - Generated output files
   - `input_1766648637589.jpg`
   - `input_1766648813911.jpg`
   - `input_1766668719659.jpg`
   - `output_1766648813911.png`
   - `output_1766668719659.png`

2. **frontend/** - Empty documentation files
   - `DARK_MODE_IMPLEMENTATION.md` (empty)
   - `DARK_MODE_SUMMARY.md` (empty)
   - `LOGO_SETUP_GUIDE.md` (empty)

3. **Root level** - Actual env files (will be ignored by git, but good practice to keep local)
   - `.env` (keep locally, don't commit)
   - `backend/.env` (keep locally, don't commit)
   - `frontend/.env.local` (keep locally, don't commit)

---

## STEP 2: Initialize Git Repository

If you haven't already initialized git:

```powershell
cd c:\vizara
git init
```

---

## STEP 3: Configure Git User (First Time Only)

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## STEP 4: Add Remote Repository

Create a new repository on GitHub (https://github.com/new), then:

```powershell
cd c:\vizara
git remote add origin https://github.com/YOUR_USERNAME/spavix.git
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## STEP 5: Stage and Commit Files

### Stage all files:
```powershell
cd c:\vizara
git add .
```

### Verify what will be committed:
```powershell
git status
```

You should see:
- ✅ All source files (src/, pages/, components/, etc.)
- ✅ Config files (package.json, tsconfig.json, etc.)
- ✅ `.env.example` files
- ✅ `.gitignore` files
- ❌ NOT `.env` files (ignored by .gitignore)
- ❌ NOT `node_modules/` (ignored by .gitignore)
- ❌ NOT `dist/`, `.next/`, `build/` (ignored by .gitignore)

### Make your first commit:
```powershell
git commit -m "Initial commit: SPAVIX room transformation app

- Frontend: Next.js 14 with React 18, TypeScript, Tailwind CSS
- Backend: Node.js/Express API with TypeScript
- Database: PostgreSQL with Neon
- AI: Hugging Face Stable Diffusion 2.1 integration
- Features: User auth, image upload, design styles, material customization"
```

---

## STEP 6: Push to GitHub

### For first push (create main branch):
```powershell
git branch -M main
git push -u origin main
```

### For subsequent pushes:
```powershell
git push
```

---

## STEP 7: Verify on GitHub

1. Go to https://github.com/YOUR_USERNAME/spavix
2. Verify all files are there
3. Check that `.env` files are NOT visible (they should be in .gitignore)
4. Check that `node_modules/` is NOT visible

---

## Environment Variables Setup for Others

When someone clones your repo, they need to:

1. **Backend setup:**
   ```powershell
   cd backend
   cp .env.example .env
   # Edit .env with actual values
   npm install
   npm run dev
   ```

2. **Frontend setup:**
   ```powershell
   cd frontend
   cp .env.example .env.local
   # Edit .env.local with actual values
   npm install
   npm run dev
   ```

---

## What Gets Committed

### ✅ WILL BE COMMITTED:
- All source code (src/, pages/, components/)
- Configuration files (package.json, tsconfig.json, etc.)
- `.env.example` files (templates only)
- `.gitignore` files
- README.md and documentation
- Public assets (public/)
- Styles and utilities

### ❌ WILL NOT BE COMMITTED:
- `.env` files (actual secrets)
- `node_modules/` directories
- `dist/`, `build/`, `.next/` (build outputs)
- `backend_output/` (generated files)
- IDE files (.vscode/, .idea/)
- OS files (Thumbs.db, .DS_Store)
- Log files (*.log)

---

## Security Checklist

Before pushing to GitHub:

- [ ] `.env` files are in `.gitignore` ✅
- [ ] No API keys in source code ✅
- [ ] No passwords in source code ✅
- [ ] `.env.example` has only placeholder values ✅
- [ ] `node_modules/` is in `.gitignore` ✅
- [ ] Build outputs are in `.gitignore` ✅

---

## Troubleshooting

### If you accidentally committed `.env`:
```powershell
git rm --cached .env
git commit -m "Remove .env file"
git push
```

### If you need to update .gitignore:
```powershell
git rm -r --cached .
git add .
git commit -m "Update .gitignore"
git push
```

### To see what git will ignore:
```powershell
git check-ignore -v *
```

---

## Next Steps

1. Create a proper `README.md` with:
   - Project description
   - Tech stack
   - Installation instructions
   - How to run locally
   - Environment variables needed
   - Contributing guidelines

2. Add a `LICENSE` file (MIT recommended)

3. Create `CONTRIBUTING.md` for contribution guidelines

4. Set up GitHub Actions for CI/CD (optional)

---

## Quick Reference Commands

```powershell
# Check git status
git status

# See what will be committed
git diff --cached

# See recent commits
git log --oneline -5

# Undo last commit (before push)
git reset --soft HEAD~1

# Undo last commit (after push)
git revert HEAD

# See all branches
git branch -a

# Create new branch
git checkout -b feature/your-feature-name

# Switch branches
git checkout main

# Merge branch
git merge feature/your-feature-name
```

---

## Questions?

Refer to:
- Git docs: https://git-scm.com/doc
- GitHub docs: https://docs.github.com
- Gitignore templates: https://github.com/github/gitignore
