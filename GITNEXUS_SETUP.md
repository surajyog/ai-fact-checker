# FactChecker — GitNexus WebContainer Setup

## Why we bundle a React SPA

FactChecker is a **pure frontend React app** — no Node.js backend, no API routes. It communicates directly with the Gemini API from the browser. You might reasonably ask: why does it need to be bundled for WebContainers if there's no server?

### Without bundling (raw repo in WebContainer)

When GitNexus tries to run the raw repository inside a WebContainer, this is what happens:

```
WebContainer starts
→ npm install (downloads react, vite, lucide, @google/genai, react-markdown...)
  → ~30–90 seconds of downloading inside a WASM sandbox
→ npm run dev (starts Vite dev server)
  → Vite compiles TypeScript, JSX, runs HMR... inside a browser tab
  → Slow, heavy, may timeout or crash
→ App appears (if everything worked)
```

This technically works — but it's slow, fragile, and wasteful. The user is running a full build toolchain (Vite, TypeScript compiler, esbuild) inside a WASM sandbox just to view a finished app.

### With gitnexus-bundler

```
Build pipeline (runs on your machine, once):
  vite build → dist/ (optimized HTML + JS + CSS, ~500KB total)
  gitnexus-bundler → serve.js + dist/ embedded → bundle.cjs (~600KB)

User runs the app:
WebContainer: node bundle.cjs
→ Express starts in ~1 second
→ Serves pre-compiled HTML/JS/CSS instantly
→ App is live at localhost:3000 in under 5 seconds
→ Zero npm install, zero compilation
```

The build toolchain never runs in the WebContainer. The user gets a pre-built, instantly-bootable version.

---

## How it works

### serve.js

A minimal Express server that serves the pre-built `dist/` folder as static files. This is the entry point for gitnexus-bundler.

```
serve.js → express.static('dist') → SPA fallback to index.html
```

No compilation. No Vite. Just serve static files.

### gitnexus.json

The manifest that tells GitNexus this repo is runnable:

```json
{
  "name": "factchecker",
  "entry": "serve.js",
  "buildCommand": "npm run build",
  "staticDir": "dist"
}
```

When GitNexus Web UI sees this file, it shows the **Run** button. Without it, no Run button.

### bundle.cjs

The output of `gitnexus-bundler build -i serve.js -s dist`:

- `serve.js` + all Express dependencies → compiled by esbuild → minified
- `dist/` files → embedded as Base64 strings inside the `.cjs`
- Result: one self-contained file, no external dependencies at runtime

---

## How to rebuild after code changes

```bash
# 1. Make your changes to the React code
# 2. Rebuild
npm run build

# 3. Re-bundle
npx gitnexus-bundler build -i serve.js -s dist

# 4. Host the new bundle.cjs on Cloudflare Pages or any CDN
# 5. Update gitnexus.json bundleUrl if needed
```

---

## WebContainer compatibility

| Feature | Status |
|---------|--------|
| Serving pre-built HTML/JS/CSS | ✅ Works |
| Direct browser → Gemini API calls | ✅ Works (outbound HTTP is allowed) |
| localStorage (API key storage) | ✅ Works |
| File upload (images, video) | ✅ Works |
| Native C++ addons | ❌ Not used (pure JS) |
| npm install at runtime | ❌ Not needed (pre-bundled) |

---

## Deploying bundle.cjs

Host `bundle.cjs` on any static CDN:

**Cloudflare Pages:**
```
Upload dist/ + bundle.cjs → Cloudflare Pages
Update gitnexus.json: "bundleUrl": "https://your-project.pages.dev/bundle.cjs"
```

**GitHub Releases:**
```
gh release create v1.0.0 bundle.cjs
```

Once hosted, the GitNexus Marketplace can reference the bundleUrl and users click **Run** → instant boot.
