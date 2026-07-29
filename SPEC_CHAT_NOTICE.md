# Spec - Chat composer notice (document analysis + usage quotas)

**Status**: v1 (UX prototype; `ChatComposerNotice` component)
**Author**: Meg
**Scope**: The banner that caps the chat composer (Plato Master). One component, five states: document analysis in progress, weekly quota approaching (~90%), weekly quota reached (100%, chat blocked), cancelled trial ending soon, and trial expired without conversion (chat blocked). Based on the Figma "ChatInput" node (Plato - Design, `1081:50926`). This spec also covers the wider free-trial flow (auto-converting 7-day trial): the trial card, the top banner, and the settings surfaces. UI copy stays in French (product language); this spec describes it in English.

---

## Why

The composer had to carry three contextual messages that lived inconsistently before: a thin "Plato analyse vos documents…" bar and a separate peach card for the exhausted quota. The middle tier was also missing - warning the user *before* the block.

We wanted a single, coherent object that:
- reassures while Plato reads the dropped documents (the "rappel dans le chat");
- warns the user as they approach their weekly quota, with a link to their usage;
- blocks the chat once the quota is spent, offering the upgrade path.

## How it works

The banner is not a strip sitting inside the composer: it is a **tinted frame that englobes** the white input area. The outer wrapper (rounded corners, tinted fill, 1px padding) leaves a coloured hairline showing around the white `rounded-6` input, and the notice row caps the top of that frame. The input, the action bar, and the hairline read as a single unit.

Only one state shows at a time, by priority: **quota reached > analyzing > quota approaching**.

- **Analyzing (document load)** - stone tint `#e5e3da`, dark text, the `plato-thinking` gif. « Analyse des documents en cours… ». The composer is **locked** during analysis (dimmed placeholder; joindre / ampoule / micro buttons inert). The send-button behavior is an open decision - see below. Under the hood this is the existing `chatBlocked` state, which already feeds `chatLocked`.
- **Quota approaching (~90%)** - amber tint `#ecdbc9`, text `#855b31`, filled-bolt icon. « 92% de votre quota d'utilisation hebdo utilisé » + a **« Voir → »** link to *Mon usage*. Non-blocking: the user keeps chatting.
- **Quota reached (100%)** - mauve tint `#e5d4d2`, text `#7f1d1d`. « Quota hebdomadaire atteint - Upgrade » + a **« Voir → »** link that opens the upgrade request. The composer is **locked** (input and buttons disabled).
- **Trial ending (`trial-end` + cancelled, ~1 day left)** - amber tint `#ecdbc9`, text `#855b31`, clock icon. « Essai annulé - se termine demain » + a **« Voir → »** link to *Mon usage*. Non-blocking. **Only on the cancelled path**: with auto-renewal on, nothing changes for the user at day 7, so the chat stays silent (the top banner carries the billing transparency instead).
- **Trial ended (`trial-over`)** - mauve tint `#e5d4d2`, text `#7f1d1d`, clock icon. « Essai terminé - Abonnement non démarré » + a **« Voir → »** link that resumes the subscription (admin) or asks for access (member). The composer is **locked**; access falls back to read-only (`myPlan` becomes null, exactly like `none`).

The *comfortable* trial shows **no** composer notice - only the sidebar trial card carries the countdown. The chat only ever interrupts when access loss is actually coming.

### Wiring

In `renderChatSidebar`, a single `composerNotice` value is derived by priority (block > analysing > warn):
- `quota-full` if `outOfQuota` (`quotaFill === 'full'`, an active licence);
- else `trial-ended` if `trialOver` (`billingState === 'trial-over'`);
- else `analyzing` if `chatBlocked` (document analysis running);
- else `trial-ending` if `trialEnding` (`billingState === 'trial-end'` **and** `trialCancelled`);
- else `quota-warning` if `nearQuota` (`myQuotaPct >= 90`, an active licence);
- else nothing.

Locking the chat in `quota-full` / `trial-ended` reuses the existing `chatLocked` (placeholder + disabled state), so there is no new lock logic - `trialOver` is added to the `chatLocked` disjunction.

### The trial model: card on file, auto-conversion

At signup the admin enters the card and picks the licences; **the whole cabinet trials 7 days together**, then the subscription **starts automatically** - unless the admin cancels during the trial. Consequences for the UX:

- **End of trial is a billing-transparency moment, not an access-loss moment.** The J-1 message on the renewing path is « votre abonnement démarre automatiquement (X licences · Y € HT/mois) » - calm blue, no alarm, no surprise charge. Amber/mauve are **reserved for the cancelled path**, the only one where read-only is actually coming. `trial-over` always means "cancelled and expired" (payment failure is out of scope).
- **Roles**: only the admin (card holder) manages the renewal - « Annuler l'essai » / « Reprendre l'abonnement » (`cancelTrial` / `resumeSubscription`; resuming after expiry reactivates the account in the demo). A member is informed but never pressured: no J-1 banner on the renewing path (nothing changes for them), « Demander l'accès » (ask-admin dialog) if the cabinet lapses.

### The trial surfaces across the three levels

The trial lifecycle is split from the weekly quota - a 7-day rolling trial and a Monday-reset quota are two different clocks, so they never share a card:

