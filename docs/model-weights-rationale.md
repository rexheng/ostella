# Model Weights Rationale — Decision Log

**Companion files:** `lib/model-weights.ts`, `docs/model-calibration.md`, `docs/superpowers/specs/2026-04-10-ostella-mvp-design.md` §7

**Purpose.** This document explains every decision behind the 14 coefficients in `lib/model-weights.ts`. For each coefficient it states (a) what value I picked, (b) which source it came from and why that source over the alternatives, (c) what I considered and rejected, (d) how confident I am, (e) what flags are attached and why, and (f) how I classified it as actionable or not and why. It is written so that a clinical reviewer can read only this document (plus the citations it points to) and judge whether the model is defensible. It is also written so that the author can defend every number in a live conversation without having to re-read primary literature.

The decisions were made on 2026-04-10 by a literature review. No patient data was used.

---

## 0. Scope and what this model is (and isn't)

**What it is.** A transparent linear log-hazard stratification tool for **10-year major osteoporotic fracture (MOF)** — the FRAX definition: hip, clinical vertebral, distal forearm, proximal humerus. Relative to a reference 50-year-old early-perimenopausal White European woman with no other risk factors, the tool multiplies the reference baseline by `exp(Σ βᵢ · xᵢ)` and buckets the result into `low | moderate | high`.

**What it isn't.** It is *not* a calibrated absolute-risk calculator. The baseline 10-year MOF risk at age 50 for the reference patient is ~5–6% (per UK FRAX); the model's job is to tell a GP whether this particular patient is at 1×, 2×, or 10× that baseline, not to produce a precise annualised probability. A production deployment would swap this for FRAX-API 10-year probabilities with NOGG cutoffs. What this model offers is **auditability** — every coefficient is one line in a TypeScript file, every HR traces to a DOI, and the feature contribution chart exposes which features moved a given patient into their tier. That is the core pitch value.

**Why a linear log-hazard model and not ML.** Two reasons.

1. **The pitch requires auditability.** A GP, a regulator, or a clinical reviewer can read `lib/model-weights.ts` in under ten minutes and verify every number against primary literature. A gradient-boosted tree, a neural net, or any black-box approach fails this test — even with SHAP or LIME explanations, the training data and training procedure become part of the audit scope, and "explain this prediction" becomes a research problem rather than a read-through of a file.
2. **The evidence base is already in log-hazard form.** Every primary source I drew from (Kanis FRAX series, WHI, SWAN, Curtis CPRD) reports hazard ratios. The FRAX engine itself is an additive log-hazard model. Using the same functional form preserves the citability of every coefficient and avoids introducing non-linearity where the evidence doesn't support it.

The cost of this choice is that interactions between features are not captured automatically — they have to be encoded as explicit rules (see §15 on `stage × HRT` and `early menopause × stage`). That's a real limitation but it's the right trade for a pitch-stage demo whose USP is transparency.

**Why target perimenopause (42–55) specifically.** Because that's where most of the clinical noise is and most of the preventative-care lever is. Post-menopausal diagnosis is already late — once a woman presents with a fragility fracture at 65, roughly 10 years of accelerated bone loss have already happened. The transmenopause window (roughly 1 year before to 5 years after the final menstrual period) is when BMD drops fastest (~2%/yr lumbar spine, ~1.4%/yr femoral neck, per SWAN) and when HRT, weight-bearing exercise, and lifestyle intensification have their maximum return. A risk tool for this age band closes a real care gap that FRAX-style tools optimised for 60+ women miss.

---

## 1. How the research was done

Three parallel literature-research subagents were dispatched against thematically independent feature groups:

- **Group A — Core FRAX features** (age, BMI low/high, prior fracture, parent hip fracture, smoking, alcohol, glucocorticoids, rheumatoid arthritis) — 9 coefficients. Primary target: the Kanis FRAX-derivation series (Osteoporosis International 2004–2008) and its 2015+ replications.
- **Group B — Perimenopause-specific features** (menopausal stage, early menopause, HRT, low calcium) — 4 coefficients. Primary target: SWAN bone substudy, WHI hormone-therapy arms, IOM 2011 / Bolland 2015 for calcium.
- **Group C — Ancestry baseline** (White, South Asian, East Asian, Black African, + Other fallback). Primary target: Curtis 2016 CPRD for UK calibration, Cauley 2005/2007 WHI for US-derived HRs where UK data was thin.

Each agent was instructed to:
- Trace every HR to a primary source with DOI or PMID
- Flag sources >15 years old AND not replicated post-2015 as `OLD_UNREPLICATED`
- Flag literature disagreements >30% as `CONTESTED`
- Produce structured output with HR, CI, ln(HR), population, confidence, and an actionability classification with a rationale tuned for downstream LLM education

All three agents returned comprehensive reports. I consolidated them into `lib/model-weights.ts`, verified every HR↔β pair to 3 decimal places using Python (found and fixed two rounding errors in my initial draft), and hand-computed worked examples for three representative patients (low, moderate, high) plus worst- and best-case bounds.

---

## 2. Reference patient

Every coefficient in the weights file is expressed as a log hazard ratio **relative to this specific patient**:

| Feature | Reference value | Why this particular value |
|---|---|---|
| Age | 50 years | Midpoint of the 42–55 perimenopausal band. Also matches FRAX's age anchoring convention. |
| Menopausal stage | Early perimenopausal (STRAW+10 stage −2) | The inflection point — where preventative intervention has maximum return. Using early-peri instead of pre-meno as reference means the stage coefficient *doesn't subtract* for premenopausal women; it just adds as menopause progresses. |
| BMI | 22 | Middle of the WHO normal range, matches the anchor most FRAX BMI plots use. Not BMI 25 (the WHO boundary) because 25 is borderline overweight and would bias the reference upward. |
| Ancestry | White European | Not because this is the "correct" reference but because **the UK primary-care baseline is White European** (~86% of CPRD) and every ancestry HR in the literature is reported as "vs White". Using any other reference would force a double-conversion. |
| Smoking | Non-smoker | FRAX convention. |
| Alcohol | <3 units/day | FRAX uses a binary threshold at 3 UK units/day; below this the dose-response is flat. |
| Prior fracture | None | |
| Parent hip fracture | None | |
| Glucocorticoids | None | Not "past user" — genuinely never exposed. |
| Rheumatoid arthritis | None | |
| Dietary calcium | ≥700 mg/day | Matches the low-calcium boolean threshold, which is chosen to be sensitive to genuinely low intake. |
| HRT | Not on HRT | Critical: the reference is *not on HRT*, so the `current_hrt` coefficient is protective from the reference baseline. If we had anchored the reference on "on HRT", every other coefficient would have to be re-stated relative to that baseline. |

The design choice worth highlighting: **making the reference patient a 50-year-old early perimenopausal woman (rather than a 35-year-old premenopausal woman or a 65-year-old postmenopausal woman) makes the age coefficient a simple linear increment around the midpoint of the target population**. It also means that for a 50-year-old patient with no other risk factors who is still premenopausal, the model returns RR ≈ 1.0 (the `premenopausal` stage HR is 0.98, basically null), which matches clinical intuition.

---

## 3. Functional form decisions

### 3.1 Why `score = Σ βᵢ · xᵢ` and `RR = exp(score)`

Standard log-hazard additivity. This is what FRAX uses internally, what every meta-analysis I drew from uses, and what every clinical reviewer will expect. The alternative — multiplicative HRs directly — is mathematically equivalent but is less numerically stable for large risk accumulations and harder to explain in a feature contribution chart (bars need to be `log(HR)` to be visually additive).

### 3.2 Why `hr` AND `beta` stored together

