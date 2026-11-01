# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A standalone toolkit of small offline browser tools for staff payroll work in Iraqi government offices: calculating salary arrears for annual increments (علاوة) and promotions (ترفيع), printing the official change form (استمارة المتغيرات), and looking up grade/stage from a nominal salary on the civil-service salary ladder.

- This is an independent project, not tied to any one office. It's meant to be usable by any office that follows the same civil-service rules. **Don't hardcode a specific office, directorate, city or person** in code, UI text, docs or examples.
- Plain HTML/CSS/JS. **No build step, server, package manager, framework, test suite or linter.** Do not add any of these unless explicitly asked.
- Users open `index.html` directly from disk (`file://`) in a desktop browser, fill a form, and print on A4.
- **Never add real payroll data to this repo**: no real names, salaries, IBANs or employee IDs in code, docs, commits or test fixtures. Use obviously fake sample values.

## Language rules

- Code, comments, commit messages, READMEs and this file: **English**.
- Everything the office sees (UI labels, messages, toasts, printed sheets): **Arabic**. Pages are `lang="ar" dir="rtl"`.
- Numbers shown to users use **Eastern Arabic digits** (`٠١٢٣٤٥٦٧٨٩`) with `,` thousands separators; month names are the Iraqi ones (كانون الثاني … كانون الأول).
- Inputs accept Western or Eastern Arabic digits.

## Layout

```
index.html            hub: one tile per app, plus disabled "قريباً" placeholder tiles
styles.css            shared styles for all apps, including @media print and mobile rules
fonts.css             @font-face rules for the self-hosted fonts
fonts/                woff2 files (IBM Plex Sans Arabic 400–700, Vazirmatn 400/600/700; Arabic + Latin subsets)
shared/
  salary-ladder.js    SALARY_LADDER + findGradeAndLevel(), shared by all apps
combined/             احتساب فروقات العلاوة والترفيع: increments and/or promotion on one form (main calculator)
allowances/           احتساب فروقات العلاوة: increment arrears + printed form
promotions/           احتساب فروقات الترفيع: promotion arrears + printed form
grades/               الدرجة والمرحلة: grade/stage lookup from nominal salary
docs/form-ux-nng.md   form UX guidelines (NN/g) the apps follow
README.md             short English overview of the apps
```

Each app folder is `index.html` + `app.js`.

## Architecture constraints

- **Must work over `file://`.** Scripts are plain `<script src>` tags, not ES modules. No `import`/`export`, `fetch()` of local files, service workers, or anything else that needs an HTTP origin.
- **No external requests.** No CDNs, web fonts from Google, analytics or remote APIs. Office machines may be offline. Fonts are self-hosted in `fonts/`; new fonts must be added as local woff2 files with rules in `fonts.css`.
- Script order in each app page: `../shared/salary-ladder.js` first, then `app.js`. Apps reference shared files with `../` relative paths (`../styles.css`, `../fonts.css`, `../shared/...`).
- Globals from `shared/salary-ladder.js`:
  - `SALARY_LADDER`: 10 grades × 11 stages of nominal salaries in full dinars. Outer index = grade (الدرجة), inner = stage (المرحلة); both are presented 1-based.
  - `findGradeAndLevel(salary)`: exact-match lookup, returns `{ grade, level }` (1-based) or `null`. Non-matching salaries are normal (e.g. arrears-inflated amounts) and display as `—`.
  - Changing the ladder affects every app. Only change it when the official ladder changes.
- `allowances/app.js` and `promotions/app.js` deliberately follow the same structure and **duplicate helpers**: Eastern-digit formatting (`toEasternDigits`, `toEasternDigitString`, `formatNumber`, `formatPlainNumber`), `parseDateInput`, `monthLabel`, `formatNumericDate`, `eqTerm`, `summaryChip`, `escapeHtml`, `setFieldError`, toast and print handling. When fixing a bug in one copy, check the other. Don't extract them into a shared module unless asked; if you do, it must be a plain global script loaded before `app.js`.
- Flow in both calculator apps: field validation → calculate → render result HTML into `#result-content` → print.
- Use `escapeHtml()` for any user-entered text rendered via `innerHTML`.

