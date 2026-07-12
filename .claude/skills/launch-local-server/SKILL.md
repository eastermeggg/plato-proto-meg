---
name: launch-local-server
description: Launch or relaunch the local Create React App dev server for the Norma prototype. Use when the user asks to "launch the local server", "start the dev server", or "relaunch local server".
---

# Launch local server

This repo (`plato-proto-meg`) is a Create React App (react-scripts 5) frontend. Its
dev server is started with `npm start`, which reads the port from the `PORT`
environment variable and the `BROWSER` variable to control browser auto-open.

Steps:

1. **Choose the port.** Use `$CONDUCTOR_PORT` when set (Conductor assigns one per
   workspace), otherwise `3000`.

2. **Ensure dependencies.** If `node_modules` is missing, run `npm install` first.

3. **Free the port** so a stale server doesn't block it:
   ```bash
   lsof -nP -iTCP:"${CONDUCTOR_PORT:-3000}" -sTCP:LISTEN -t 2>/dev/null | xargs kill -9 2>/dev/null; true
   ```

4. **Start the server in the background** (it must keep running across turns), with
   browser auto-open disabled and output tee'd to a log. Use `run_in_background: true`:
   ```bash
   BROWSER=none PORT="${CONDUCTOR_PORT:-3000}" npm start > /tmp/norma-start.log 2>&1
   ```

5. **Wait for the first compile result, then report.** Poll the log until it shows a
   compile outcome (use a `run_in_background` `until` loop so you're notified once):
   ```bash
   until grep -qE "Compiled successfully|Compiled with warnings|Failed to compile" /tmp/norma-start.log 2>/dev/null; do sleep 1; done
   grep -m1 -E "Compiled successfully|Compiled with warnings|Failed to compile" /tmp/norma-start.log
   ```
   - On success → report `http://localhost:${CONDUCTOR_PORT:-3000}`.
   - On "Failed to compile" → surface the error lines from `/tmp/norma-start.log`.

Notes:
- Do **not** run `npm run build` — that's the production build, not the dev server.
- "Compiled with warnings" is normal here (pre-existing lint warnings); it still serves.
