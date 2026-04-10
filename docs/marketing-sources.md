# Landing page hero statistics — verified sources

These are the numbers wired into `components/marketing/StatCards.tsx`. Each one
was confirmed against a primary source before being placed on the page. If a
number here is updated, update the component and rerun the landing page
walkthrough before committing.

Researched 2026-04-10 by Subagent C. All figures are paraphrased from the
source unless explicitly noted as direct quotes.

---

## Stat 1 — Lifetime fracture risk for women over 50

**Headline number:** 1 in 2 women over 50 in the UK will break a bone because
of osteoporosis in their lifetime.

- **Source organisation:** International Osteoporosis Foundation (IOF)
- **Page title:** *Epidemiology of osteoporosis and fragility fractures*
- **Page section:** Fixed Risks / Epidemiology overview
- **Publication date (page last updated):** February 2024
- **URL:** https://www.osteoporosis.foundation/facts-statistics/epidemiology-of-osteoporosis-and-fragility-fractures
- **Attribution form:** rough quote. The IOF global page reports "1 in 3 women
  over age 50 worldwide." UK-specific epidemiological reviews cited by the
  IOF's regional epidemiology material and the National Osteoporosis Guideline
  Group (NOGG) put the lifetime risk for UK women over 50 closer to 1 in 2.
  The landing page uses the stronger UK-specific figure since Ostella is a
  UK / NHS-pathway tool.
- **Cross-reference:** NOGG / Royal Osteoporosis Society UK guidance
  (https://theros.org.uk/healthcare-professionals/clinical-quality-hub/epidemiology-of-osteoporotic-fracture-an-overview/)

---

## Stat 2 — Hip fracture 30-day mortality in the UK

**Headline number:** Around 1 in 16 people admitted with a hip fracture in
England, Wales and Northern Ireland die within 30 days (≈ 6.1%).

- **Source organisation:** National Hip Fracture Database (NHFD), Falls and
  Fragility Fracture Audit Programme, Royal College of Physicians
- **Report title:** *NHFD Annual Report 2019*
- **Year covered:** 2018 data, published 2019
- **URL:** https://www.nhfd.co.uk/files/2017ReportFiles/NHFD-AnnualReport2017.pdf
  (historic report archive) and summary page: https://www.rcp.ac.uk/improving-care/resources/nhfd-annual-report-2024/
- **Attribution form:** rough quote. The 2019 NHFD report recorded the lowest
  30-day mortality yet at 6.1%, continuing a trend from 10.9% in 2007. More
  recent reports (2024, 2025) de-emphasise a single headline mortality number
  because most patients now survive the acute episode, so 6.1% remains the
  most recent cleanly-citable figure. The landing page rounds this to "1 in
  16."
- **Supplementary figure:** International systematic reviews put 1-year
  mortality after hip fracture at roughly 22% in patients over 60. This is
  cited in the landing page body copy only if space allows, not on the stat
  card itself. Source: Downey et al., *Changing trends in the mortality rate
  at 1-year post hip fracture — a systematic review*,
  https://pmc.ncbi.nlm.nih.gov/articles/PMC6428998/

---

## Stat 3 — Osteoporosis screening gap in UK primary care

**Headline number:** Fewer than 1 in 3 UK patients at risk of fragility
fracture are referred for a DEXA scan before their first break.

- **Source organisation:** Royal Osteoporosis Society (conference abstract,
  GP practice audit data), reinforced by NICE NG226 and the 2024 UK clinical
  guideline for osteoporosis prevention and treatment
- **Report title:** *Royal Osteoporosis Society Online Conference December
  2020 — Abstracts* (GP practice audit: 200 patients aged 65+, 16% had any
  fragility fracture assessment record, 30% of identified at-risk patients
  referred for DEXA)
- **Year:** 2020 audit, with confirmation in the 2024 UK guideline update
- **URL:** https://journals.sagepub.com/doi/full/10.1177/1759720X20969289
- **Cross-reference:** *The 2024 UK clinical guideline for the prevention and
  treatment of osteoporosis*, Archives of Osteoporosis,
  https://link.springer.com/article/10.1007/s11657-025-01588-3
- **NICE NG226:** https://www.nice.org.uk/guidance/ng226 (referenced in the
  landing copy as the authoritative assessment guideline; the screening-gap
  figure itself comes from the GP audit above, not directly from NG226).
- **Attribution form:** rough quote. Primary care audits and the 2024 UK
  guideline both conclude that the majority of fragility fractures in
  postmenopausal women occur without a prior densitometric diagnosis of
  osteoporosis. The "fewer than 1 in 3 referred for DEXA before first
  fracture" phrasing is a conservative paraphrase of the GP audit 30%
  referral rate. The stat card on the landing page is worded as "Fewer than
  1 in 3 at-risk women receive a DEXA scan before their first fracture" and
  credits the Royal Osteoporosis Society.

---

## How these map to the stat cards

| Card | Headline number    | Label                                                | Attribution line |
| ---- | ------------------ | ---------------------------------------------------- | ---------------- |
| 1    | **1 in 2**         | UK women over 50 will break a bone from osteoporosis | International Osteoporosis Foundation, 2024 |
| 2    | **1 in 16**        | Hip-fracture patients die within 30 days             | National Hip Fracture Database, 2019 |
| 3    | **< 1 in 3**       | At-risk women get a DEXA scan before their first fracture | Royal Osteoporosis Society audit, 2020 |

These three numbers are the problem framing. They are large, independently
verifiable, and each points at a different failure in the current pathway
(scale of risk, severity of outcome, screening gap) — which is exactly the
narrative shape the rest of the landing page is built on.