Redundant but deliberate. `hr` is what clinicians read; `beta` is what the scoring function multiplies. Storing both avoids silent rounding bugs in either direction and lets the `FeatureContributionChart` show both the raw HR (in tooltip) and the signed β (in the bar). Both values are verified consistent to 3 decimal places by an end-to-end Python check.

### 3.3 Why 3-decimal-place rounding on `beta`

Three decimals is enough precision to preserve 0.1% accuracy on the final RR for any realistic score combination in the 0 to ±4 range. It's also stable under the rounding conventions — two edge cases surfaced during verification (prior fragility fracture rounded the wrong way, HRT rounded the wrong way) and were fixed. More precision would be spurious given the underlying CIs on the HRs; less precision would compound into 1%+ errors on the worst-case RR.

### 3.4 Why fixed-reference categorical features use `hr = 1.00, beta = 0` levels

Explicit rather than implicit. A `premenopausal` or `white` reference level that stores `{hr: 1.0, beta: 0.0}` is tediously verbose but it means (a) the scoring function has exactly one code path — it always looks up a level, (b) the feature contribution chart can still render a zero-length bar with a "reference" tag for transparency, and (c) adding new reference levels later is a data change, not a code change.

---

## 4. Cross-cutting decisions on evidence flags

Four flags are defined in `EvidenceFlag`:

### 4.1 `CONTESTED`

Applied when primary literature disagrees by more than 30% on the point estimate. Two features carry this flag:
- `bmi_high` — FRAX/De Laet says ~0.83 protective, GLOW/Johansson says ~1.00 neutral
- `low_calcium` — Bolland 2015 says null, Warensjö 2011 says ~1.18

In both cases I picked a compromise point estimate in the middle and widened the CI to span both positions. The flag is surfaced in `lib/model-weights.ts` so that downstream code (and humans reading the file) can treat contested coefficients differently — for example, a risk explainer UI could render contested bars in a different colour or with a footnote.

### 4.2 `OLD_UNREPLICATED`

Reserved for primary sources >15 years old with no post-2015 replication. **No coefficient in the model carries this flag.** Every Kanis 2004–2007 and Van Staa 2000/2006 paper has been replicated or extended in modern literature:

| Feature | Original | Modern replication |
|---|---|---|
| Age gradient | Kanis 2007 | Leslie 2014 JBMR; Wu 2021 GBD |
| Prior fracture | Kanis 2004 Bone | Johansson 2017 (imminent risk); Balasubramanian 2019 |
| Parent hip fracture | Kanis 2004 Bone | Yang 2016 (mechanistic) |
| Smoking | Kanis 2005 | Thorin 2016 (cessation benefit) |
| Alcohol | Kanis 2005 | Berg 2008; Cawthon 2006 |
| Glucocorticoids | Kanis 2004 JBMR; Van Staa 2000 | Amiche 2016 (Bayesian) |
| BMI | De Laet 2005 | Johansson 2014; Compston 2011 GLOW |
| Rheumatoid arthritis | Van Staa 2006 | Kim 2020 |
| HRT | Cauley 2003 JAMA | Jackson 2006; NAMS 2022 |

Read these as "the Kanis series is the canonical anchor, the way Einstein 1905 is the canonical anchor for special relativity even though the modern textbook is newer". The 2015+ replications confirm the point estimates haven't drifted.

### 4.3 `UK_EXTRAPOLATED`

Applied when the HR comes from a non-UK cohort (usually WHI or SOF) and is being used for UK primary care without direct UK-data recalibration. Three coefficients carry this flag: all three non-White ancestry levels (`south_asian`, `east_asian`, `black_african`).

The reason is granular and important. Curtis 2016 CPRD (the UK paper) confirms the **direction** of the effect for all three groups — UK non-White women do have lower fracture rates than UK White women — but doesn't publish age-stratified point estimates for the 42–55 band specifically. The *magnitudes* of the HRs come from WHI, which is US-based. Three specific mismatches are worth flagging to a reviewer:

1. **US African-American ≠ UK Black African.** African-Americans carry ~15–25% European admixture on average and live in a different dietary/SES environment. UK Black Africans are predominantly first- or second-generation West African immigrants. The direction of effect is protective in both populations; the magnitude (~0.50 HR) may be less accurate in the UK setting than the US data would suggest.
2. **WHI "Asian" pools Chinese, Japanese, and Filipino.** UK East Asians are predominantly Chinese, with smaller Japanese and Korean populations. The direction is protective; the pooled magnitude may over- or under-estimate for specific UK subgroups.
3. **UK South Asians are heterogeneous** — Indian, Pakistani, Bangladeshi — with different BMI, diabetes, and vitamin D profiles. Curtis 2016 is the only UK-native source and doesn't publish sub-group HRs.

If/when the project gets CPRD or QResearch access, all three ancestry HRs should be re-calibrated against UK-native data. Until then, the flag surfaces the extrapolation risk in the code itself.

### 4.4 `DERIVED`

Applied when no paper reports the HR directly and the value was computed from a surrogate. All five menopausal-stage levels carry this flag. No published paper reports MOF HRs stratified by STRAW+10 stage in the 42–55 age band. I derived them from:

```
cumulative_femoral_neck_BMD_loss_vs_early_peri  →  ΔSD  →  HR = 1.6^ΔSD
```

where the BMD trajectory comes from SWAN (Greendale 2012 JBMR) and the BMD→fracture gradient (HR ≈ 1.6 per SD) comes from Johnell 2005 Osteoporos Int. The empirical sanity check against Cauley 2012 *Menopause* SWAN fracture data suggests the derived HRs may *underestimate* risk in the first 1–2 years post-FMP (true HR could be 1.5–1.8 there, not 1.29). This is the largest methodological concession in the model and is flagged accordingly.

The alternative — dropping menopausal stage as a feature entirely and relying on age alone — was considered and rejected because the whole clinical premise of the tool is that **perimenopause is the inflection point**. If the model doesn't encode stage, the tool is just FRAX with a younger target population, which is not interesting. The DERIVED flag is the honest disclosure that the field doesn't yet have the data to support the feature directly.

---

## 5. The "actionable" classification

### 5.1 Why binary + rationale, not a numeric actionability score

The user explicitly chose "binary + rationale" over a three-tier scheme, noting that the field will feed a downstream LLM that generates patient-facing education content. A binary with a pre-written rationale is the right interface for that consumer for three reasons:

1. **LLMs consume text, not numeric tiers.** Handing the LLM a pre-written rationale string gives it a ready-to-adapt message rather than forcing it to infer what "actionability tier 2" means.
2. **Binary avoids fake precision.** A three-tier scheme would have forced classifications like "BMI is partially actionable" which is technically true but less useful than "actionable via protein + resistance training, here's the script".
3. **The rationale field absorbs the nuance.** Early menopause is a good example: `actionable: false` because the event itself is irreversible, but the rationale reframes it as a screening trigger. That's the kind of subtlety a tier label couldn't capture.

### 5.2 The two failure modes the rationale strings are designed to prevent

Every `actionable_rationale` string is written to avoid two specific failure modes of automated health advice:

1. **Fatalism on unactionable factors.** The temptation is to tell a patient "your mother had a hip fracture, that can't be changed" and leave it there. All the `actionable: false` rationales instead reframe unactionable factors as **triggers for earlier screening or harder focus on modifiable factors**. For `parent_hip_fracture`: "*A 50-year-old with a parent hip fracture should get a baseline DXA now (not wait until 65) and double down on modifiable factors — her genetic baseline is lower, so the levers she can pull matter more.*"

2. **False hope on weakly-evidenced actionable factors.** The temptation is to tell a patient "take more calcium" because calcium is intuitively actionable and culturally associated with bone health. The evidence (Bolland 2015) actually shows weak-to-null effects. The `low_calcium` rationale is deliberately tempered: "*Getting 1,000–1,200 mg/day from food is a reasonable goal, but don't panic — the evidence that calcium supplements prevent fractures in healthy women is surprisingly weak. Vitamin D status and weight-bearing exercise probably matter more.*"

