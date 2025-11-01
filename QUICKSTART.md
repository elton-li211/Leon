# ⚡ LEON FINANCE - QUICK START GUIDE

Get the app running in **under 2 minutes**.

---

## 🚀 Step-by-Step Installation

### Step 1: Prerequisites Check

```bash
# Check Node.js version (need 18+)
node --version

# If not installed: Download from https://nodejs.org/
```

### Step 2: Install Dependencies

```bash
# Navigate to project
cd Leon

# Install everything (this installs root, backend, and frontend)
npm run install:all
```

**Expected output:**
```
✓ Root dependencies installed
✓ Backend dependencies installed
✓ Frontend dependencies installed
```

**Time**: ~60 seconds

### Step 3: Environment Setup (Optional for MVP)

```bash
# Copy the example file
cp .env.example .env

# For MVP: You don't need to edit .env
# The app works with mock data (RIOT & NVDA)
```

**To use real AI APIs** (optional):
```bash
# Edit .env and add:
GROK_API_KEY=your_xai_api_key_here
PERPLEXITY_API_KEY=your_perplexity_key_here
```

### Step 4: Start the App

```bash
# Start both frontend and backend concurrently
npm run dev
```

**Expected output:**
```
═══════════════════════════════════════════════════════════
🚀 LEON FINANCE v3.0 - Backend Server Running
═══════════════════════════════════════════════════════════

📡 Server: http://localhost:3001
🗄️  Database: SQLite (leon.db)
🤖 AI: Grok + Perplexity ✓

Ready for requests!
═══════════════════════════════════════════════════════════

VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Time**: ~5 seconds

### Step 5: Open the App

1. Open browser: **http://localhost:5173**
2. You should see the LEON FINANCE dashboard

---

## 🎯 Try It Out!

### Test 1: Analyze RIOT

1. In the chat input, type: **`Analyze RIOT`**
2. Press **Send** or hit **Enter**
3. Watch the conviction grid appear!

**Expected Result**:
- Overall Conviction: **8.2/10**
- 5 dimensions displayed (Technical, Fundamental, etc.)
- Each dimension expandable

### Test 2: Analyze NVDA

1. Type: **`Analyze NVDA`**
2. Send
3. See NVIDIA's conviction grid

**Expected Result**:
- Overall Conviction: **9.1/10**
- Different scores than RIOT

### Test 3: Expand Dimension

1. Click on **"📈 Technical"**
2. See detailed sub-scores
3. Read AI reasoning from Grok and Perplexity

---

## 🛠️ Troubleshooting

### Problem: Port 3001 already in use

**Solution**:
```bash
# Kill the process using port 3001
kill -9 $(lsof -ti:3001)

# Or change the port in .env:
PORT=3002
```

### Problem: Port 5173 already in use

**Solution**:
```bash
# Kill the process
kill -9 $(lsof -ti:5173)
```

### Problem: Dependencies failed to install

**Solution**:
```bash
# Clear caches
rm -rf node_modules backend/node_modules frontend/node_modules
rm package-lock.json backend/package-lock.json frontend/package-lock.json

# Reinstall
npm run install:all
```

### Problem: Database error

**Solution**:
```bash
# Delete and recreate database
rm backend/leon.db

# Restart the app (DB will auto-create)
npm run dev
```

### Problem: Frontend can't connect to backend

**Check**:
1. Backend is running (terminal shows "Server Running")
2. No errors in backend terminal
3. Visit: http://localhost:3001/api/health
4. Should see: `{"status":"healthy","timestamp":"..."}`

---

## 📱 Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:5173 | Main UI |
| **Backend** | http://localhost:3001 | API Server |
| **API Health** | http://localhost:3001/api/health | Check backend status |
| **Database** | `backend/leon.db` | SQLite file |

---

## 🧪 Verify Everything Works

Run through this checklist:

- [ ] Frontend loads without errors
- [ ] Backend shows "Ready for requests!"
- [ ] Chat: "Analyze RIOT" → Grid appears
- [ ] Chat: "Analyze NVDA" → Different grid
- [ ] Click dimension → Expands
- [ ] Sub-scores visible
- [ ] AI reasoning visible
- [ ] Progress bars animate
- [ ] No console errors

---

## 📊 What You're Seeing

### Mock Data

The MVP uses **pre-loaded mock data** for RIOT and NVDA:

- **RIOT**: Conviction 8.2/10 (HPC Pivot narrative)
- **NVDA**: Conviction 9.1/10 (AI leader)

### Real Data (Optional)

To use **real AI analysis**:

1. Get API keys:
   - Grok: https://x.ai/api
   - Perplexity: https://perplexity.ai/api

2. Add to `.env`:
   ```bash
   GROK_API_KEY=xai-...
   PERPLEXITY_API_KEY=pplx-...
   ```

3. Edit `backend/services/analysis.js`:
   ```js
   // Line ~30: Change true to false
   const gridData = await generateConvictionGrid(symbol, false);
   ```

4. Restart app

**Cost**: ~$0.01 per analysis (5 AI calls)

---

## 🎉 Success!

You now have a working investment analysis platform!

**Next Steps**:
1. Read `README.md` for full documentation
2. Check `BUBBLE_MIGRATION.md` for Bubble.io migration
3. Explore the code (well-commented)
4. Customize for your needs

---

## 📞 Help

**Common questions**:

Q: Can I add more stocks?
A: Yes! Add to `backend/database.js` in `seedMockData()` function

Q: Can I deploy this?
A: Yes! See README.md → Deployment section

Q: How do I migrate to Bubble?
A: See `BUBBLE_MIGRATION.md` for complete guide

Q: Real API costs?
A: ~$0.01 per stock analysis with real Grok + Perplexity calls

---

**Enjoy your investment operating system! 🚀**