- **Trial card** (`renderTrialCard`) - THE trial object, one self-contained card. Full variant = the day clock (« Jour X sur 7 » serif count-up + 7-segment bar) + **one status sentence** (admin: « Premier prélèvement le {date} - X licences · Y € HT/mois, annulable à tout moment »; member: neutral timeline; cancelled/expired: amber loss message) + **one role-aware action** (admin: « Annuler l'essai » / « Reprendre l'abonnement »; member: « Demander l'accès » on the loss path only). Rendered identically on *Mon usage* and *Plan et facturation* - no separate callout blocks anywhere. Compact (sidebar) = **pure status, no buttons** (clock + bar, plus the amber « Lecture seule le {date} » line once cancelled); the whole sidebar slot clicks through to Mon usage. While trialing the slot stacks the trial clock above the weekly quota gauge (`renderWeeklyQuotaCard`, pure consumption meter) - never one merged object; expired shows the clock alone.
- **Top banner** (`renderTrialBanner`) - full-width above the top nav, **home + matter levels**: J-1 renewing = blue transparency (admin only); J-1 cancelled = amber warning (everyone); expired = mauve resume/ask (everyone). On a dossier it only renders when the dossier is open, so it never stacks with the closed-dossier banner.
- **Settings** - *Mon usage*: « VOTRE ESSAI » (the trial card) then « USAGE HEBDO PENDANT L'ESSAI » (pure quota card). *Plan et facturation* (admin): the same « VOTRE ESSAI » card above the forfait table, which reads as "what will be charged". Both pages carry the shared billing demo switcher in their header.
- **Composer notices** - `trial-ending` (cancelled path only) and `trial-ended` (lock), as above.

## Key decisions

- **One component, three variants** - instead of three ad-hoc blocks scattered through the composer. `ChatComposerNotice` renders the row (icon + text + link); the tinted wrapper is drawn on the App side via `NOTICE_WRAP_BG`.
- **Englobing frame, not a laid-on strip** - the tinted hairline around the input (rather than a plain bar) makes notice + input read as one object. Faithful to the Figma node.
- **Priority quota > analyzing > warning** - one message at a time; the block wins, the transient analysis outranks the mere warning.
- **The 90% tier warns, it does not block** - the warning keeps the chat usable and points to *Mon usage*; only 100% locks.
- **No self-upgrade** - the 100% « Voir → » link opens the **request to an administrator** (consistent with the pricing model), not a direct plan change.
- **Filled bolt for quotas, gif for analysis** - the bolt ties the message to the usage/consumption theme; the gif keeps the analysis alive and personified by Plato.

## Developer choice: composer behavior while documents are processing

While documents are being analysed, the composer should not let the user stack a new request on a running analysis. **Developers should implement one of the two options below** (both block writing/sending; they differ on whether the user can abort):

- **Option A - send button becomes "cancel import" (Stop / □).** The input stays disabled (dimmed placeholder, inert joindre / ampoule / micro), but the send button swaps its up-arrow for a **Stop (□)** control that aborts the ingestion. The user cannot write or send, but keeps an escape hatch. Matches the Figma "Processing docs" state (`Lucide / square` in the send slot).
- **Option B - fully disable the chat.** The whole composer is inert - the user can neither write nor send nor cancel, and simply waits for the analysis to finish. Simplest; no cancel wiring needed.

Today's behavior is between the two: the input is disabled but the send button is merely *inert* (dimmed arrow, no action). Option A adds a Stop control and wires the cancel; Option B keeps the button disabled.

> Note: the original brief (Notion user story) asked *not* to block the chat during analysis (« on ne souhaite pas bloquer l'usage du chat pour autant »). Both A and B block input, so both diverge from that brief - worth confirming with product before building.

## Edge cases

- **Analysis + quota-approaching at the same time**: the transient analysis wins; the quota warning reappears once analysis finishes.
- **No licence (read-only)**: neither `quota-warning` nor `quota-full` shows (both require `billingState !== 'none'` and a plan); the usage banner never appears.
- **@mention menu**: the wrapper does not use `overflow: hidden` (which would clip the mention dropdown that opens above the input); rounding is applied corner by corner instead.
- **Truncation**: the row text truncates (`ellipsis`) so the « Voir → » link never wraps in the narrow chat.
- **Cancel during analysis** (if Option A is chosen): the Stop button aborts the ingestion and returns the composer to its default state; already-processed documents remain.

## Demo & workshop

- A demo tier **`high: 92%`** was added to `QUOTA_FILL_PCT`, with a "quota 92%" pill in the *Mon usage* demo switcher, to exercise the warning (nothing existed between 63% and 100% before).
- The *Mon usage* demo switcher pins the trial clock: **essai j1** (`trial-fresh`, 7 days left), **essai j3** (`trial`, 5 left), **essai j7** (`trial-end`, J-1), **essai fini** (`trial-over`), plus a **renouv. auto / annulé** toggle (`trialCancelled`) while trialing.
- Dedicated UI-kit page: **`/ui-kit/chat-composer-notice`** - a live demo (quota pills + an "analysing" toggle) and swatches of the five variants on a mock composer.
- Dedicated UI-kit page: **`/ui-kit/trial-flow`** - the whole trial flow explained: the two-path journey (auto-conversion vs cancellation), a live playground (persona × day × renewal pills driving the REAL components - banner, sidebar card, Mon usage card, composer notice), explanations of the deliberate silences (member J-1, renewing chat), and a "qui voit quoi" admin/member matrix.

## Out of scope

- **Backend / real quota** - UX prototype only; everything is driven by the demo switches (the real quota lives in a separate repo).
- **Fine multi-plan copy** in the 100% message - a single "Upgrade" label for now.
- **Enter/exit animation** of the banner - plain appearance, no dedicated transition.

## Related

- Figma: Plato - Design, node `1081:50926` ("ChatInput" - Processing docs / Limit reached / Quota reach states)
- Related spec: `SPEC_PRICING.md` (per-user licences + weekly quota, upgrade request)
- Code: `src/components/ChatComposerNotice.js`, wiring in `src/App.js` (`renderChatSidebar`)
