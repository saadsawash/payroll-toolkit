# Form UX/UI guidelines (NN/g primary)

Practical notes for implementers, drawn from Nielsen Norman Group articles as primary sources. W3C/WAI (and HTML semantics) appear only where they add accessibility or markup requirements.

**Scope note:** Guidelines below are paraphrased or quoted from the cited sources. Do not treat uncited bullets as NN/g claims.

---

## Summary principles

1. **Ask less.** Every field costs effort and completion rate. Cut what you can derive, defer, or omit. ([web-form-design](https://www.nngroup.com/articles/web-form-design/); [EAS](https://www.nngroup.com/articles/eas-framework-simplify-forms/))
2. **Structure the path.** Single column; group related fields; labels near fields; clear section headings. ([web-form-design](https://www.nngroup.com/articles/web-form-design/); [white-space](https://www.nngroup.com/articles/form-design-white-space/); [cognitive load](https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/))
3. **Labels always visible.** Place labels (and essential hints) outside empty fields. Avoid placeholders as labels or critical instructions. ([placeholders](https://www.nngroup.com/articles/form-design-placeholders/); [mobile checklist](https://www.nngroup.com/articles/mobile-input-checklist/))
4. **Be explicit about required vs optional.** Mark required fields; prefer also marking optional ones. Do not rely on a top-of-form instruction alone. ([required-fields](https://www.nngroup.com/articles/required-fields/); [cognitive load](https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/))
5. **Match control to content.** Field width ≈ expected input; prefer radios for 2–3 options over dropdowns; explain formats up front. ([web-form-design](https://www.nngroup.com/articles/web-form-design/); [cognitive load](https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/))
6. **Smart defaults carefully.** Defaults reduce decisions; users rarely change them—bad defaults cause errors and feel pushy. ([EAS](https://www.nngroup.com/articles/eas-framework-simplify-forms/))
7. **Help recover from errors.** Inline, next to the field; after the user finishes the field (not while typing/on focus); visible cues beyond color alone; preserve input. ([errors-forms](https://www.nngroup.com/articles/errors-forms-design-guidelines/); [error-message-guidelines](https://www.nngroup.com/articles/error-message-guidelines/); [hostile errors](https://www.nngroup.com/articles/hostile-error-messages/))
8. **One clear primary action.** Avoid Reset/Clear; Cancel only when it adds safety, and demote it visually. ([web-form-design](https://www.nngroup.com/articles/web-form-design/); [reset-cancel](https://www.nngroup.com/articles/reset-and-cancel-buttons/))
9. **Design for mobile friction.** Necessary fields only; label above; no placeholders; correct keyboard; visible values; defaults/device assist where useful. ([mobile checklist](https://www.nngroup.com/articles/mobile-input-checklist/))
10. **Lower cognitive load.** Structure, transparency, clarity, support—so users spend effort answering, not decoding the UI. ([cognitive load](https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/))

---

## Detailed guidelines (with citations)

### 1. Keep forms short / remove unnecessary fields

- **Guideline:** Eliminate unnecessary fields. Remove information that can be (a) derived another way, (b) collected later more conveniently, or (c) simply omitted. “Every time you cut a field or question from a form, you increase its conversion rate.”  
  Source: [Website Forms Usability: Top 10 Recommendations](https://www.nngroup.com/articles/web-form-design/)
- **EAS order of attack:** Eliminate first → Automate where possible → Simplify what remains. Ask why each field is needed, how data will be used, and whether it supports user/business goals; if you cannot justify it to users, do not collect it. Deprioritize nonurgent questions; use conditional logic so users never see irrelevant questions.  
  Source: [Less Effort, More Completion: The EAS Framework](https://www.nngroup.com/articles/eas-framework-simplify-forms/)
- **Optional fields:** First eliminate optional fields; if a few must remain (NN/g suggests limiting to about 1–2 when possible), label them clearly as optional—do not make users discover optionality by trial and error.  
  Source: [Website Forms Usability: Top 10 Recommendations](https://www.nngroup.com/articles/web-form-design/)

### 2. Labels vs placeholders

- **Definitions (NN/g):** Labels sit outside the field and tell users what belongs there. Placeholder text sits inside the field and usually disappears on typing.  
  Source: [Placeholders in Form Fields Are Harmful](https://www.nngroup.com/articles/form-design-placeholders/)
- **Best pattern:** Clear, visible labels outside empty form fields; put essential hints/instructions outside the field so they stay visible.  
  Source: [Placeholders in Form Fields Are Harmful](https://www.nngroup.com/articles/form-design-placeholders/)
- **Why placeholders hurt (selected):** Disappearing text strains short-term memory; without visible labels users cannot check work before submit; errors are harder to fix; Tab users miss disappearing hints; filled-looking fields are less noticeable; placeholders can be mistaken for autofilled data; sometimes users must manually delete them. Accessibility: poor contrast, higher burden for cognitive/motor impairments, not all screen readers announce placeholders.  
  Source: [Placeholders in Form Fields Are Harmful](https://www.nngroup.com/articles/form-design-placeholders/)
- **Floating labels:** Better than label-as-placeholder only, but still weaker than label + hint outside the field when space allows (fields with text remain less noticeable; may look prefilled).  
  Source: [Placeholders in Form Fields Are Harmful](https://www.nngroup.com/articles/form-design-placeholders/)
- **Cognitive-load restatement:** Keep label and help text outside; leave the input empty.  
  Source: [4 Principles to Reduce Cognitive Load in Forms](https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/)
- **A11y (secondary):** Associate visible labels with controls via `<label for="…">` matching the control `id`. For SC 3.3.2, the label must be visible.  
  Source: [WAI H44](https://www.w3.org/WAI/WCAG22/Techniques/html/H44)

### 3. Required vs optional marking

- **Mark required fields explicitly**—including when most fields are required. Users often ignore or forget top-of-form instructions such as “All fields are required unless marked optional.” Relying on scanning for the few “optional” marks increases interaction cost; many users guess and then hit submit errors.  
  Source: [Marking Required Fields in Forms](https://www.nngroup.com/articles/required-fields/)
- **How to mark:** Asterisk (familiar, compact) or the word “required.” Prefer the marker outside the field (especially on longer forms). Putting the asterisk at the start of the label can ease scanning. Red is conventional but not mandatory; avoid low-contrast gray.  
  Source: [Marking Required Fields in Forms](https://www.nngroup.com/articles/required-fields/)
- **Also mark optional fields** when you keep them: reduces inference load; “not obligatory… but… a nice perk.” Cognitive-load article: mark required *and* explicitly mark optional so users feel safe skipping.  
  Sources: [Marking Required Fields in Forms](https://www.nngroup.com/articles/required-fields/); [4 Principles to Reduce Cognitive Load in Forms](https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/)
- **Login exception:** Short username/password logins may omit asterisks; registration forms that ask for more should mark required fields.  
  Source: [Marking Required Fields in Forms](https://www.nngroup.com/articles/required-fields/)
- **Do not stack aggressive “required” chrome** (asterisk + red outline + warning icon + premature “cannot be blank”) before the user fails submit. Asterisk (or “required”) is generally enough until an actual error.  
  Source: [Hostile Patterns in Error Messages](https://www.nngroup.com/articles/hostile-error-messages/)
- **A11y (secondary):** Indicate required status in the label/legend (and explain symbol meaning before first use). `aria-required` is advisory and should accompany a visible indicator—not replace it.  
  Sources: [WAI H90](https://www.w3.org/WAI/WCAG22/Techniques/html/H90.html); [WAI ARIA2](https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA2.html)

### 4. Field grouping and visual layout

- **Proximity:** Place each label closer to its field than to other fields (Gestalt proximity). Ambiguous spacing causes hesitation.  
  Source: [Group Form Elements Effectively Using White Space](https://www.nngroup.com/articles/form-design-white-space/)
- **Group related fields:** Long forms feel less overwhelming when related fields share a section (e.g., personal vs contact). Extra white space between groups helps users see “several short forms” instead of one long wall. Headings are optional but useful for context.  
  Sources: [form-design-white-space](https://www.nngroup.com/articles/form-design-white-space/); [cognitive load — Structure](https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/)
- **Label placement:** Prefer labels **above** fields—easier to scan (label and field in one fixation); supports longer labels. Left labels OK if length is a concern—keep labels similar length and close to fields.  
  Sources: [form-design-white-space](https://www.nngroup.com/articles/form-design-white-space/); [web-form-design](https://www.nngroup.com/articles/web-form-design/) (above for mobile/shorter desktop; beside for extremely long desktop forms)
- **Single column:** Multiple columns interrupt vertical momentum. Prefer one column, one field per row. Exception: short/logically related fields (e.g., city/state/zip) may share a row. Multicolumn layouts increase ambiguity for tab order, screen readers, and magnifiers.  
  Sources: [web-form-design](https://www.nngroup.com/articles/web-form-design/); [cognitive load](https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/)
- **Logical sequencing:** Follow familiar field order; list common values first when appropriate; verify Tab order matches visual order.  
  Source: [web-form-design](https://www.nngroup.com/articles/web-form-design/)
- **Progressive disclosure / conditionals:** Show only what is needed now; branch so optional blocks (e.g., second allowance) appear only when relevant.  
  Sources: [EAS](https://www.nngroup.com/articles/eas-framework-simplify-forms/); [cognitive load](https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/)
- **A11y (secondary):** Group related controls with `<fieldset>` + `<legend>` when a group-level description is needed (especially radio/checkbox sets; also useful for address-like blocks).  
  Source: [WAI H71](https://www.w3.org/WAI/WCAG22/Techniques/html/H71)

### 5. Matching field type and size to input

- **Size ≈ expected content:** “Text fields should be about the same size as the expected input” because truncated entries are error-prone. Field length is also a **visual cue** about answer length; mismatched lengths make users doubt what is asked.  
  Sources: [web-form-design](https://www.nngroup.com/articles/web-form-design/); [cognitive load](https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/)
- **Control type:** Avoid dropdowns when 2–3 options can be radios (one click/tap). Prefer familiar control conventions; forms are rarely the place for novel widget styling.  
  Sources: [web-form-design](https://www.nngroup.com/articles/web-form-design/); [cognitive load](https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/)
- **Format rules:** State format requirements up front (don’t reveal only after failure). Prefer accepting flexible input and normalizing server-side rather than rigid punctuation rules.  
  Sources: [web-form-design](https://www.nngroup.com/articles/web-form-design/); [EAS — Be Flexible with Formatting](https://www.nngroup.com/articles/eas-framework-simplify-forms/); [cognitive load — Provide Context and Examples](https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/)

### 6. Defaults and smart defaults

- **Helpful defaults:** Provide a solid starting point when one option is commonly chosen or users need guidance.  
  Source: [EAS Framework](https://www.nngroup.com/articles/eas-framework-simplify-forms/)
- **Caution:** “Users rarely change defaults. A poorly chosen default can feel pushy, intrusive, and lead to errors.”  
  Source: [EAS Framework](https://www.nngroup.com/articles/eas-framework-simplify-forms/)
- **Automate / infer:** Prefill from known data (editable for verification); infer values instead of asking (e.g., derive related fields). On mobile, reuse history, frequent values, or device capabilities when appropriate.  
  Sources: [EAS](https://www.nngroup.com/articles/eas-framework-simplify-forms/); [mobile checklist](https://www.nngroup.com/articles/mobile-input-checklist/)
- **Radio/select defaults:** Always offer a selectable neutral/default choice so users are not trapped after selecting something by mistake (related to removing Reset).  
  Source: [Reset and Cancel Buttons](https://www.nngroup.com/articles/reset-and-cancel-buttons/)

### 7. Error messaging and inline validation timing

**Visibility & placement**

- Prefer **inline validation**: after the user finishes a field, show an indicator nearby if invalid—fixes happen immediately without hunting.  
  Source: [10 Design Guidelines for Reporting Errors in Forms](https://www.nngroup.com/articles/errors-forms-design-guidelines/)
- Keep messages **next to the field** (even when validation is not fully inline) to minimize working-memory load.  
  Sources: [errors-forms](https://www.nngroup.com/articles/errors-forms-design-guidelines/); [cognitive load](https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/); [error-message-guidelines](https://www.nngroup.com/articles/error-message-guidelines/)
- Use **redundant cues**, not color alone (outline + text + weight/icon).  
  Sources: [web-form-design](https://www.nngroup.com/articles/web-form-design/); [errors-forms](https://www.nngroup.com/articles/errors-forms-design-guidelines/); [error-message-guidelines](https://www.nngroup.com/articles/error-message-guidelines/)
- A top **validation summary** can give global awareness but **must not be the only** indication—users should not hunt or memorize messages while scrolling.  
  Source: [errors-forms](https://www.nngroup.com/articles/errors-forms-design-guidelines/)
- Avoid **modals/tooltips** as the primary error vehicle for routine field errors (dismiss-before-fix; hover/focus discovery cost).  
  Source: [errors-forms](https://www.nngroup.com/articles/errors-forms-design-guidelines/)

**Timing**

- **Do not validate before input is complete.** Rule of thumb: wait until the user finishes the field and moves on. Premature errors (on focus, on first keystroke for incomplete values, or before any interaction) are a hostile pattern.  
  Sources: [errors-forms](https://www.nngroup.com/articles/errors-forms-design-guidelines/); [hostile errors](https://www.nngroup.com/articles/hostile-error-messages/); [cognitive load](https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/); [error-message-guidelines](https://www.nngroup.com/articles/error-message-guidelines/)
- **Selective real-time validation** is appropriate when users benefit (e.g., password-requirement checklist) or to prevent critical mistakes.  
  Sources: [cognitive load](https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/); [errors-forms](https://www.nngroup.com/articles/errors-forms-design-guidelines/) (success indicators for complex fields); [error-message-guidelines](https://www.nngroup.com/articles/error-message-guidelines/)
- Provide constraints **up front**; do not wait until typing or submit to reveal rules.  
  Source: [hostile errors](https://www.nngroup.com/articles/hostile-error-messages/)

**Copy & recovery**

- Messages should be explicit, human-readable, polite, precise, and constructive; preserve the user’s input for editing.  
  Sources: [errors-forms](https://www.nngroup.com/articles/errors-forms-design-guidelines/); [error-message-guidelines](https://www.nngroup.com/articles/error-message-guidelines/); [web-form-design](https://www.nngroup.com/articles/web-form-design/)
- Avoid blame language (“invalid,” “illegal,” “incorrect”); offer remedies, not only problem statements.  
  Source: [error-message-guidelines](https://www.nngroup.com/articles/error-message-guidelines/)

### 8. Buttons (primary action; Reset / Cancel caution)

- **Avoid Reset/Clear** on typical web forms: accidental wipe is catastrophic; two buttons clutter the next step; even intentional “start over” often costs more decision time than editing fields.  
  Sources: [Reset and Cancel Buttons](https://www.nngroup.com/articles/reset-and-cancel-buttons/); [web-form-design](https://www.nngroup.com/articles/web-form-design/)
- **Rare Reset exceptions (NN/g):** Form filled repeatedly with *very different* data each time; or complex parameter UIs where Reset returns to safe defaults (not merely “clear”).  
  Source: [Reset and Cancel Buttons](https://www.nngroup.com/articles/reset-and-cancel-buttons/)
- **Cancel sparingly:** Users often use Back. Offer Cancel when users may fear commitment (especially multi-step flows where Back does not undo prior actions), or for extremely sensitive input so abandoners can clear data—but give Cancel **significantly less visual prominence** than Submit.  
  Sources: [reset-cancel](https://www.nngroup.com/articles/reset-and-cancel-buttons/); [web-form-design](https://www.nngroup.com/articles/web-form-design/)
- **Primary vs secondary styling:** Primary actions (submit/calculate) get the strongest visual emphasis (e.g., solid filled); secondary (cancel) typically outline/lower emphasis. Keep placement consistent across steps.  
  Sources: [Button States](https://www.nngroup.com/articles/button-states-communicate-interaction/); [Consistency and Standards](https://www.nngroup.com/articles/consistency-and-standards/)

### 9. Mobile considerations

NN/g mobile input checklist (apply per field):

| Theme | Checks |
| --- | --- |
| Necessity | Is this field absolutely necessary? |
| Description | Label **above** (not inside, not below); marked required (*) or optional; **no** placeholder inside |
| Visibility | Field wide enough that most values are visible; still visible with keyboard in both orientations |
| Prefill | Good defaults, history, frequent values, device features, or compute from other fields? |
| Typing | Copy/paste; correct keyboard; suggestions/autocomplete where helpful; **do not** autocorrect names/addresses/emails; allow flexible formats and autoformat |

Source: [A Checklist for Designing Mobile Input Fields](https://www.nngroup.com/articles/mobile-input-checklist/)

Also: typing on small screens is hard—minimize typing via device features and automation ([EAS](https://www.nngroup.com/articles/eas-framework-simplify-forms/)). Mobile interruptions make persistent outside-field labels especially important ([placeholders](https://www.nngroup.com/articles/form-design-placeholders/)).

### 10. Cognitive load principles for forms

NN/g frames mental effort reduction as four principles:

| Principle | Intent (NN/g) | Form tactics |
| --- | --- | --- |
| **Structure** | Clear path to completion | Group related fields; visual hierarchy/spacing; logical order; single column; progressive disclosure |
| **Transparency** | Set expectations; reduce speculation | Upfront requirements/time/materials for long forms; mark required/optional; progress indicators |
| **Clarity** | No ambiguity | Plain language; positive wording; one ask per question; format examples; conventional controls; field length matches content |
| **Support** | Guidance without disruption | No placeholders for critical help; constraints that prevent bad input; timely inline errors |

Source: [Few Guesses, More Success: 4 Principles to Reduce Cognitive Load in Forms](https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/)

Question-order heuristics when all fields are shown: familiarity → priority → dependency → complexity → sensitivity (often combined).  
Source: same article.

---

## Implications checklist: multi-section Arabic RTL government salary/allowance calculator

Context assumed: sections for **employee data**, **salary**, **allowance dates**, and an **optional second allowance**. Form is Arabic, right-to-left. Checklist maps NN/g (and WAI semantics) to implementation choices—not new guidelines.

### Length & branching

- [ ] Inventory every field; cut anything derivable from other inputs or policy tables (EAS Eliminate / Automate).
- [ ] Do not show second-allowance fields until the user opts in (conditional progressive disclosure).
- [ ] Mark the second-allowance block **optional** at the opt-in control and on its fields if shown.
- [ ] Prefer one primary outcome action (e.g., احسب / Calculate)—not a Clear/Reset.

### Structure & RTL layout

- [ ] Single-column flow; one primary field per row (exception only for tightly related short pairs if needed).
- [ ] Sections: موظف (employee) → راتب (salary) → تواريخ البدل (allowance dates) → بدل ثانٍ (second allowance, conditional).
- [ ] Section headings + spacing so each block reads as a short form; use `<fieldset>`/`<legend>` (or equivalent accessible grouping) for each section.
- [ ] Labels **above** fields; label closer to its control than to neighbors.
- [ ] In RTL, place required markers where scanning starts (typically at the **right** edge of the label line)—same scanning logic NN/g describes for LTR left-edge asterisks.
- [ ] Verify Tab/focus order follows visual RTL reading order.

### Labels, required/optional, language

- [ ] Persistent Arabic labels outside fields; essential format hints (date, currency) as visible help text—not placeholders.
- [ ] Empty inputs (no gray example text inside).
- [ ] Asterisk or صريح “مطلوب” on required fields; “(اختياري)” on optional ones (esp. second allowance).
- [ ] Plain language for government terms; avoid internal jargon without a short plain synonym.
- [ ] Date format example visible (locale-appropriate), stated before first error.

### Field types & sizing

- [ ] Salary/amount fields sized for expected digit length; date fields sized for the date pattern.
- [ ] Use `inputmode`/appropriate keyboards on mobile for numbers and dates.
- [ ] Prefer radios or segmented choices for 2–3 policy options over dense dropdowns.
- [ ] Accept flexible numeric/date entry where feasible; normalize in code rather than punishing punctuation.

### Defaults

- [ ] Prefill only when confident (e.g., today’s date only if that is the true common case); keep editable.
- [ ] Never default a paid/optional path “on” if most users should skip second allowance.
- [ ] If radio groups exist, include a clear initial/neutral selection path so users are not trapped.

### Errors & validation

- [ ] Validate on blur/leave-field or on submit—not on focus or mid-keystroke for incomplete values.
- [ ] Inline Arabic messages adjacent to the field; optional summary at top **plus** field-level messages.
- [ ] Multi-cue errors (text + border/icon)—not color alone.
- [ ] Preserve entered values after failed calculate/submit.
- [ ] Constructive copy (what to fix), no blame tone.
- [ ] Cross-field rules (e.g., allowance end ≥ start; second allowance dates) show next to the offending fields.

### Actions

- [ ] One high-emphasis primary button near the end of the form (and sticky only if tested—do not obscure fields/keyboard).
- [ ] No Reset/Clear; if Cancel/abandon is needed for sensitive drafts, style as secondary and separate from primary.
- [ ] Consistent button placement across any multi-step variant.

### Mobile

- [ ] Run the NN/g 14-point checklist on every field (necessity, label above, no placeholder, visibility with keyboard, defaults, keyboard type, flexible format).
- [ ] Ensure fields and error text remain readable when the soft keyboard is open.
- [ ] Large enough tap targets; avoid multi-column on narrow viewports.

### Accessibility semantics (WAI secondary)

- [ ] Every control has a visible programmatic `<label>`.
- [ ] Required indicated in visible label text/symbol **and** programmatically (`required` / `aria-required` as appropriate)—visible cue remains mandatory.
- [ ] Groups use `fieldset`/`legend` (or `aria-labelledby` grouping) for employee / salary / allowance / second allowance.
- [ ] Errors associated to fields (`aria-describedby` / announced invalid state) so AT users hear the same fix advice sighted users see.

---

## Source index (primary)

| Topic | URL |
| --- | --- |
| Top form recommendations | https://www.nngroup.com/articles/web-form-design/ |
| Placeholders | https://www.nngroup.com/articles/form-design-placeholders/ |
| Required fields | https://www.nngroup.com/articles/required-fields/ |
| White space / grouping / label placement | https://www.nngroup.com/articles/form-design-white-space/ |
| EAS (eliminate, automate, simplify) / defaults | https://www.nngroup.com/articles/eas-framework-simplify-forms/ |
| Cognitive load (4 principles) | https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/ |
| Form error UI | https://www.nngroup.com/articles/errors-forms-design-guidelines/ |
| Error-message content | https://www.nngroup.com/articles/error-message-guidelines/ |
| Hostile / premature errors | https://www.nngroup.com/articles/hostile-error-messages/ |
| Reset & Cancel | https://www.nngroup.com/articles/reset-and-cancel-buttons/ |
| Button emphasis | https://www.nngroup.com/articles/button-states-communicate-interaction/ |
| Placement consistency | https://www.nngroup.com/articles/consistency-and-standards/ |
| Mobile input checklist | https://www.nngroup.com/articles/mobile-input-checklist/ |
| WAI: labels | https://www.w3.org/WAI/WCAG22/Techniques/html/H44 |
| WAI: required indication | https://www.w3.org/WAI/WCAG22/Techniques/html/H90.html |
| WAI: `aria-required` | https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA2.html |
| WAI: fieldset/legend | https://www.w3.org/WAI/WCAG22/Techniques/html/H71 |
