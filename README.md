# Washington CNA / NAC Practice Exam & Study Program

A complete, **offline** practice-exam program for the Washington State Certified Nursing Assistant (NAC) examination. No account, no internet connection, and no personal information is collected. Everything runs in a web browser directly from these files.

---

## How to open it

**On a computer (Windows or Mac):**
1. Keep all five files together in this folder (don't move them apart):
   `index.html`, `styles.css`, `app.js`, `questions.js`, `questions.json`.
2. **Double-click `index.html`.** It opens in your default web browser.
3. That's it — pick a mode, pick a test, and start.

**On a phone or tablet:** copy this whole folder to the device (see "Using it on another device / QR code" below), then open `index.html` with a browser or files app.

> No install, no setup, no server needed. Once the folder is on a device, that device works on its own — it does **not** need to stay connected to any other computer.

---

## What's included

- **376 questions total**, every one taken from the two provided practice tests:
  - **200** — Washington CNA Massive Practice Test (150 multiple-choice + 50 true/false)
  - **176** — Washington CNA Pink Sheet Skills Practice Test (132 multiple-choice + 44 true/false, all 22 hands-on skills)
- Each question has a **verified answer** (checked against the printed answer keys), a **short explanation**, its **subject or skill**, and its **source file and page**.

## Test options

- **Knowledge Test (200)** — the full knowledge practice test (2-hour timer).
- **Pink Sheet Skills (176)** — every hands-on skill question.
- **Combined Test (376)** — both banks in one exam (2-hour timer).
- **Test by skill or subject** — pick any one section or skill from the dropdown.
- **Randomized Practice** — a shuffled set of any size you choose (5–376).
- **Retest my missed questions** — only the questions she has gotten wrong before (tracked automatically).

## Two modes

- **Practice Mode** — after each answer, it shows correct/incorrect **immediately** and explains why.
- **Exam Mode** — answers stay hidden until the whole test is **submitted**, like the real test.

## While taking a test

- One question at a time, with clearly labeled A/B/C/D (or True/False) choices.
- **Previous / Next** buttons, a **question number**, and a **progress bar**.
- **Mark for review** flag, plus a **Navigator** grid to jump to any question.
- **Unanswered-question warning** before submitting; you can return to earlier questions any time before submitting.
- **Auto-save**: close the browser and come back later — a **Resume** button restores the exact test.

## Results (graded exactly)

At the end it shows: total questions, correct, incorrect, unanswered, correct % and incorrect % of answered, the **correct : incorrect ratio** (raw and simplified, e.g. `160 : 40 (4 : 1)`), the **overall score**, a **pass / needs-more-study** result (80% study target), **time used**, and a **score bar for every subject and skill**.

Grading formulas used:
- Overall score = correct ÷ **total** × 100  *(so unanswered questions lower the score)*
- Correct % of answered = correct ÷ answered × 100
- Incorrect % of answered = incorrect ÷ answered × 100
- Answered = correct + incorrect
- Total always = correct + incorrect + unanswered

## Answer review

Every question is listed with a colored left edge — **green = correct, red = incorrect, yellow = unanswered** — showing the full question, her selected answer, the correct answer, the explanation, the subject/skill, and the source page. Filter by All / Incorrect / Unanswered / Flagged.

## History & saving (all on the device only)

- **Resume saved exam**, **Start over**, **Clear history**
- **Review past scores** and a **most-missed questions** list
- **Print / Save PDF** and **Download results** (a plain-text summary)

## Accessibility

Large readable text, big tap-friendly buttons, works on phones and computers, full keyboard navigation, high-contrast colors, and automatic light/dark theme. Keyboard shortcuts during a test: **← →** move between questions, **1–4** pick a choice, **T / F** for true/false, **M** to mark for review.

---

## Using it on another device / QR code

This program is just files, so there are two easy ways to get it onto your wife's phone or tablet — **neither one needs your PC to stay on while she studies:**

1. **Copy the folder** (recommended): move this `Practice Exam App` folder to her device with a USB cable, USB stick, email-to-self, or a cloud drive (Google Drive / iCloud / OneDrive). Then she opens `index.html`. After that it runs fully offline on her device forever.
2. **QR code / same-Wi-Fi:** a QR code can only point to a web address, so it needs something *serving* the files. If you run a tiny local web server on your PC and make a QR code for that address, she can scan it — **but then your PC must stay on and both devices must be on the same Wi-Fi.** If instead you upload the folder to free web hosting (e.g. Netlify Drop, GitHub Pages), the QR code works from anywhere and your PC can be off — that version does use the internet to *load* once.

**Short answer to "does my PC need to stay on?":** No — as long as the folder lives on the device she's using. Your PC only needs to be on if you choose to *serve* it from your PC over Wi-Fi.

### Hosted phone version + QR code (your PC can be OFF)

A ready-to-use hosted copy is published here:

**https://claude.ai/code/artifact/d6c13bcf-e893-4e48-8df3-18ee4a7c08c8**

`CNA_App_QR.png` (in this folder) is a scannable QR code that opens that link.

> **Before she can use the QR link:** the page is **private to your Claude account** by default. Open the link once on your computer, use the page's **Share** menu to turn on sharing, and then the QR/link will open for her. It runs on her phone with your PC off. (Progress on the hosted copy is saved in her phone's browser.)
>
> **Fully public alternative (no login at all):** drag this whole folder onto **[Netlify Drop](https://app.netlify.com/drop)** — it gives you a free public web address in seconds. Make a QR of that address and it works for anyone, PC off, and installs as a full offline app (below).

### Install it as an app (PWA) — works offline after install

When the app is opened from a **web address** (the hosted link, a Netlify address, or a local server — not a raw file), it can be installed like a real app:

- **Android / Chrome:** open the link → menu (⋮) → **Install app** / **Add to Home screen**.
- **iPhone / Safari:** open the link → **Share** → **Add to Home Screen**.

After installing, it launches from the home screen and **works with no internet** (the included `manifest.webmanifest`, `sw.js`, and icons handle offline caching). Opening the app directly from a downloaded file (`file://`) still works fully offline too — it just can't "install" as a home-screen app.

---

## Files in this project

| File | What it is |
|---|---|
| `index.html` | The app's page — open this. |
| `styles.css` | Appearance (large text, high contrast, light/dark, print styles). |
| `app.js` | All logic: modes, navigation, grading, review, saving, self-tests. |
| `questions.js` | The 376 questions + verified answers (loaded by the page so it works offline from a double-click). |
| `questions.json` | The same 376 questions as pure JSON, for portability/inspection. |
| `README.md` | This file. |

---

## Verification (done before release)

- **Source counts vs. program counts match:** Massive **200** questions ⇒ 200 in the program; Pink Sheet **176** ⇒ 176 in the program; **376 total.**
- **Every question has exactly one valid answer**, and each program answer was checked against the printed answer key on the final page of each test. **0 conflicting or unclear answers were found** (all 200 and all 176 were cross-checked against the question wording).
- **No duplicate or missing question IDs** (Massive `M1`–`M200`, Pink `P1`–`P176`).
- **Grading self-tests pass** (they also run automatically every time the page loads — see the line at the bottom of the home screen):
  - all correct ⇒ 100%; all incorrect ⇒ 0%; 80 correct / 20 incorrect ⇒ 80%; 50 correct / 25 incorrect / 25 unanswered ⇒ 50% overall; counts always sum to the total; ratio 160:40 simplifies to 4:1.

*Reference/course materials that are not question-and-answer format (glossaries, handbooks, checklists, law and communication documents) contain no gradable items and are not part of the question bank. This is an original study aid and is not affiliated with Credentia or the Washington State Board of Nursing. If any item ever conflicts with current official materials, follow the official source.*