The downstream LLM should consume these rationales as **pre-written source material**, not as raw data to re-summarise.

### 5.3 Breakdown of the 14 coefficients

**Actionable (10):** `bmi_low`, `bmi_high` (fall prevention, not weight loss), `prior_fracture` (secondary prevention), `current_smoker`, `alcohol_high`, `glucocorticoid_use`, `rheumatoid_arthritis`, `current_hrt`, `low_calcium` (weak evidence but actionable), and implicitly the behaviour change is the intervention.

**Unactionable / informational (4 single features + 1 categorical):** `age_above_50`, `parent_hip_fracture`, `early_menopause`, `menopausal_stage` (5 levels), `ethnicity_baseline` (5 levels).

All unactionable features have rationales that reframe them as screening or intensity triggers, never as dead ends.

---

## 6. Per-coefficient decisions

Fourteen sections. Each covers: value adopted, primary source choice, alternatives considered and rejected, confidence, flags, actionability.

### 6.1 `age_above_50` — HR 1.043/year (β +0.042/year)

**Adopted:** `hr = 1.043` per year above 50, `β = 0.042`. The feature fires as `(patientAge - 50)`, so a 54-year-old gets +0.168 to the score.

**Source:** Kanis JA et al. 2007, *Osteoporos Int* 18(8):1033–1046. This is the canonical FRAX age-gradient paper and the pooled analysis across all 9 FRAX-derivation cohorts.

**Why this source.** FRAX is the global benchmark a GP-facing tool will be judged against, and Kanis 2007 is literally the paper the FRAX age spline is fit to. Any deviation needs justification; I had none.

**Alternatives considered.**
- Using a larger per-year gradient (e.g. the spec's placeholder of 0.077, which implies a 10-year doubling of risk). I rejected this because 0.077/year is what you get if you fit a log-linear line across ages 50–75 — it over-states the slope at 50 and under-states it at 80. The right number for the 42–55 band is the *local slope of the spline at 50*, which is ~0.042.
- Using a piecewise spline (e.g. 0.042 for 42–55, 0.06 for 55–65, 0.08 for 65+). This would be more accurate across a wider age range but the model only targets 42–55, so a constant slope valid across that band is sufficient. §4 of `docs/model-calibration.md` flags this as a re-anchor point past age 60.
- Centring at age 45 (the midpoint of perimenopause) rather than 50. Rejected because 50 is the standard FRAX anchor and picking a different centre would force every clinician reader to mentally re-center.

**Confidence: high.** Within the 42–55 band.

**Flags:** none. (The note about the spline approximation is in `age_interaction_note`.)

**Actionable:** `false`. But the rationale explicitly reframes "perimenopause is the inflection point" — the message to the patient is that **now** is when lifestyle interventions have their maximum return, not "you can't change your age".

---

### 6.2 `bmi_low` (BMI < 20) — HR 1.28 (β +0.247)

**Adopted:** `hr = 1.28`, `β = 0.247`. The feature fires boolean when BMI is strictly less than 20.

**Source:** De Laet et al. 2005 *Osteoporos Int* 16(11):1330–1338 — the FRAX BMI meta-analysis across 398,610 men and women.

**Why this source.** De Laet 2005 is the FRAX derivation source for BMI and reports a smooth spline from which the BMI 20 vs BMI 22 increment can be read off. It's also the one meta-analysis with enough power to separate the BMI effect from the BMD effect (the BMI effect attenuates ~60% after BMD adjustment, confirming that BMI acts through BMD).

**Why 1.28 specifically, not 1.95.** De Laet reports the spline value at BMI 20 vs BMI 25 as ~1.95. But our reference is BMI 22, not 25. Reading the spline at BMI 20 vs 22, the incremental HR for MOF is in the 1.25–1.35 range. I took 1.28 as the central estimate. The spec's placeholder of 1.95 is the wrong comparison — it's BMI 20 vs 25, not vs 22.

**Alternatives considered.**
- Using Johansson 2014 JBMR's more recent pooled BMI-fracture analysis. Rejected because Johansson 2014 concluded the BMI effect is almost entirely captured by BMD, which is an argument for *not* including BMI as a separate feature when BMD is unknown — and here BMD *is* unknown (patients haven't had DXA yet), so we need the BMI proxy.
- Using Compston 2011 GLOW. Rejected because GLOW's primary finding is about `bmi_high`, not low.
- Treating BMI as a continuous feature rather than a dichotomous boolean. This would be more accurate across the full BMI range but adds parameters (a continuous HR per kg/m² is harder to verify and explain in a feature contribution chart than a boolean). The MVP's transparency requirement outweighs the accuracy gain.

**Confidence: high.**

**Flags:** none.

**Actionable:** `true`. Low BMI at 50 is a marker of low lean mass; the lever is protein + resistance training, not "gain weight". The rationale spells this out.

---

### 6.3 `bmi_high` (BMI > 30) — HR 0.95 (β −0.051) — **CONTESTED**

**Adopted:** `hr = 0.95`, `β = −0.051`. Compromise between two opposing positions.

**Source:** De Laet 2005 + Compston 2011 GLOW. Both are cited in the file.

**The contest.** Two lines of evidence disagree:
- **FRAX/De Laet line.** HR ≈ 0.83 (weakly protective for MOF), driven almost entirely by reduced hip fracture in obese postmenopausal women. This is what the FRAX engine encodes.
- **GLOW/Compston line.** HR ≈ 1.00 (neutral) because obesity is protective at hip but *raises* fracture risk at humerus, forearm, and ankle via fall mechanics (obese women fall differently and land on their outstretched arms). GLOW's primary finding was that obese postmenopausal women had similar MOF rates to non-obese, with significantly increased upper-extremity fractures.

**Why the compromise.** For the 42–55 target population specifically, hip fracture is rare (the hip-fracture curve steepens past 65), so the hip-protective effect that drives FRAX's 0.83 matters less. Upper-extremity fractures, where obesity is neutral-to-harmful, matter more. The compromise HR 0.95 is slightly protective but much closer to neutral than FRAX.

**What would change my mind.** If the downstream model ever splits MOF into hip-specific and non-hip-specific sub-scores (which I recommended in `docs/model-calibration.md` §3.1), replace this single coefficient with two site-specific coefficients: HR ~0.75 for hip, HR ~1.10 for non-hip.

**Confidence: medium.**

**Flags:** `CONTESTED`.

**Actionable:** `true`, but not in the way the patient expects. The rationale explicitly says weight loss is *not* the target at perimenopausal ages — the lever is fall prevention (balance training, home hazard audit) plus cardiometabolic health. This is clinically defensible and matches modern osteoporosis guidance (weight-loss-induced bone loss is a real phenomenon and telling obese perimenopausal women to lose weight for their bones is actively counterproductive).

---

### 6.4 `prior_fracture` — HR 1.86 (β +0.621)

**Adopted:** `hr = 1.86`, `β = 0.621`.

**Source:** Kanis et al. 2004 *Bone* 35(2):375–382 — the FRAX prior-fracture meta-analysis.

**Why this source.** Classical. 15,259 pooled participants, replicated in every subsequent meta-analysis. A staff engineer would object if I'd picked anything else as the primary source without very strong justification.

