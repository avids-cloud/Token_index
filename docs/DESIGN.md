# Design Direction

The subject is cost. The audience is finance and ops people first, developers second. The design should feel like a trustworthy financial reference, not a developer tool or an AI landing page.

## Concept: the digital rate card

Ground the design in the physical artefacts of cost estimation: ledger paper, rate cards, actuarial tables. The index page should read like a modern rate card that happens to be interactive. Numbers are the content. Everything else stays out of their way.

## Tokens

**Colour** (adjust in execution, keep the logic):

- `--paper: #EDF2EC` ledger-paper green tint, the page background
- `--rule: #C9D6C8` ruled lines between rows, like a physical ledger
- `--ink: #17251B` near-black green ink, primary text
- `--figure: #0B3B2E` deep green for token and dollar figures
- `--delta: #A4302A` accountant's red, reserved for cost increases and warnings only
- `--accent: #1D4ED8` ink blue for links and interactive states

Do not use warm cream backgrounds, terracotta accents, or near-black pages with acid green. Those read as generated.

**Type:**

- Display and headings: IBM Plex Sans, semibold, tight tracking
- Body: IBM Plex Sans regular
- All figures: IBM Plex Mono with `font-variant-numeric: tabular-nums` so columns of numbers align. Non-negotiable. Misaligned figures destroy trust in a cost tool.

**Layout:**

The index is a full-width table with ruled horizontal lines and generous row height. Filters sit in a left rail on desktop, collapse to a top sheet on mobile. Entry detail pages are two columns: figures left, methodology right.

## Signature element

The repricing strip. A fixed bar above the table holds the model selector and a monthly volume input. Changing either reprices every visible row in place with a brief count-up animation on the dollar figures, like a currency board updating. This is the one moment of motion on the site. Everything else is static. Respect `prefers-reduced-motion` by swapping the count-up for an instant update.

## Copy rules

- British English throughout. No em dashes anywhere in site copy.
- Every dollar figure carries its pricing date: "at Jan 2026 prices".
- Buttons say what they do: "Reprice", "Submit entry", "Download dataset".
- Empty states direct action: "No entries match. Clear filters or submit the first one."
- No AI buzzwords. The word "revolutionise" appearing anywhere is a build failure.

## Quality floor

Responsive to 360px. Visible keyboard focus on all interactive elements. Table has proper `<th>` scope attributes and works with a screen reader. Lighthouse accessibility score of 95 or above before launch.