## Calculation rules (do not change without explicit confirmation)

These encode office practice. Preserve the exact formulas and rounding.

### Allowances (علاوة), `allowances/app.js`
- Per increment: `salaryDifference = newSalary − currentSalary`.
- Difference months = whole months from the start month **up to but not including** the end month (`(end.year − start.year) × 12 + (end.month − start.month)`). Days are ignored.
- `differencesTotal = salaryDifference × differenceMonths`.
- Final amount = sum of all increments' `differencesTotal` **+ the last increment's `newSalary` once** (the salary-list amount for the end month).
- Up to 10 increments per form (`MAX_ALLOWANCES`). Each has its own current/new salary and from/to dates; the form has one allowance number and date for all of them.
- The end month must be later than the start month (at least 1 difference month).

### Promotions (ترفيع), `promotions/app.js`
- Always a **30-day month** (`DAYS_PER_MONTH = 30`).
- `salaryDifference = newSalary − oldSalary`.
- Partial start month: `partialDays = 30 − start.day`, `partialAmount = Math.round(salaryDifference × partialDays / 30)`.
- `monthSpan = (end.year − start.year) × 12 + (end.month − start.month)`.
- Total = `newSalary × monthSpan + partialAmount`. Same month (`monthSpan = 0`) → partial amount only.
- **Paying the full new salary (not the difference) for later months is intentional**: promoted staff were not paid at all for those months. Do not "fix" this.
- The end date must be day 30; the app normalizes it to day 30 automatically. Start day must be 1–30.

### Combined (علاوة / ترفيع / علاوة ثم ترفيع), `combined/app.js`
The main calculator. Its rules intentionally differ from the older apps:
- Type is a radio: increments only, promotion only, or increments then promotion (increments always come first).
- Increment months are counted as in `allowances/`: from the start month **up to but not including** the end month (`monthSpan`, at least 1); days are ignored. `differencesTotal = salaryDifference × months`.
- Promotion partial days **include the start day**: `partialDays = 30 − start.day + 1` (13 → 30 = 18 days), `partialAmount = Math.round(salaryDifference × partialDays / 30)`. Later months through the end month (end day 30, auto-normalized) pay the full new salary, as in `promotions/`.
- Final amount = all increment arrears + promotion arrears + **the last new salary once** (the salary for the month after the last period, shown on the sheet).
- **Exception, promotion only:** the final amount is the promotion arrears alone (step 4, or step 2 when the promotion starts and ends in the same month), with no salary added on top. Step 4 is labelled المبلغ النهائي and the الإجمالي block is not shown. Example: 471,000→509,000 from 2026-10-15 to 2026-11-30 → 38,000 × 16 ÷ 30 = 20,267 + 509,000 = 529,267.
- The promotion section has a required new job title (`new-job-title`). On the sheet, each period row carries its own letter (كتاب العلاوة / الأمر الإداري), and the promotion row also shows the job title change; the lines under the name hold only employee details.
- In "both" mode the promotion's old salary is read-only and equals the last increment's new salary, and each increment must end no later than the promotion's start month.
- Worked example: increment 465,000→471,000 from 2026-05-01 to 2026-10-30 (May–Sep, 5 × 6,000 = 30,000), promotion to 509,000 from 2026-10-13 (38,000 × 18 ÷ 30 = 22,800) → 30,000 + 22,800 + 509,000 = 561,800.

### Grades, `grades/app.js`
- The user types the salary **in thousands** (e.g. `380` → 380,000). Digits are captured via `beforeinput`, Eastern digits are normalized, leading zeros dropped, max 5 digits. The field displays the full formatted salary.
- Lookup is instant on every keystroke; no submit button.

## Forms and UX