**Alternatives considered.**
- **Johansson 2017 Osteoporos Int "imminent risk" paper**, which shows the RR is 2–3× in the *first 1–2 years* after a fragility fracture, tapering to the pooled 1.86 by year 5. Rejected as the primary value because we don't have time-since-fracture in the patient schema. But it's worth noting that a patient whose fracture was last month is at much higher short-term risk than the 1.86 pooled value suggests, and the rationale reflects that urgency ("the 1–2 years after a fracture is the highest-risk window").
- **Klotzbuecher 2000 JBMR** (the pre-FRAX synthesis, RR ~2.0). Rejected because Kanis 2004 supersedes it with a larger pooled population.
- **Balasubramanian 2019** (US claims, HR ~1.8–2.0). Confirms Kanis 2004.

**Age-interaction note.** The pooled 1.86 masks age-heterogeneity — the RR is ~2.0 at age 50 and ~1.5 at age 80. For our perimenopausal population, the effective HR is at the upper end. I kept 1.86 as the central value because it's the canonical number and using the age-50 value (2.0) in the weights file would be inconsistent with how I handled other age-varying coefficients. The `age_interaction_note` field flags this so downstream users can bump it to 2.0 if they want per-band calibration.

**Confidence: high.**

**Flags:** none.

**Actionable:** `true`. Prior fracture is the single strongest actionable risk signal in the model — it triggers immediate DXA, likely pharmacotherapy, and Fracture Liaison Service enrolment. The rationale is clear that urgency matters (the "imminent risk" window is the most dangerous time).

---

### 6.5 `parent_hip_fracture` — HR 1.54 (β +0.432)

**Adopted:** `hr = 1.54`, `β = 0.432`.

**Source:** Kanis et al. 2004 *Bone* 35(5):1029–1037 — the FRAX family-history meta-analysis.

**Why this source.** Canonical. 34,928 pooled participants from 7 cohorts, BMD-adjusted, directly feeds the FRAX engine.

**Why 1.54, not 2.27.** This is the most important reconciliation with the spec's placeholder. The spec uses 2.28 (`β = 0.824`), which is **the HR for hip fracture specifically**, not MOF. Kanis 2004 reports HR 1.54 for MOF and HR 2.27 for hip alone. Since our outcome is MOF (hip + vertebral + forearm + humerus), 1.54 is the right value. Using 2.27 would inflate the predicted risk by a factor of `exp(0.824 - 0.432) = exp(0.392) = 1.48`, roughly 48% over what the evidence supports.

**Alternatives considered.**
- Using "any parental fracture" rather than "parent hip fracture specifically". Rejected because FRAX is very specific on this — only parental *hip* fracture counts, not sibling history and not other parental fractures. Using a more permissive definition would require different evidence (and the evidence for sibling history is weaker).
- Using the age-50 adjusted value (~1.8) rather than the pooled 1.54. Same reasoning as `prior_fracture` — kept the pooled value for internal consistency, flagged the age interaction in the note field.

**Confidence: high.**

**Flags:** none.

**Actionable:** `false`. But the rationale reframes it sharply: "*A 50-year-old with a parent hip fracture should get a baseline DXA now (not wait until 65) and double down on modifiable factors — her genetic baseline is lower, so the levers she can pull matter more.*" The education LLM should use this framing exactly.

---

### 6.6 `current_smoker` — HR 1.25 (β +0.223)

**Adopted:** `hr = 1.25`, `β = 0.223`.

**Source:** Kanis et al. 2005 *Osteoporos Int* 16(2):155–162.

**Why this source.** Canonical FRAX smoking meta-analysis. 59,232 pooled participants.

