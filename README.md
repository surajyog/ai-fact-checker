<div align="center">

</div>

# FactChecker (Open Source)

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

This repository is open‑source and released under the **MIT license**. Feel free to fork, modify, and share – vibe coded and built for the community.

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/temp/1

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```sh
   npm install
   ```
2. Add your Gemini API key by creating a file named `.env.local` with the following content:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```

> 💡 The production build can be generated with `npm run build` and served using `node serve.js`.


## Instant Web Interface (GitNexus)

If you'd rather not deal with local servers or hosting, you can use **GitNexus** to run this repository in the browser instantly. Just push the code to GitHub and open the project with GitNexus. The platform will build and serve the app for you with a live web interface – no manual hosting or configuration required.

1. Commit and push your repository to GitHub.
2. Visit `https://github.com/abhigyanpatwari/GitNexus` and open the project (or use the browser extension).
3. Browse the app, edit code, and see live preview without installing anything locally.

This is a great way to demo or experiment quickly without the usual development setup.

> 💡 The production build can be generated with `npm run build` and served using `node serve.js`.

---

By pushing this repo to GitHub you are sharing the code under MIT terms, so others can explore, contribute, and remix. Enjoy! Let the good vibes flow. 😊