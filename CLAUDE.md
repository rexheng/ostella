# Ostella — project notes for Claude

This file exists so a future Claude session can get useful quickly without re-deriving context. It does **not** duplicate the spec or the global `~/.claude/CLAUDE.md`.

## Read this first

**Canonical design spec:** `docs/superpowers/specs/2026-04-10-ostella-mvp-design.md`

Every architectural decision, type contract, screen, phase plan, and definition-of-done lives there. If something in this file contradicts the spec, the spec wins — update this file to match.

## What this project is

A Vercel-deployed Next.js pitch MVP of a perimenopause bone-health risk triage tool for NHS GPs. One practice, one synthetic cohort in `data/patients.json`, a transparent linear risk model, GP-in-the-loop email workflow, patient portal with education + self-referral. The full product story is in the spec's §1–§2.

## Non-obvious invariants

These are easy to get wrong and hard to catch in code review.

1. **The risk model ships as a STUB.** `lib/model-weights.ts` has literature-plausible placeholder coefficients behind a visible banner. Verified clinical weights come from Rex's teammates later (task #8). Never remove the banner or claim the values are clinical. The *interface* is frozen — add features only by first updating `lib/types.ts` and the spec's §4.4 + §7.3.

2. **Email delivery ships as a STUB.** `/api/send-alert` always returns `{ simulated: true, ... }`. Real Resend integration is deferred (task #12). Do not add `@resend/node` or any `RESEND_API_KEY` reads until that task activates.

3. **No database, no auth, no persistence.** `patients.json` is the source of truth. The only "state" is `DemoState` in a cookie (see spec §4.4). Do not add Prisma, Supabase, NextAuth, Clerk, or any KV store, ever, for this MVP. If a feature seems to need persistence, it is out of scope.

4. **Phase 1 runs three parallel subagents.** GP view (`app/demo/gp/*`), Patient view (`app/demo/patient/*`), Marketing landing (`app/(marketing)/*`). Their file trees must not overlap. The contract between them is `lib/types.ts` + `data/patients.json` + `lib/risk-model.ts`, all frozen in Phase 0. When working on any Phase 1 surface, never touch files outside your subagent's ownership list in spec §5.

5. **`/demo/patient` defaults to Sarah Chen (`p-001`).** The demo flow depends on this. Other patients are only reachable via `?as=<id>`. Do not change the default without re-verifying §12 Definition of Done still passes.

6. **Only the high-risk email template exists.** Moderate and low tiers have no Send button. If you think you need a second template, re-read spec §9.3 first.

7. **Weights, simulation, and paper move in lockstep.** If you edit any coefficient in `lib/model-weights.ts`, three other places MUST be updated in the same change:
   - `scripts/simulate_cohort.py` — the `BETA`, `STAGE_BETA`, and `ETHNICITY_BETA` dicts mirror the TS weights numerically.
   - `docs/paper/simulate_cohort.py` — identical copy of the canonical script, kept alongside the .tex so Overleaf uploads are self-contained. Always `cp scripts/simulate_cohort.py docs/paper/simulate_cohort.py` after editing the canonical one.
   - `docs/paper/ostella-risk-model.tex` — Table 2 (Adopted coefficients), Table 9 (Example C counterfactual), Appendix C (multiplier derivation), and all cohort-summary / counterfactual numbers in §3 are hand-transcribed from a simulation run. Re-run the script with `python scripts/simulate_cohort.py` (seed 20260410), then re-transcribe. The paper is pre-clinical / methodological — never reframe it as a clinical validation.

## File locations that matter

| Thing | Where |
|---|---|
| Shared TypeScript types (frozen contract surface) | `lib/types.ts` |
| Risk scoring function | `lib/risk-model.ts` |
| Placeholder coefficients (STUB) | `lib/model-weights.ts` |
| Patient loader | `lib/patients.ts` |
| Demo role + active-patient cookie | `lib/demo-state.ts` |
| Synthetic cohort | `data/patients.json` |
| High-risk email template | `lib/email-templates.ts` |
| Design tokens | `tailwind.config.ts` + theme file |
| Model calibration memo (research-only) | `docs/model-calibration.md` |
| Per-coefficient decision log | `docs/model-weights-rationale.md` |
| Overleaf working paper (methodological) | `docs/paper/ostella-risk-model.tex` |
| Canonical simulation + counterfactual script | `scripts/simulate_cohort.py` (seed `20260410`) |
| Script mirror for Overleaf self-contained upload | `docs/paper/simulate_cohort.py` |
| Last simulation-run JSON (reproducibility) | `scripts/simulate_cohort_results.json` |

## What NOT to add without asking

- Any new dependency beyond Next.js, Tailwind, shadcn/ui primitives, and whatever `pnpm create next-app` scaffolds.
- Any file outside the tree in spec §4.1.
- Any feature that requires a round-trip to a database, a third-party API, or an env var that isn't already documented.
- Any "while we're at it" refactor of files the current task didn't explicitly touch.

## Deploy target

Vercel. The repo should `vercel deploy` with zero environment variables required. If you find yourself reaching for an env var, you are probably violating one of the stubs above.

## Deployed

- **Production:** https://ostella.vercel.app
- **First deploy:** 2026-04-10 (tag `v0.1.0-mvp`, commit `865dbe3`)
- **Redesign deploy:** 2026-04-10 (tag `v0.2.0-redesign`, commit `3783649`) — sage/lavender/cream palette, DM Sans + Fraunces, investor-framed landing with standards marquee, two-tier GP worklist, editorial patient portal
- **Vercel project:** `ostella` (under `rexheng` scope)
- **Deploy command:** `vercel --prod --yes` from the repo root — no env vars, no link prompt after the first run.
- **Pre-deploy hygiene on Windows:** `rm -rf .next` before every `pnpm build` if OneDrive is syncing the repo — OneDrive.Sync.Service holds file handles on `.next` and causes spurious `Cannot find module './XXX.js'` errors. Subagents have hit this repeatedly.