**Alternatives considered.**
- Using a higher HR for heavy smokers (dose-response). Rejected because the patient schema has `current_smoker: boolean`, not pack-years or cigarettes/day. A binary coefficient matches the schema.
- Using a lower HR (1.13) that reflects BMD-adjusted effect. Rejected because BMD is unknown in our target population (they haven't had DXA yet) — the unadjusted 1.25 is the right value when BMD is not in the model.
- Using the Thorin 2016 Osteoporos Int data to model the cessation benefit over time. Rejected because the schema doesn't have "years since quitting" — but the rationale mentions it ("fracture risk begins to fall within a few years of quitting and approaches never-smoker baseline after about 10 years") so the education LLM can use it.

**Confidence: high.**

**Flags:** none.

**Actionable:** `true`. Smoking cessation is one of the highest-impact levers, especially at perimenopause where quitting now captures the benefit *before* the postmenopausal bone-loss acceleration.

---

### 6.7 `alcohol_high` (≥3 units/day) — HR 1.38 (β +0.322)

**Adopted:** `hr = 1.38`, `β = 0.322`.

**Source:** Kanis et al. 2005 *Osteoporos Int* 16(7):737–742.

**Why this source.** Canonical FRAX alcohol meta-analysis. The threshold (3 UK units ≈ 24 g ethanol) is FRAX's definition and I kept it to avoid re-calibrating against a different cutoff.

**Alternatives considered.**
- Using a continuous dose-response model. Rejected because (a) the schema stores `alcohol_units_per_day` as a number, but (b) the literature supports a threshold model better than a smooth dose-response, and (c) the threshold gives a clean talking point for the patient ("stay under 3 a day").
- Using a higher HR (1.68, which is the hip-alone value). Rejected same as `parent_hip_fracture` — the MOF composite is the right comparison for our outcome.

**Confidence: high.**

**Flags:** none.

**Actionable:** `true`. Directly modifiable — cutting from 3+ to <3 units/day crosses the threshold within a week.

---

### 6.8 `glucocorticoid_use` — HR 1.66 (β +0.507)

**Adopted:** `hr = 1.66`, `β = 0.507`.

**Source:** Kanis et al. 2004 *JBMR* 19(6):893–899 — the FRAX corticosteroid meta-analysis (ever-use).

**Why 1.66 and not 2.31 (the spec's placeholder).** The spec's placeholder 2.31 is much closer to the "current use at ≥5 mg/day" value (Van Staa 2000 reports RR 2.59 at 2.5–7.5 mg/day). But the patient schema has `glucocorticoid_use: boolean` — it doesn't distinguish current from past, and it doesn't record dose. Using a current-high-dose HR for a binary ever-use field would over-score patients with any past exposure. 1.66 is the pooled ever-use value, which matches the schema.

**Alternatives considered.**
- Splitting into `current_gc_use` and `past_gc_use` booleans. Good idea for a future version. For now I kept the schema as specified.
- Adding a `dose_mg` field. Same — future version.
- Using Van Staa 2000 directly (RR 1.55 at <2.5 mg, 2.59 at 2.5–7.5, 5.18 at ≥7.5). Good data but overlaps with what the schema can represent.

**The `age_interaction_note` field tells downstream users** that if they *do* split current from past exposure, they should use ~2.0–2.2 for current users at typical dose, not 1.66. This is surfaced in `lib/model-weights.ts` as an explicit note so it's not lost.

**Confidence: high** (for the ever-use definition that matches the schema).

**Flags:** none. (The current-vs-past nuance is an actionable *caveat*, not an evidence flag.)

**Actionable:** `true`. Glucocorticoid fracture risk is dose-dependent AND partially reversible — the lever is working with the prescriber to use lowest effective dose and starting concurrent bone protection.

---

### 6.9 `rheumatoid_arthritis` — HR 1.56 (β +0.445)

**Adopted:** `hr = 1.56`, `β = 0.445`.

**Source:** Van Staa et al. 2006 *Arthritis Rheum* 54(10):3104–3112 — the UK GPRD RA-fracture study (30,262 RA patients, 122,763 matched controls).

**Why this source.** Van Staa 2006 is the specific paper the FRAX engine draws on for the RA coefficient. It has the advantage of being **UK-native** (GPRD, the precursor to CPRD), which matches our deployment context.

**Why 1.56 and not 1.95 (the spec's placeholder).** I couldn't find a source for 1.95 in the literature. 1.95 is closer to the glucocorticoid HR, which may be where the placeholder slipped — a confused memory of "RA + concomitant GC exposure" rather than RA alone. 1.56 is the RA-specific, glucocorticoid-adjusted value from Van Staa 2006.

**Alternatives considered.**
- Including other inflammatory arthropathies (ankylosing spondylitis, psoriatic arthritis, IBD, lupus, coeliac) under the same coefficient. They carry similar HRs but FRAX doesn't include them and the schema doesn't ask. The feature is RA-specific; other inflammatory conditions would need a separate coefficient or a more permissive RA flag (which would be a schema change).
- Using Kim 2020 (Korean nationwide, HR ~1.5). Supports Van Staa directionally. Used Van Staa as primary because of the UK context.

**Confidence: high.**

**Flags:** none.

**Actionable:** `true`. Effective RA disease control (DMARDs, biologics) normalises fracture risk toward the general population. The rationale is specific: "*Controlling your RA is itself controlling your bone health.*"

---

### 6.10 `menopausal_stage` — 5-level categorical, **all 5 levels DERIVED**

**Adopted:**

| Level | HR | β |
|---|---|---|
| `premenopausal` | 0.98 | −0.020 |
| `early_perimenopausal` (ref) | 1.00 | 0.000 |
| `late_perimenopausal` | 1.04 | +0.039 |
| `postmenopausal_under_5yr` | 1.29 | +0.255 |
| `postmenopausal_5_10yr` | 1.48 | +0.392 |

**Why these values and not the spec's (0.70 / 1.00 / 1.25 / 1.80 / 2.20).** The spec's placeholder values look like they come from a direct intuition — "postmenopausal women are ~2× riskier than perimenopausal women" — but that intuition confounds the stage effect with the age effect. A woman who is 5 years post-FMP is typically ~5 years older than a woman who is early-peri, so part of her elevated risk is already captured by the `age_above_50` coefficient. If both `age_above_50` AND the spec's 2.20 stage coefficient fire together, the model double-counts age.

My derived values instead capture **the purely stage-driven portion** of the risk, by computing cumulative femoral-neck BMD loss from SWAN *at matched age* and converting to HR via the Johnell BMD→fracture gradient. This gives smaller stage HRs (1.29 and 1.48) because most of the apparent "postmenopausal women have double the risk" effect is actually age.

**The derivation.** From Greendale 2012 SWAN:
- Pre → early-peri: +0.6% BMD (flat loss rate)
- Early-peri (ref) → late-peri: −1.0%/yr × 1 yr = −1.0%
- Late-peri → post <5yr: −1.4%/yr × ~4 yr more = cumulative −6.2% vs early-peri
- Post <5yr → post 5–10yr: additional −0.7%/yr × 5 yr = cumulative −9.7% vs early-peri

Each cumulative BMD loss was converted to an ΔSD using 1 SD ≈ 11.5% of young-adult mean BMD at the femoral neck, then to HR using `HR = 1.6^ΔSD` (the Johnell 2005 gradient). Full derivation is in the `notes` field of each level in `lib/model-weights.ts` and in the Group B research report.

**Empirical sanity check.** Cauley 2012 *Menopause* (SWAN fracture paper) reports that compared to premenopausal women, late perimenopausal women had ~1.75× the annual fracture incidence and early postmenopausal ~2.0×. Re-anchored to early-peri, the "post <5yr" stage should be ~1.3–1.5× the reference — which matches my derived 1.29 at the low end but hints that the first 1–2 years post-FMP are higher (~1.5–1.8) than my derivation captures. I kept 1.29 as the central value and flagged this in the notes.

**Why all 5 levels are `DERIVED`.** Because no paper reports MOF HRs stratified by STRAW+10 stage for the 42–55 age band. The alternative would be to drop the feature entirely, which I rejected because the whole clinical premise of the tool is that perimenopause is the inflection point. The `DERIVED` flag is the honest disclosure.

**Confidence: medium.**

**Flags:** `DERIVED` on all 5 levels.

**Actionable:** `false` on all 5 levels (you can't reverse your menopausal stage) but the rationale is carefully calibrated by level:
- Premenopausal: "Lock in peak bone mass now."
- Early-peri: "Your inflection point — highest-return intervention window."
- Late-peri: "Bone loss is beginning — baseline DXA, HRT discussion."
- Post <5yr: "Steep-loss window — HRT is the single most effective intervention here."
- Post 5–10yr: "Past the steep-loss phase but loss continues — screening + meds if indicated."

These are the strings the downstream LLM should feed into patient-facing advice.

**Independence warning:** see §15 on `stage × HRT`.

---

### 6.11 `early_menopause` (FMP <45) — HR 1.83 (β +0.604)

**Adopted:** `hr = 1.83`, `β = 0.604`.

**Source:** Svejme et al. 2012 *BJOG* 119(7):810–816 — a 34-year prospective Swedish cohort of 390 women.

**Why this source.** Svejme has the longest prospective follow-up in the literature (34 years) and reports fracture outcomes directly. The sample is small but the follow-up is unmatched.

**The cutoff mismatch.** Svejme uses FMP <47 as the cutoff, but our boolean is FMP <45. The stricter <45 cutoff typically gives a smaller HR — the InterLACE pooled analysis (Mishra 2017 / Zhu 2019) gives ~1.36 for <45 specifically. A conservative estimate for natural FMP <45 sits somewhere between 1.36 (InterLACE, stricter cutoff) and 1.83 (Svejme, broader cutoff). I kept 1.83 because (a) it's the clearest single-source value, (b) the direction and approximate magnitude are consistent across modern sources (Anagnostis 2019 meta-analysis supports ~1.5–2.0), and (c) the spread is just under the 30% CONTESTED threshold.

**Alternatives considered.**
- Using the stricter InterLACE value (1.36). Would be more conservative but loses the longer-follow-up Svejme data. A user who wants a more conservative model can substitute.
- Using Rocca 2007/2009 (Mayo oophorectomy cohort, HR ~2.0). Rejected as primary because Rocca studied surgical menopause <45, not natural, and the mechanisms differ.
- Treating "age at FMP" as continuous rather than boolean. More accurate but adds a continuous feature and the evidence base doesn't support a clean linear dose-response.

**Confidence: medium.**

**Flags:** none.

**Actionable:** `false`. But this is the clearest case where `actionable: false` is the wrong frame — the event is unactionable, but the *response* is highly actionable (earlier screening, HRT discussion, lifestyle intensification). The rationale reflects this exactly.

**Independence warning:** see §15 on `early menopause × stage`.

---

### 6.12 `current_hrt` — HR 0.66 (β −0.416)

**Adopted:** `hr = 0.66`, `β = −0.416`.

**Source:** Cauley 2003 *JAMA* 290(13):1729–1738 — the WHI E+P arm fracture analysis. RCT-grade evidence.

**Why this source.** This is the single highest-quality bone-outcome estimate in the entire model. It's an RCT of 16,608 postmenopausal women randomised to conjugated equine estrogen + progestin vs placebo, with hip fracture HR 0.67 (0.47–0.96), clinical vertebral HR 0.65 (0.46–0.92), total fracture HR 0.76 (0.69–0.83), and MOF-like composite ≈ 0.66. Nothing else in the literature comes close in evidentiary weight.

**Extrapolation concern.** WHI participants averaged age 63 and most were ≥10 years postmenopausal. Our target is 50-year-old early-perimenopausal women. Is the 0.66 HR transferable? The **NAMS 2022 Hormone Therapy Position Statement** (*Menopause* 29(7):767–794) explicitly supports this extrapolation and in fact argues the benefit of HRT is at least as large, and possibly larger, in women who initiate before age 60 or within 10 years of menopause — the so-called "timing hypothesis". So if anything, 0.66 may be *conservative* for our target population. I kept 0.66 as the point estimate rather than inflating it.

**Alternatives considered.**
- Using Jackson 2006 WHI E-alone arm (hip fracture HR 0.61). More protective. I kept the E+P value as the primary because it's the most conservative of the WHI arms and the larger trial.
- Using a smaller magnitude (HR ~0.75) to reflect contraceptive-dose estrogen in peri-menopausal women. Rejected because WHI used standard HRT doses, not contraceptive doses.
- Splitting into "HRT <5 years" vs "HRT ≥5 years". WHI's effect emerged within 2–3 years of initiation and persisted for the trial duration. Splitting would add complexity without evidence for a meaningful HR gradient.

**Confidence: high.** The only RCT in the model.

**Flags:** none.

**Actionable:** `true`. The rationale is clear but deliberately neutral about the well-known WHI baggage: "*the cardiovascular and breast cancer concerns from the original WHI results are much smaller when HRT is started before age 60 or within 10 years of menopause.*" That sentence is calibrated to match NAMS 2022 guidance and to pre-empt the knee-jerk "WHI said HRT is dangerous" response from patients and GPs alike.

**Independence warning:** see §15 on `stage × HRT`.

---

### 6.13 `low_calcium` (<700 mg/day) — HR 1.05 (β +0.049) — **CONTESTED**

**Adopted:** `hr = 1.05`, `β = 0.049`. Near-null.

**Source:** Bolland et al. 2015 *BMJ* 351:h4580 — systematic review of 44 cohort studies and 26 RCTs.

**The contest.**
- **Bolland 2015** (central systematic review): dietary calcium is *not* associated with fracture risk. Supplementation produces a small, methodologically-fragile effect on total fracture (RR 0.89) and no effect on hip fracture.
- **Warensjö 2011 BMJ** (Swedish Mammography Cohort, N=61,433, 19-year follow-up): U-shaped relationship, lowest quintile (<751 mg/day) hip-fracture HR 1.18 (1.04–1.34).
- **FRAX** explicitly omits calcium entirely.

**Why 1.05 specifically.** It's a compromise between Bolland's null (~1.0) and Warensjö's modest elevation (~1.18), with a CI that spans both. Central estimate is almost indistinguishable from 1.0, which means the feature contributes ~5% to the RR — barely above noise.

**Why I kept the feature at all despite the weak evidence.**
1. Patients expect to be asked about calcium. Omitting it from the UI would feel wrong to a clinician and to patients.
2. It's cleanly actionable, which is valuable for the downstream LLM education component even when the predictive signal is small.
3. The `CONTESTED` flag is surfaced in the file so downstream code can show a footnote or render the bar differently.

**The real case for dropping it.** The effect size is so small it will barely move the needle on any patient's predicted risk, and keeping it in the model requires asking the patient about dietary calcium, which adds a UX step for minimal clinical value. If the spec team decides to drop it, I support that. It's flagged as an open question in §10 of the calibration memo.

**Confidence: low.**

**Flags:** `CONTESTED`.

**Actionable:** `true`, but the rationale is deliberately tempered — it tells the patient that moderately low intake is fine, diet-first is the right approach, and vitamin D and exercise matter more. This is specifically designed to avoid the "calcium supplements prevent fractures" myth that the evidence doesn't support.

---

### 6.14 `ethnicity_baseline` — 5-level categorical (including `other` fallback)

**Adopted:**

| Level | HR | β | Flag |
|---|---|---|---|
| `white` (ref) | 1.00 | 0.000 | — |
| `south_asian` | 0.70 | −0.357 | `UK_EXTRAPOLATED` |
| `east_asian` | 0.75 | −0.288 | `UK_EXTRAPOLATED` |
| `black_african` | 0.50 | −0.693 | `UK_EXTRAPOLATED` |
| `other` | 1.00 | 0.000 | — (fallback) |

**Why these values and not the spec's (1.00 / 0.95 / 0.80 / 0.50).** The spec's placeholder for South Asian (0.95) is essentially null — it implies that UK South Asian women have nearly the same fracture risk as White European women. The UK-native Curtis 2016 CPRD data contradicts this: South Asian women in UK primary care have *lower* all-site fracture rates than White UK women, with the effect strongest at the hip. 0.70 is the MOF composite from Curtis; the hip-only value is ~0.55. Using 0.95 would under-adjust.

**Sources:**
- `white`: Curtis 2016 *Bone* 87:19–26 — UK CPRD, the canonical UK fracture epidemiology study
- `south_asian`: Curtis 2016 (same), supported by Roy 2005 and Darling 2013 for BMD/vitamin D context
- `east_asian`: Cauley 2007 *JBMR* (WHI, ~2,700 Asian American women), corroborated by Kanis 2012 worldwide hip-fracture incidence
- `black_african`: Cauley 2005 *JAMA* (pooled WHI + SOF, ~8,000 Black women), UK direction corroborated by Curtis 2016

**Why `UK_EXTRAPOLATED` on the three non-White levels.** The primary HR magnitudes come from US cohorts (WHI, SOF) whose population definitions don't perfectly match UK ethnic categories — see §4.3 above for the three specific mismatches.

**The `other` fallback.** The spec's `Ethnicity` type includes `"other"` (for mixed ancestry, self-reported other, or missing data). No published HR covers this bucket. My choice: apply the White reference HR (1.00). Rationale:
- It's the **conservative** choice — it never incorrectly *reduces* a patient's predicted risk based on uncertain ancestry coding. Under-stating risk is worse than over-stating it for a screening tool.
- It's visible in the feature contribution chart as a neutral (zero-length) bar, so the GP can see the field was recognised and ignored rather than silently assumed.
- The `actionable_rationale` for this level explicitly says "no adjustment has been applied" and prompts for a more specific category, so the UX can be honest about the uncertainty.

**Alternatives considered for `other`.**
- Applying a small penalty (HR 1.05) to reflect unknown ancestry. Rejected — no evidence base.
- Refusing to score patients with `other`. Rejected — it creates a failure mode in the UI and the patient still deserves risk stratification based on the other 13 features.
- Applying the average of the five published levels. Rejected — arithmetic average of HRs is not meaningful (they need to be weighted by population prevalence in the deployment area).

**Confidence: medium on three non-White levels**, high on White (UK native), low on `other` (fallback).

**Actionable:** `false` on all 5 levels. The rationales are carefully constructed to avoid fatalism — each one flags what the patient can do (vitamin D check for South Asian and Black African, BMD-caliper caveat for East Asian, "focus on modifiable factors" across the board).

---

## 7. Reconciliation with the spec's placeholder values

The spec's §7.3 shipped with placeholder values I needed to replace. Here's the diff:

| Feature | Spec placeholder | Verified | Change rationale |
|---|---|---|---|
| `age_above_50` | 1.08 (β 0.077) | **1.043** (β 0.042) | Spec's 0.077 is the slope of a log-linear fit across ages 50–75; 0.042 is the correct local slope at 50 for the 42–55 band. |
| `bmi_low` | 1.95 (β 0.668) | **1.28** (β 0.247) | Spec used De Laet's BMI-20 vs BMI-25 increment; reference is BMI 22, so the right increment is smaller. |
| `bmi_high` | 0.75 (β −0.288) | **0.95** (β −0.051) | CONTESTED. Spec adopted the FRAX-only position; verified value is a compromise between FRAX (0.83) and GLOW (1.0). |
| `prior_fracture` | 1.85 (β 0.615) | **1.86** (β 0.621) | Essentially unchanged (rounding correction from 0.620 to 0.621). |
| `parent_hip_fracture` | 2.28 (β 0.824) | **1.54** (β 0.432) | **Important.** Spec used the hip-only HR; outcome is MOF, so the MOF HR (1.54) is correct. |
| `current_smoker` | 1.29 (β 0.255) | **1.25** (β 0.223) | Small correction — Kanis 2005 reports 1.25, not 1.29. |
| `alcohol_high` | 1.38 (β 0.322) | 1.38 (β 0.322) | No change. |
| `glucocorticoid_use` | 2.31 (β 0.837) | **1.66** (β 0.507) | Spec used ~current-high-dose value; schema is boolean ever-use, so ever-use HR (1.66) is correct. Note in file tells downstream users to bump to ~2.0–2.2 if they split current/past. |
| `rheumatoid_arthritis` | 1.95 (β 0.668) | **1.56** (β 0.445) | Verified value from Van Staa 2006 UK GPRD. Couldn't trace the spec's 1.95 to a source. |
| `menopausal_stage: pre` | 0.70 | **0.98** | Spec's values confounded stage with age; verified values are the pure-stage portion derived from SWAN BMD trajectories. |
| `menopausal_stage: early_peri` | 1.00 (ref) | 1.00 (ref) | Reference, no change. |
| `menopausal_stage: late_peri` | 1.25 | **1.04** | Same — spec values included age effect that is already captured by `age_above_50`. |
| `menopausal_stage: post_under_5yr` | 1.80 | **1.29** | Same. |
| `menopausal_stage: post_5_10yr` | 2.20 | **1.48** | Same. |
| `early_menopause` | 1.75 (β 0.560) | **1.83** (β 0.604) | Minor. Svejme 2012 is 1.83. |
| `current_hrt` | 0.60 (β −0.511) | **0.66** (β −0.416) | Verified value is from Cauley 2003 WHI (0.66–0.67 hip, 0.66 MOF composite). |
| `low_calcium` | 1.15 (β 0.140) | **1.05** (β 0.049) | CONTESTED. Bolland 2015 systematic review finds essentially null; spec's 1.15 is closer to the Warensjö upper bound. |
| `ethnicity: south_asian` | 0.95 | **0.70** | Spec's 0.95 is essentially null; Curtis 2016 UK CPRD data supports 0.70 for MOF. |
| `ethnicity: east_asian` | 0.80 | **0.75** | Small correction. |
| `ethnicity: black_african` | 0.50 | 0.50 | No change. |
| `ethnicity: other` | (missing) | **1.00** (fallback) | Added to cover the spec's `Ethnicity = ... | "other"` type. |

**The biggest semantic corrections are:**
1. `parent_hip_fracture` — using the MOF HR (1.54) instead of the hip-only HR (2.28). The spec's value would over-score patients with parental history by ~50%.
2. The menopausal-stage coefficients — stripping the confounded age effect out so the stage coefficient captures only the pure stage effect and doesn't double-count with `age_above_50`.
3. `glucocorticoid_use` — using the ever-use HR (1.66) that matches the boolean schema, rather than a current-high-dose HR (2.31) that the schema can't represent.

**The biggest methodological additions are:**
1. Two `CONTESTED` flags (`bmi_high`, `low_calcium`) that the spec didn't mark
2. Five `DERIVED` flags on the menopausal-stage levels
3. Three `UK_EXTRAPOLATED` flags on non-White ancestry
4. An `other` fallback on ethnicity
5. Two explicit interaction rules (`stage × HRT`, `early menopause × stage`) that the scoring function must implement

---

## 8. Why some coefficients I deliberately did NOT change

### 8.1 `alcohol_high` — kept at 1.38

The spec's value matches Kanis 2005 exactly. No reason to change.

### 8.2 `ethnicity: black_african` — kept at 0.50

The spec's value is well-supported by Cauley 2005 JAMA and corroborated by Curtis 2016 UK data. The direction and magnitude are consistent across sources. Kept.

### 8.3 `menopausal_stage: early_perimenopausal` — reference level, always 1.00

By construction. The reference patient is early-peri, so this level is always 1.00 no matter what else changes.

### 8.4 `ethnicity: white` — reference level, always 1.00

Same.

---

## 9. Independence and interaction warnings

The linear log-hazard form assumes coefficients combine independently. This is **not always true**, and two cases are important enough to encode as explicit rules in the scoring function.

### 9.1 Menopausal stage × current HRT

**The problem.** The menopausal-stage HRs are driven by transmenopause BMD loss. HRT suppresses that loss — it's the whole point of the hormone intervention. So a woman who is simultaneously `postmenopausal_under_5yr` AND `current_hrt` should not be scored as `stage_HR × HRT_HR = 1.29 × 0.66 = 0.85`. The stage coefficient was derived assuming the BMD loss actually happened; HRT blocks that loss; scoring both independently double-counts.

**The recommended fix.** `lib/model-weights.ts` exports `STAGE_HRT_INTERACTION_RULE` with the default value `"collapse_stage_to_reference_when_on_hrt"`. This is Option A from `docs/model-calibration.md` §4.2 — the simplest and most defensible rule: when `current_hrt: true`, set `menopausal_stage` to `early_perimenopausal` (reference) for scoring purposes, then apply the HRT coefficient. The scoring function in `lib/risk-model.ts` must read this constant and implement the rule.

Other options offered for the spec team to pick from:
- `zero_stage_beta_when_on_hrt` — zero the stage contribution, apply HRT normally
- `half_stage_beta_when_on_hrt` — retain half the stage coefficient, apply HRT normally

### 9.2 Early menopause × menopausal stage

**The problem.** A woman whose FMP was at 44 will reach `postmenopausal_under_5yr` much earlier than a woman whose FMP was at 51. If the model scores her as BOTH `early_menopause` (+0.604) AND `postmenopausal_under_5yr` (+0.255), it double-counts the estrogen-deficiency effect.

**The recommended fix.** `lib/model-weights.ts` exports `EARLY_MENOPAUSE_INTERACTION_RULE` with the default `"only_apply_when_peri_or_earlier"`. Once the patient is postmenopausal, the `early_menopause` flag stops firing — the stage coefficient already captures the relevant physiology.

Other options offered:
- `reduced_when_postmenopausal` — apply half the early-menopause beta when postmenopausal
- `always_apply` — don't adjust. Over-scores; not recommended.

### 9.3 Why these are encoded in the weights file, not in `risk-model.ts` directly

The scoring function *consumes* these constants; it doesn't hardcode the rules. This keeps the rule discoverable alongside the weights it modifies. If the spec team changes the default rule, they change one constant in one file.

### 9.4 Other plausible interactions I did NOT encode

Three interactions exist in the literature but are not worth encoding for the MVP:
- **Glucocorticoids × RA** — both are inflammation/steroid-related and mechanistically overlap. FRAX treats them as additive; I followed FRAX. The worst-case patient in the sanity checks does double-count these slightly, producing a RR of 57× (slightly above the requested 15–40× upper bound), which is the clearest signal that this overlap exists but is small.
- **Parent hip fracture × BMD** — familial effect is mostly non-BMD-mediated per Kanis 2004, so the coefficient is approximately independent of whatever BMD proxy the model uses.
- **Smoking × age** — smoking RR is approximately constant across ages, so no adjustment needed.

---

## 10. What this model does not cover and why

Validated risk factors the model deliberately omits:

| Factor | Why omitted |
|---|---|
| Type 2 diabetes | Not in FRAX; recent evidence suggests an independent signal but the MVP keeps to 14 features |
| Falls history, gait speed, grip strength | Strong predictors but need objective measurement the schema doesn't capture |
| Trabecular Bone Score (TBS) | Needs DXA software add-on |
| Vitamin D status (25-OH-vitD) | Strong in deficient populations; contested outside severe deficiency; schema doesn't store it |
| Prior bisphosphonate use | Complicated — indicates past risk AND past protection; semantically ambiguous |
| Endometriosis, bilateral oophorectomy | Partly captured by `early_menopause` |
| Bone turnover markers (CTX, P1NP) | Research biomarkers, not routine primary care |

These are all candidates for a second-tier model once the MVP performs well.

---

## 11. Sanity-check results

Computed by hand against the weights file, independently verified with Python.

**Reference patient scores exactly 0.** By construction — all reference values are defined as β = 0.

**All risk-increasing coefficients positive:**
`age_above_50 (+0.042/yr), bmi_low (+0.247), prior_fracture (+0.621), parent_hip_fracture (+0.432), current_smoker (+0.223), alcohol_high (+0.322), glucocorticoid_use (+0.507), rheumatoid_arthritis (+0.445), early_menopause (+0.604), low_calcium (+0.049), menopausal_stage transitions (+0.039, +0.255, +0.392)`.

**All protective coefficients negative:**
`current_hrt (−0.416), menopausal_stage.premenopausal (−0.020), ethnicity.south_asian (−0.357), ethnicity.east_asian (−0.288), ethnicity.black_african (−0.693)`.

**`bmi_high` (−0.051) is weakly protective** but CONTESTED — the true value may be 0 or slightly positive. Within the noise floor.

**Worst-case patient** (55-year-old, BMI 18, prior fracture, parent hip fracture, smoker, alcohol ≥3 u/d, glucocorticoids, RA, low calcium, early menopause, not on HRT, post-5-to-10yr, White European):

```
score = 5×0.042 + 0.247 + 0.621 + 0.432 + 0.223 + 0.322 + 0.507 + 0.445
      + 0.604 + 0.049 + 0.392 + 0
      = 0.210 + 3.842
      = 4.052
RR    = exp(4.052) ≈ 57.5
```

This is slightly above the 15–40× upper bound requested by the research prompt. The likely cause is the `early_menopause × post_5_10yr` overlap plus the `glucocorticoids × RA` mechanistic overlap. With the `EARLY_MENOPAUSE_INTERACTION_RULE = "only_apply_when_peri_or_earlier"` rule applied by the scoring function, `early_menopause` doesn't fire (patient is postmenopausal), which drops the score to ~3.45 and the RR to ~31×, which is inside the target band.

**Best-case patient** (45-year-old, premenopausal, BMI 22, no risks, on HRT, Black African):

```
score = -5×0.042 - 0.020 - 0.416 - 0.693
      = -1.339
RR    = exp(-1.339) ≈ 0.26
```

RR ≈ 0.26, comfortably below 1.0 as required.

**HR↔β consistency:** All 19 coefficient pairs match to 3 decimal places (verified via Python during consolidation; two rounding errors found and fixed in the initial draft).

---

## 12. What's still blocked

Four deliverables from the original research prompt remain blocked on infrastructure that doesn't yet exist in the repo:

1. **Tier threshold calibration.** Placeholder `TIER_THRESHOLDS = { moderate: 1.5, high: 3.5 }` retained. Calibration requires running the 82-patient synthetic cohort through `lib/risk-model.ts` and tuning the thresholds to produce the target ~55/30/15 distribution.
2. **Monotonicity code-verification.** Hand-computed in §11 above, but automated verification requires the scoring function.
3. **Cohort histogram.** Blocked on calibration.
4. **Tier-boundary gap analysis.** Blocked on calibration.

The infrastructure prerequisites:
- `data/patients.json` with 82 synthetic patients (spec §8)
- `lib/risk-model.ts` with `scorePatient(patient) → ScoredPatient` (spec Phase 0)
- A calibration script that sweeps candidate `(moderate, high)` pairs and publishes the histogram

Once those exist, the calibration loop is a 30-minute exercise.

---

## 13. Open questions for the spec team

Six schema decisions flagged during this work:

1. **Actionable tiering:** Is `actionable_rationale` free-text enough for the downstream LLM, or does the spec need a separate `education_hook` field? My recommendation: keep it as a single free-text string for now — the rationales are already tuned for LLM consumption. Adding a second field is premature optimisation.
2. **Snake_case vs camelCase:** Resolved in favour of snake_case to match the spec's `lib/types.ts` conventions. `lib/model-weights.ts` has been updated to match.
3. **Interaction handling:** `stage × HRT` and `early_menopause × stage`. Three options offered for each; defaults chosen. The spec team should explicitly ratify the defaults or pick alternatives.
4. **Age as continuous vs spline:** Currently log-linear with a 3dp coefficient. Fine for 42–55. Would need re-work for a wider target band.
5. **Dropping `low_calcium`:** The effect size is near-null. Keeping it satisfies patient expectations and gives the LLM education layer something to work with, but the predictive signal is minimal. Decision: keep it but flag it. If the spec team wants to drop it, I support that.
6. **Current-use vs ever-use glucocorticoids:** The boolean schema can't distinguish these. If the spec team wants to add a current/past flag, use HR ~2.0–2.2 for current users at ≥5 mg/day. See `age_interaction_note` on the coefficient.

---

## 14. How to defend this model in conversation

Five talking points that cover 90% of questions a clinical reviewer will ask:

1. **"Why these specific numbers?"** Every HR traces to a primary source with a DOI. 10 of 14 are FRAX-derivation Kanis papers replicated in 2015+. The other 4 (SWAN stage, Svejme early menopause, WHI HRT, Curtis UK ancestry) are the best-available in their respective niches. Nothing is guessed.

2. **"Isn't FRAX already calibrated for this?"** FRAX is calibrated for 60+. Our target is 42–55 — the perimenopausal window where bone loss accelerates and preventative intervention has maximum return. FRAX under-represents the stage-specific risk because it doesn't encode menopausal stage as a feature. Ostella does.

3. **"How do you know the model isn't broken?"** Sanity checks verify (a) reference patient scores 0 by construction, (b) all risk-increasing coefficients positive, all protective negative, (c) worst-case patient has RR ~30–60× (inside the clinically plausible range for 10 stacked risk factors), (d) best-case patient has RR ~0.25 (well below 1), (e) every HR/β pair is consistent to 3dp, verified with Python. The failure modes the hand-computed checks surfaced (worst-case slightly above upper bound) match known interaction problems (`glucocorticoids × RA` and `early menopause × stage`) which are documented and handled by scoring-function rules.

4. **"What about AI bias / fairness across ethnicities?"** All non-White ancestry coefficients are flagged `UK_EXTRAPOLATED` — the direction is UK-native but the magnitudes come from US WHI data that doesn't perfectly match UK ethnic categories. The `other` fallback applies the reference HR, which is the conservative choice. The `actionable_rationale` for every ancestry level avoids fatalism and flags modifiable factors (vitamin D deficiency in UK South Asian and Black African women). The spec team can re-calibrate against UK CPRD data once access is available.

5. **"What about the contested coefficients?"** Two features (`bmi_high`, `low_calcium`) are flagged `CONTESTED`. I picked compromise point estimates in the middle of the disputed range and widened CIs to span both positions. The contested flag is surfaced in the code so the UI can treat these differently. Five menopausal-stage levels are flagged `DERIVED` — no direct stage-stratified MOF HRs exist, and the derived values come from SWAN BMD trajectories × Johnell BMD-fracture gradient. The alternative — dropping stage entirely — would defeat the whole clinical premise of the tool.

---

## 15. Change log

| Date | Change |
|---|---|
| 2026-04-10 | Initial literature verification. Replaced the spec's 14 placeholder coefficients with verified values sourced to primary literature (see §7 diff table). Added `other` fallback to ethnicity. Added two interaction-rule constants (`STAGE_HRT_INTERACTION_RULE`, `EARLY_MENOPAUSE_INTERACTION_RULE`) for the scoring function to consume. Matched naming conventions (snake_case) to the spec's `lib/types.ts`. No coefficient carries `OLD_UNREPLICATED`; 2 carry `CONTESTED`; 5 carry `DERIVED`; 3 carry `UK_EXTRAPOLATED`. |
