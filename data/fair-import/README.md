# State Fair Slop — fair import

Preview listings use **2025 public sources** (official fair announcements). No third-party review opinions are imported.

## Commands

```bash
# Ensure venue shells (dry-run first)
npm run ensure:fair-venues -- --dry-run
npm run ensure:fair-venues -- --apply

# Menu import (ensures venues in dry-run preview; use --apply to write)
npm run import:fair-menu -- --fair=minnesota-state-fair --dry-run
npm run import:fair-menu -- --fair=all --dry-run
npm run import:fair-menu -- --fair=all --apply
```

## Fair slugs

- `minnesota-state-fair`
- `iowa-state-fair`
- `state-fair-of-texas`
- `wisconsin-state-fair`
- `the-big-e` (venue shell only — menu TODO)
