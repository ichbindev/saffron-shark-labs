# Migrating from npm to pnpm

**Status: not done.** This is the plan, not a record. The repo uses npm today.

## Why it is a small job here

The site has no workspaces, no postinstall scripts, no native dependencies, and eleven devDependencies with no runtime dependencies at all. The only consumers of the package manager are Netlify and CI, and both are one line each. `.npmrc` already carries `shamefully-hoist=true` — a pnpm-only setting someone added in anticipation, inert under npm.

The one thing that genuinely bites: **two lockfiles in the repo will break the Netlify build**, because Netlify picks its package manager by which lockfile it finds. `package-lock.json` has to be deleted in the same commit that adds `pnpm-lock.yaml`.

## Steps

1. **Generate the lockfile from the existing one**, so resolved versions do not move:

   ```bash
   corepack enable
   pnpm import          # reads package-lock.json -> pnpm-lock.yaml
   rm package-lock.json
   rm -rf node_modules
   pnpm install
   ```

2. **Pin the package manager** so CI, Netlify, and contributors all agree. In `package.json`:

   ```json
   "packageManager": "pnpm@9.15.0"
   ```

   Use whatever `pnpm --version` reports after `corepack enable`.

3. **Update the pre-commit hook command** in `package.json` — `npx` is npm's runner:

   ```json
   "simple-git-hooks": { "pre-commit": "pnpm dlx pretty-quick --staged" }
   ```

   Then re-run `pnpm exec simple-git-hooks` to rewrite `.git/hooks/pre-commit`.

4. **Update the `check` script**, which shells out to npm today:

   ```json
   "check": "pnpm lint && pnpm typecheck && pnpm test"
   ```

5. **Update `netlify.toml`:**

   ```toml
   [build]
     publish = "dist/"
     command = "pnpm build"
   ```

   Netlify detects `pnpm-lock.yaml` and installs with pnpm automatically. If it does not, set `NETLIFY_USE_PNPM = "true"` under `[build.environment]`.

6. **Update `.github/workflows/ci.yml`** — `pnpm/action-setup` must run _before_ `setup-node`, or the `cache: pnpm` line has no pnpm to find:

   ```yaml
   - uses: pnpm/action-setup@v4
   - uses: actions/setup-node@v4
     with:
       node-version: 20
       cache: pnpm
   - run: pnpm install --frozen-lockfile
   ```

   and change each `npm run <x>` step to `pnpm <x>`.

7. **Revisit `.npmrc`.** `shamefully-hoist=true` flattens `node_modules` and defeats most of what pnpm's strict layout buys you. Try the install without it first; keep it only if something actually fails to resolve.

8. **Update the docs** that name npm: `AGENTS.md` (Tech Stack, Commands, Things to Avoid) and `conventions/site-config-and-assets.md` (Build and deploy).

## Verify before merging

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm test:build
```

Then confirm the Netlify deploy preview builds green before merging — that is the only step this checklist cannot prove locally.

## What to expect to go wrong

- **A phantom dependency surfaces.** Something imports a package it never declared and got away with it under npm's flat tree. The fix is to add the real dependency, not to reach for hoisting.
- **`astro check` cannot find its types.** `@astrojs/check` and `typescript` are already direct devDependencies, so this should not happen; if it does, it is the strict layout doing its job.
