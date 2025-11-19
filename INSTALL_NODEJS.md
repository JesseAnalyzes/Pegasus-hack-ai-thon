# Install Node.js (Required)

## The Problem

You're seeing this error:
```
npm : The term 'npm' is not recognized...
```

This means **Node.js is not installed** on your system.

## The Solution

### Step 1: Download Node.js

**Go to**: https://nodejs.org/

**Download**: The **LTS (Long Term Support)** version (recommended)
- Current LTS is Node.js 20.x or 22.x
- Click the big green button for Windows installer

### Step 2: Install Node.js

1. Run the downloaded installer (`node-v20.x.x-x64.msi` or similar)
2. Click "Next" through the installer
3. **Important**: Make sure "Add to PATH" is checked (it should be by default)
4. Accept the defaults and click "Install"
5. Wait for installation to complete
6. Click "Finish"

### Step 3: Restart PowerShell

**Close and reopen your PowerShell terminal** (or Command Prompt)
- This is required for the PATH changes to take effect

### Step 4: Verify Installation

In the new PowerShell window, run:

```powershell
node --version
```

Should show something like: `v20.11.0`

Then run:

```powershell
npm --version
```

Should show something like: `10.2.4`

### Step 5: Proceed with Nimbus Setup

Now you can continue with the Nimbus installation:

```powershell
# Navigate to project directory (if not already there)
cd C:\hackathon\Pegasus-hack-ai-thon

# Install dependencies
npm install

# Create .env.local file
# (Use notepad or your editor)
notepad .env.local

# Add these lines to .env.local:
# DATABASE_URL=postgresql://user:password@host:port/database?schema=team_pegasus
# ANTHROPIC_API_KEY=sk-ant-...

# Verify setup
npm run verify

# Run the application
npm run dev
```

## Quick Commands (After Node.js is installed)

```powershell
# Check if Node.js is installed
node --version
npm --version

# Install Nimbus dependencies
npm install

# Run Nimbus
npm run dev
```

## Alternative: Using Node Version Manager (Optional)

If you want more control over Node.js versions, you can use **nvm-windows**:

1. Go to: https://github.com/coreybutler/nvm-windows/releases
2. Download `nvm-setup.exe`
3. Install it
4. Then run:
   ```powershell
   nvm install 20
   nvm use 20
   ```

## Troubleshooting

### "node --version" still not found after install
- Make sure you **closed and reopened PowerShell**
- Restart your computer if needed
- Check if Node.js is in PATH: `$env:PATH -split ';' | Select-String node`

### Permission errors during npm install
- Run PowerShell as Administrator
- Or change npm cache location

### Still having issues?
- Uninstall Node.js completely
- Restart computer
- Reinstall Node.js
- Make sure to check "Add to PATH" during installation

## What is Node.js?

Node.js is a JavaScript runtime that allows you to:
- Run JavaScript on your computer (not just in browsers)
- Use npm (Node Package Manager) to install packages
- Run Next.js applications like Nimbus

It's **required** for any Next.js, React, or modern JavaScript development.

---

**Next**: After installing Node.js, return to `🚀_START_NOW.md` to continue setup.