Follow `docs/form-ux-nng.md`. Read it before changing form behavior. Key points:
- Visible `<label for>` on every field; placeholders are examples only, never the label.
- Mark optional fields with `<span class="optional">(اختياري)</span>`.
- Errors appear inline under the field (`<p class="error" id="<field-id>-error" hidden>`) and the field wrapper gets `.has-error`. Errors clear as soon as the user edits the field. On submit, focus moves to the first invalid field.
- One primary action per form (`احتساب الفروقات`), plus the print button on the result.
- Dates are text inputs (`class="date-input"`, `dir="ltr"`, `inputmode="numeric"`) accepting `YYYY-MM-DD` or `YYYY/MM/DD` in either digit set. Don't switch to `<input type="date">`; it can't express day 30 of every month and renders inconsistently in RTL.
- Salaries are `type="number"` inside `.input-with-suffix` with a `دينار` suffix.

Known gaps between the code and the guide (fix only when asked):
- Validation runs on submit; there is no inline validation on blur yet, which the guide recommends.
- Each calculator has a clear-all button (`.clear-fab`, a `type="reset"` with a confirm dialog), which the guide advises against. Keep it, because users rely on it.

## Drafts (localStorage)

- Form inputs are saved on every change and restored on load: `tools-allowances-v1` (allowances, which also migrates legacy keys `alawat-form-data-v2` and `alawat-form-data`) , `tools-promotions-v1` (promotions) and `tools-combined-v1` (combined). The combined app's organization name is stored separately in `tools-org-name-v1` and survives clearing the form.
- If you change a draft's shape, bump the key version or migrate old data; users may have drafts saved.
- Clearing the form removes the saved draft.

## Printing

- The printed sheet is the office deliverable. **Any change to result rendering or `styles.css` must be checked in print preview.**
- The organization name on the sheet header (`.sheet-org`) is an optional field in `combined/` (saved in `localStorage`), but still a hardcoded Arabic string in `allowances/app.js` and `promotions/app.js`. That's a known limitation: don't add more hardcoded office names anywhere, and when touching this, prefer making the name configurable (e.g. a field saved in `localStorage`) over editing the string.
- `@media print` in `styles.css`: A4, margins `9mm 10mm`, hides the form, header, buttons and toast (`.no-print`), shows `.sheet-header` (title, organization, today's date), and uses black/grey styling with `print-color-adjust: exact` for the highlighted amounts and the total box.
- Blocks and steps use `break-inside: avoid`. If content exceeds one page, `updatePrintContinuationNotice()` shows "يتبع في الصفحة التالية" at the bottom of page one. It's a height heuristic (A4 content height in px).
- Mobile layout switches to one column below 640px; that's for using the form on a phone, not for printing.

## Adding a new app

1. Create `<app>/index.html` + `<app>/app.js`, copying an existing app page's head (`lang="ar" dir="rtl"`, `../fonts.css`, `../styles.css`) and structure (`.page`, `.header` with `.back-link` to `../`).
2. Load `../shared/salary-ladder.js` before `app.js` if it needs the ladder.
3. Add a tile in `index.html` (`<a class="app-tile app-tile--live" href="<app>/" style="--i: N">`), and raise the start index of the "قريباً" placeholder loop so the grid stays balanced.
4. Reuse existing CSS classes (`.form`, `.section`, `.grid`, `.field`, `.steps`, `.equation`, `.eq-term`, `.total`, `.sheet-*`) before adding new ones. Add new styles to `styles.css`, including print rules if it prints.
5. Update `README.md` and this file.

## Verifying changes

There are no automated tests. Before calling a change done:
1. Open `index.html` from disk (not via a dev server) and navigate to the app.
2. Exercise the form: valid input, each validation error, Eastern Arabic digits, `/` and `-` date separators, reload (draft restored) and clear.
3. Check the numbers by hand for at least one case, plus edge cases (same month, year boundary, day 1 and day 30 for promotions, multiple increments).
4. Open print preview (A4) and check layout, page breaks and the continuation notice.
5. Check the browser console for errors and the layout at phone width.

If a headless browser is available, Playwright against `file://` paths works for scripted checks, but don't add test tooling to the repo unless asked.

## Conventions

- Vanilla JS, `const`/`let`, 2-space indentation, double quotes, semicolons. Match the surrounding code.
- Keep each app self-contained; small duplication is accepted over shared abstractions.
- Keep commits focused, one app or concern per commit where possible.
