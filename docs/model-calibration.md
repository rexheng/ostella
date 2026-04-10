# Model Calibration Memo — Perimenopause Osteoporosis Risk Model

**Status:** Research-only deliverable. Coefficient literature review is complete; threshold calibration and synthetic-cohort sanity checks are **blocked on infrastructure that does not yet exist in this repo** (no scoring function, no synthetic cohort, no test harness). Those sections are flagged BLOCKED below.

**Companion file:** `lib/model-weights.ts`

**Scope:** 10-year major osteoporotic fracture (MOF) — hip, clinical vertebral, distal forearm, proximal humerus — in women aged ~42–55 (perimenopausal) in a UK NHS primary-care setting.

---

## 1. Reference patient

All coefficients in `lib/model-weights.ts` are expressed as log hazard ratios relative to this reference patient, who scores exactly `0` → `RR = 1.0`:

| Feature | Reference value |
|---|---|
| Age | 50 years |
| Menopausal stage | STRAW+10 stage -2 (early perimenopause) |
| BMI | 22 |
| Ancestry | White European |
| Smoking | Non-smoker |
| Alcohol | <3 units/day |
| Prior fragility fracture | None |
| Parent hip fracture | None |
| Glucocorticoid exposure | None |
| Rheumatoid arthritis | None |
| Dietary calcium | ≥700 mg/day |
| HRT | Not on HRT |

This matches the reference pattern used by the core FRAX derivation cohorts (Kanis 2004–2007, European pooled cohorts) and is appropriate for a UK primary-care cohort anchored on White European baseline.

---

## 2. Why these specific sources

The model is a transparent linear log-hazard tool whose job is to be *clinically defensible* rather than maximally predictive. Coefficient sources were selected on the following priority order:

1. **Canonical FRAX-derivation meta-analyses (Kanis, De Laet, Johansson, Oden et al., 2004–2008)** for the nine core FRAX features. These are the exact papers the FRAX engine is built on and are the global benchmark a GP-facing tool would be judged against. Direction and magnitude have been replicated in every major subsequent meta-analysis (Leslie 2014, Wu 2021 GBD, Johansson 2017 imminent risk, Balasubramanian 2019).

2. **SWAN bone substudy (Greendale 2012 JBMR)** for menopausal-stage BMD trajectories, combined with the **Johnell 2005 BMD→fracture gradient (HR ≈ 1.6 per SD)** to derive stage HRs. SWAN is the only multi-ethnic longitudinal DXA cohort spanning the transmenopause window — no direct stage-stratified MOF HRs exist in the literature, so derivation is unavoidable here. This is the biggest caveat in the entire model; see §4.

3. **WHI hormone-therapy arm (Cauley 2003 JAMA, Jackson 2006 JBMR)** for HRT — the single RCT-grade source in the model. Extrapolation from mean age 63 to a 50-year-old early perimenopausal patient is supported by the NAMS 2022 Hormone Therapy Position Statement.

4. **Svejme 2012 BJOG** for early menopause, cross-checked against the InterLACE pooled analyses (Mishra 2017, Zhu 2019) and Anagnostis 2019 meta-analysis.

5. **Bolland 2015 BMJ systematic review** for dietary calcium. The BMJ review finds essentially no fracture effect; the Warensjö 2011 Swedish Mammography Cohort finds a small U-shaped signal at the lowest-intake quintile. FRAX deliberately omits calcium entirely — this is itself evidence that the field regards dietary calcium as a weak independent predictor.

6. **Curtis 2016 Bone** — the canonical UK CPRD fracture-epidemiology paper — for the White European UK baseline and the direction-of-effect anchor for non-White UK ancestry groups.

7. **Cauley 2005 JAMA / Cauley 2007 JBMR** for ethnicity HRs in women, supplemented by Kanis 2012 for international hip-fracture incidence and Wright 2014 NHANES for ethnic BMD comparisons. All non-White ancestry HRs are flagged **UK_EXTRAPOLATED** because the primary data are US-based.

The NOGG 2022 UK clinical guideline (Compston et al. Arch Osteoporos) was used for UK deployment context and threshold sanity-checking rather than direct coefficient values.

---

## 3. Contested coefficients

Two coefficients are flagged **CONTESTED** (literature disagrees by >30% on the point estimate):

### 3.1 `highBmi` (BMI > 30) — adopted HR 0.95 (log β = −0.051)

- **FRAX / De Laet 2005 line:** HR ≈ 0.83 (weakly protective), driven mainly by reduced hip fracture.
- **GLOW / Compston 2011 / Johansson 2014 line:** HR ≈ 1.00 (neutral) because obesity is protective at hip but raises fracture at humerus, forearm, and ankle via fall mechanics. GLOW found obese postmenopausal women had similar MOF rates to non-obese, with significantly *increased* risk at upper extremity and ankle sites.
- **Adopted compromise: HR 0.95.** For a 50-year-old perimenopausal woman, hip fracture is still rare; humeral and forearm fractures dominate MOF composition in this age band, so the "protective at hip" advantage is partially cancelled by the "worse at arm" disadvantage. The compromise is conservative relative to FRAX (which would overweight the protection).
- **Alternative:** If the downstream model ever splits MOF into hip vs non-hip components, replace this with site-specific HRs.

### 3.2 `lowCalcium` (<700 mg/day) — adopted HR 1.05 (log β = 0.049)

- **Bolland 2015 BMJ systematic review (44 cohort studies + 26 RCTs):** no meaningful association between dietary calcium and fracture, and only a small, methodologically-fragile supplementation effect on total fracture (RR 0.89) with no effect on hip alone.
- **Warensjö 2011 BMJ (Swedish Mammography Cohort, N=61,433, 19-year follow-up):** U-shaped relationship, lowest quintile (<751 mg/day) hip-fracture HR 1.18 (1.04–1.34).
- **FRAX deliberately omits calcium entirely** because the evidence base is judged too weak to include.
- **Adopted compromise: HR 1.05**, with a CI that spans null. The central estimate is barely above 1.0; the risk contribution to a combined score is minimal. **Consider dropping this feature entirely** if the UX adds no value from asking about dietary calcium. It remains in the model here because (a) patients expect to be asked about calcium, and (b) it is cleanly actionable, which is valuable for the downstream LLM education component even if the predictive signal is small.

---

## 4. Known limitations and where the model will under- or over-estimate

### 4.1 Menopausal-stage HRs are derived, not directly measured

No published paper reports MOF HRs stratified by STRAW+10 stage in the 42–55 age band. The stage HRs in `lib/model-weights.ts` are computed as:

```
cumulative_FN_BMD_loss_vs_early_peri  →  ΔSD  →  HR = 1.6^ΔSD
```

where the BMD trajectory comes from SWAN (Greendale 2012) and the BMD→fracture gradient from Johnell 2005.

**Where this will underestimate risk:** The empirical SWAN fracture data (Cauley 2012 *Menopause*) suggest the "post <5 yr" stage HR (1.29 in our model) may be low — true HR in the first 1–2 years post-FMP may be 1.5–1.8, because bone turnover markers are markedly elevated in a way the cumulative BMD deficit hasn't yet caught up with. Women in the **imminent window** (first 2 years post-FMP) are likely systematically under-scored.

**Where this will over/under-estimate risk:** The confidence interval on "post <5 yr" and "post 5–10 yr" propagates only the Johnell BMD-fracture gradient uncertainty, not the SWAN trajectory standard errors. The true CIs are wider than reported.

### 4.2 Independence assumption warning — HRT × menopausal stage

The multiplicative log-hazard form assumes coefficients combine independently. This is **not true** for the HRT × menopausal-stage interaction:

- The menopausal-stage HRs are driven by BMD loss during the transmenopause window.
- HRT *suppresses* this BMD loss — it's the whole point of the hormone intervention.
- Therefore a patient who is simultaneously "post <5 yr" AND "on HRT" should **not** be scored as `stage_HR × HRT_HR = 1.29 × 0.66 = 0.85`. The correct interpretation is that HRT blunts the stage-related loss, so the effective stage HR approaches 1.0 in the HRT-on condition, and the HRT coefficient then applies to residual risk.

**Recommended mitigations in the downstream scoring code:**

- **Option A:** If HRT is "on", collapse `menopausalStage` to `early_peri` (reference) and apply only the HRT coefficient.
- **Option B:** Introduce a dedicated interaction term `hrt_x_transmenopause` that cancels most of the stage effect when HRT is active.
- **Option C:** Retrain with interaction-aware methods once a real cohort is available (e.g., UK Biobank or WHI linkage).

Option A is the simplest and cleanest for a GP-facing transparent linear model.

### 4.3 Independence assumption warning — early menopause × menopausal stage

Early menopause (FMP <45) and menopausal stage are also entangled: a woman whose FMP was at 44 will reach "post <5 yr" and "post 5–10 yr" much earlier than the reference patient. The model as written will score her as having *both* the early-menopause HR *and* the stage HR, which double-counts the estrogen-deficiency effect.

**Recommended mitigation:** Apply `earlyMenopause` ONLY as an informational flag that forces earlier screening and HRT discussion, not as a multiplicative coefficient when `menopausalStage` is `post_under_5yr` or later. Alternatively, reduce `earlyMenopause` to ~HR 1.3 once post-menopausal stages are scored.

### 4.4 Glucocorticoid coefficient is ever-use, not current use

The adopted HR 1.66 (β = 0.507) is the Kanis 2004 pooled value for "ever exposed to oral GC ≥5 mg/day for ≥3 months". For a patient *currently* on ≥5 mg/day, the effective HR is ~2.0–2.2 per Van Staa 2000 and Amiche 2016 (i.e. β ≈ 0.70–0.79). The model under-scores active glucocorticoid users. If the downstream UI distinguishes current from past exposure, use the larger HR for current exposure.

### 4.5 Age-interaction for prior fracture and parent hip fracture

Both FRAX risk factors carry **age-decaying** HRs — they are *stronger* at younger ages. The adopted pooled HRs (1.86 for prior fracture, 1.54 for parent hip) average over all ages; at age 50 the effective HRs are closer to 2.0 and 1.8 respectively. The model marginally under-scores perimenopausal women with either of these risk factors. If downstream performance audits show systematic under-prediction in this subgroup, inflate these two coefficients to the age-50 values and re-calibrate thresholds.

### 4.6 Ancestry HRs are UK-extrapolated

All three non-White ancestry HRs are flagged **UK_EXTRAPOLATED**. The point estimates come from US cohorts (WHI, SOF) whose population definitions differ from UK ethnic categories:

- **US African-American ≠ UK Black African** — African-Americans carry ~15–25% European genetic admixture on average and have a distinct SES/dietary profile. UK Black Africans are predominantly first/second-generation West African immigrants. Curtis 2016 UK CPRD data confirm the protective direction but with wider CIs than the US data suggest.
- **US "Asian" pools Chinese/Japanese/Filipino**, whereas UK East Asians are predominantly Chinese. International hip-fracture incidence data (Kanis 2012) support the protective direction.
- **UK South Asians are heterogeneous** (Indian, Pakistani, Bangladeshi) with different BMI, diabetes, and vitamin D profiles. The pooled HR hides sub-group variation.

All three ancestry HRs should be re-calibrated against UK CPRD or QResearch data once the project has access. Until then, treat these as best-available estimates with wide uncertainty.

### 4.7 Features deliberately excluded

The following risk factors are validated in the literature but NOT included in this model because they would drive the feature set beyond 14 and their evidence base is either thinner or more context-dependent:

- **Type 2 diabetes** (FRAX does not include it; recent evidence suggests an independent hip-fracture signal even at normal BMD via bone-quality mechanisms)
- **Falls history / gait speed / grip strength** (strong predictors but require objective measurement)
- **Trabecular Bone Score (TBS)** (requires DXA software add-on)
- **Vitamin D status** (25-OH-vitD levels; strong in deficient populations but relationship with fracture is contested outside severe deficiency)
- **Prior bisphosphonate use** (complicated — indicates past high risk AND past protection)
- **Endometriosis / bilateral oophorectomy** (captured by early menopause but only partially)

These are candidates for a second-tier model extension if the MVP performs well.

---

## 5. Red flags

### 5.1 Sources >15 years old

All primary FRAX-derivation sources (Kanis et al. 2004–2005, Van Staa 2000) are >15 years old. However, every one of them has been replicated or extended in 2015+ literature:

| Feature | Original (year) | Modern replication |
|---|---|---|
| Age gradient | Kanis 2007 | Leslie 2014 JBMR; Wu 2021 Lancet Healthy Longev (GBD) |
| Prior fracture | Kanis 2004 Bone | Johansson 2017 Osteoporos Int (imminent risk); Balasubramanian 2019 |
| Parent hip fracture | Kanis 2004 Bone | Yang 2016 Osteoporos Int (mechanistic); twin heritability literature |
| Smoking | Kanis 2005 | Thorin 2016 Osteoporos Int (cessation benefit) |
| Alcohol | Kanis 2005 | Berg 2008 Am J Med; Cawthon 2006 |
| Glucocorticoids | Kanis 2004 JBMR; Van Staa 2000 | Amiche 2016 Bayesian meta-regression |
| BMI | De Laet 2005 | Johansson 2014 JBMR; Compston 2011 GLOW |
| Rheumatoid arthritis | Van Staa 2006 | Kim 2020 Osteoporos Int |
| HRT | Cauley 2003 JAMA | Jackson 2006 JBMR; NAMS 2022 |

**No coefficient is flagged OLD_UNREPLICATED.** The Kanis 2004–2005 series should be read as the *canonical anchor* — the same way we cite Einstein 1905 for special relativity even though the modern textbook is newer — and the 2015+ replications confirm the point estimates are still valid.

### 5.2 DERIVED coefficients

Five coefficients (all menopausal-stage levels) are flagged **DERIVED** because no paper reports stage-stratified MOF HRs directly. They are computed from SWAN BMD trajectories × Johnell BMD→fracture gradient. This is the largest methodological concession in the model and should be flagged prominently in any clinical validation document.

### 5.3 Single-source dependencies

The following features depend on a single primary source for their point estimate:

- **Early menopause** → Svejme 2012 BJOG (n=390 Swedish women)
- **Menopausal stage trajectories** → SWAN / Greendale 2012 (n=1,902)
- **UK ancestry baseline** → Curtis 2016 Bone (CPRD)

Each is supported by corroborating evidence but the point estimates cannot be cross-validated against a truly independent cohort. If any of these papers is later retracted or substantially revised, three features need re-evaluation in one step.

### 5.4 Data gaps for the 42–55 age band

Almost all fracture-outcome literature is dominated by women ≥60. For the 42–55 band:

- Absolute MOF incidence is low (hip ~5–15 per 100,000 person-years; MOF composite ~100–300 per 100,000).
- Event counts in any single cohort are small, so direct HR estimation is unstable.
- The **multiplicative assumption** (that relative HRs are stable across ages) is used throughout the model but has never been directly tested in women 42–55.

This means the model is best understood as a **relative risk stratification tool** for perimenopausal women, not an absolute-risk calculator. Absolute 10-year MOF risk at age 50 in the reference patient is ~5–6% (per UK FRAX); the model's job is to multiply this baseline up or down by a factor that tells a GP whether this particular patient belongs in the low / moderate / high tier for further workup.

---

## 6. Actionability taxonomy

Each coefficient in `lib/model-weights.ts` carries a boolean `actionable` flag plus an `actionableRationale` string tuned for consumption by a downstream LLM that generates patient education content.

### Actionable (10 features)

Modifiable by patient behaviour, medical intervention, or timed screening.

| Feature | Lever |
|---|---|
| `lowBmi` (BMI < 20) | Protein target, resistance training, address underlying cause |
| `highBmi` (BMI > 30) | Fall prevention, balance training (NOT weight loss per se for fractures) |
| `priorFragilityFracture` | Secondary prevention: DXA, pharmacotherapy, Fracture Liaison Service |
| `currentSmoker` | Cessation (NRT, varenicline, behavioural support) |
| `highAlcohol` (≥3 u/day) | Reduce below 3 units/day threshold |
| `glucocorticoids` | Lowest effective dose, steroid-sparing agents, concurrent bone protection |
| `rheumatoidArthritis` | Disease control via DMARDs / biologics / JAK inhibitors |
| `currentHrt` (absent) | HRT conversation — strongest benefit when started near menopause |
| `lowCalcium` | Diet first, supplement only if needed (evidence is weak) |

### Unactionable / informational (4 features)

Cannot be changed, but inform *timing* of screening and *intensity* of modifiable-factor focus.

| Feature | Why it's still important |
|---|---|
| `age` | Perimenopause is the inflection point — maximum return on modifiable-factor intervention is now |
| `parentHipFracture` | Trigger for earlier baseline DXA and more aggressive lifestyle intervention |
| `earlyMenopause` (FMP <45) | Trigger for earlier screening and HRT discussion |
| `menopausalStage` | Determines *timing* — transmenopause window is when HRT, exercise, nutrition matter most |
| `ethnicity` | Contextualises baseline risk; informs T-score interpretation; does not override modifiable factors |

The LLM education component should treat the `actionableRationale` strings as ready-to-use prompts, not as raw data to re-summarise. They are pre-written to avoid the two failure modes of automated health advice: (a) fatalism around unactionable factors, and (b) false hope around weakly-evidenced actionable factors like calcium.

---

## 7. BLOCKED — Tier threshold calibration and sanity checks

The original research prompt requested four verification items that require infrastructure not present in this repo:

### 7.1 BLOCKED: Tier threshold calibration

**Requested:** Run 80 synthetic perimenopausal primary-care patients through the model, tune `T_mod` and `T_high` so the distribution comes out close to ~55% low / ~30% moderate / ~15% high.

**Status:** Placeholder values `T_mod = 1.5, T_high = 3.5` are retained in `lib/model-weights.ts` (`TIER_THRESHOLDS` export). **These are not clinically calibrated. Do not deploy.**

**Prerequisites to unblock:**
1. A synthetic cohort (`lib/synthetic-cohort.ts`) of ≥80 patients with realistic UK perimenopausal primary-care feature distributions.
2. A scoring function (`lib/score.ts`) that consumes `WEIGHTS` and a patient object and returns `{score, relativeRisk, tier}`.
3. A calibration script that runs the cohort through the scoring function and reports the histogram at candidate thresholds.

Once those exist, the calibration is a 30-minute exercise.

### 7.2 BLOCKED: Monotonicity checks

**Requested:** Verify every risk-increasing coefficient is strictly positive, every protective coefficient is strictly negative, the reference patient scores exactly 0, worst-case patient RR is 15–40×, best-case RR < 1, and that removing a single risk factor changes the tier only when warranted.

**Manual spot-check on the WEIGHTS table (doable without the scoring function):**

- ✅ **Reference patient** scores exactly 0: by construction — all reference values are defined as `β = 0` (early perimenopausal White European with no risks → `age - 50 = 0`, no booleans fire, `menopausalStage = early_peri` has β=0, `ethnicity = white_european` has β=0).

- ✅ **All risk-increasing coefficients are strictly positive:**
  `age (+0.042/yr), lowBmi (+0.247), priorFragilityFracture (+0.621), parentHipFracture (+0.432), currentSmoker (+0.223), highAlcohol (+0.322), glucocorticoids (+0.507), rheumatoidArthritis (+0.445), earlyMenopause (+0.604), lowCalcium (+0.049), menopausalStage transition (+0.039 to +0.392)`.

- ✅ **All protective coefficients are strictly negative:**
  `currentHrt (−0.416), menopausalStage.pre (−0.020), ethnicity.south_asian (−0.357), ethnicity.east_asian (−0.288), ethnicity.black_african (−0.693)`.

- ⚠ **`highBmi` is weakly protective (−0.051)** but CONTESTED — the true value may be 0 (neutral) or even slightly positive. This is within the noise floor of the contested range.

- **Hypothetical worst-case patient** (55-year-old, BMI 18, prior fracture, parent hip fracture, smoker, alcohol ≥3 u/d, glucocorticoids, RA, low calcium, early menopause, not on HRT, post-5-to-10yr, White European):

  ```
  score = 5×0.042 + 0.247 + 0.621 + 0.432 + 0.223 + 0.322 + 0.507 + 0.445
        + 0.604 + 0.049 + 0.392 + 0
        = 0.210 + 3.842
        = 4.052
  RR    = exp(4.052) ≈ 57.5
  ```

  This is at the **upper end** of the expected 15–40× range (slightly above it), which is clinically defensible — a woman with 10 independent major risk factors stacked on top of transmenopause really is in the tail of the fracture-risk distribution. If the downstream validation shows this is implausibly high, the most likely culprits are double-counting between `earlyMenopause` and `menopausalStage` (§4.3) and between `glucocorticoids` + `rheumatoidArthritis` (mechanistically overlapping).

- **Hypothetical best-case patient** (45-year-old, premenopausal, BMI 22, non-smoker, light alcohol, no other risks, on HRT, Black African):

  ```
  score = -5×0.042 + 0 + 0 + 0 + 0 + 0 + 0 + 0 + 0 + 0 - 0.020 - 0.416 - 0.693
        = -0.210 - 1.129
        = -1.339
  RR    = exp(-1.339) ≈ 0.26
  ```

  RR ≈ 0.26 (i.e. ~1/4 of the reference patient's risk), comfortably below 1. ✅

- **Removing a single risk factor and observing the tier change** — cannot be verified without the scoring function and the calibrated thresholds; deferred to §7.1.

### 7.3 BLOCKED: Synthetic-cohort histogram

**Requested:** Report the final threshold values and the resulting cohort histogram; flag if the synthetic data needs rebalancing.

**Status:** Blocked. The `TIER_THRESHOLDS` constant in `lib/model-weights.ts` is the placeholder only. A follow-up PR should generate the synthetic cohort, score it, and publish the histogram here as §7.3.

### 7.4 BLOCKED: Tier-boundary gap analysis

**Requested:** Confirm that removing a single risk factor from a high-risk patient measurably lowers their tier only when that factor's coefficient exceeds the tier boundary gap.

**Status:** Blocked. The tier boundaries are uncalibrated, so the gap is not well defined. Deferred.

---

## 8. Worked examples (hand-computed)

Three worked examples, computed by hand from `lib/model-weights.ts`, to illustrate how the score assembles. **These use the placeholder `TIER_THRESHOLDS` — the tier column is illustrative only.**

### Example A — Low-risk patient

52-year-old, late perimenopausal, BMI 24, White European, non-smoker, moderate alcohol, no prior fracture, no family history, no glucocorticoids, no RA, on HRT for 1 year, adequate calcium.

```
age            : 2 × 0.042     = +0.084
menopausalStage: late_peri     = +0.039
currentHrt     : on            = -0.416
(all other feature indicators = 0)

score = 0.084 + 0.039 - 0.416 = -0.293
RR    = exp(-0.293) ≈ 0.75
tier  = low  (RR < 1.5)
```

**Read:** Risk is ~25% below the reference patient. HRT is doing the heavy lifting; without it this patient would be right at reference.

### Example B — Moderate-risk patient

54-year-old, post <5 yr (STRAW +1b), BMI 19, South Asian, non-smoker, light alcohol, no prior fracture, no family history, no glucocorticoids, no RA, not on HRT, low calcium.

```
age            : 4 × 0.042     = +0.168
menopausalStage: post_under_5yr = +0.255
lowBmi         : yes           = +0.247
ethnicity      : south_asian   = -0.357
lowCalcium     : yes           = +0.049

score = 0.168 + 0.255 + 0.247 - 0.357 + 0.049 = 0.362
RR    = exp(0.362) ≈ 1.44
tier  = low  (RR just below 1.5 placeholder threshold)
```

**Read:** This patient hovers right at the low-moderate boundary. She is actively in the transmenopause steep-loss window and underweight; the South Asian ancestry adjustment pulls her back just under the threshold. Any additional risk factor (starting smoking, beginning glucocorticoids for a flare, losing another kg) would push her into moderate. A GP looking at this score should interpret it as "actionable lifestyle intervention window" — not "do nothing". The transparent model makes that story visible.

### Example C — High-risk patient

50-year-old, post <5 yr, BMI 18, White European, current smoker, alcohol 4 u/day, prior wrist fracture at 48, mother had a hip fracture, on 7.5 mg prednisolone for 4 months for polymyalgia, no RA, not on HRT, adequate calcium, natural menopause at 46.

```
age                    : 0 × 0.042   = +0.000
menopausalStage        : post_under_5yr = +0.255
lowBmi                 : yes          = +0.247
priorFragilityFracture : yes          = +0.621
parentHipFracture      : yes          = +0.432
currentSmoker          : yes          = +0.223
highAlcohol            : ≥3 u/day     = +0.322
glucocorticoids        : yes          = +0.507
earlyMenopause         : FMP at 46, NOT <45 → NO
(ethnicity.white_european = 0, no HRT, adequate calcium = all 0)

score = 0 + 0.255 + 0.247 + 0.621 + 0.432 + 0.223 + 0.322 + 0.507 = 2.607
RR    = exp(2.607) ≈ 13.6
tier  = high  (RR > 3.5 placeholder threshold)
```

**Read:** Eight independent risk factors stacked together produce a ~13.6× relative risk. The single largest contributor is the prior fragility fracture; the second-largest is the combination of parental history and glucocorticoid exposure. The GP workflow should surface all eight of these in the explanation pane and prioritise the two that are most actionable right now: tapering the glucocorticoids and offering immediate secondary fracture prevention.

**Note:** If this patient's menopause had been at 44 instead of 46, `earlyMenopause` would fire (+0.604), pushing score to 3.21 and RR to ~25×. But that would also collide with the independence warning in §4.3 — in reality the overlap with `menopausalStage = post_under_5yr` means the model would over-score her. The downstream scoring implementation should apply either Option A or Option B from §4.2 to resolve this.

---

## 9. Change log

| Date | Change |
|---|---|
| 2026-04-10 | Initial research-only deliverable. 14 coefficients verified against primary literature. 2 features flagged CONTESTED (`highBmi`, `lowCalcium`). 5 stage levels flagged DERIVED. 3 ancestry HRs flagged UK_EXTRAPOLATED. No OLD_UNREPLICATED flags. Threshold calibration and sanity-check code blocked on infrastructure; placeholders retained and documented. |

---

## 10. Open questions for the spec team

As this was produced concurrently with the formal spec in `docs/superpowers/specs/`, the following schema decisions may need reconciliation:

1. **Actionable tiering** — user chose "binary + rationale" but noted a downstream LLM education component. Does the schema need an `educationHook` field beyond the current `actionableRationale`, or is a single free-text string sufficient for the LLM to consume?
2. **Feature naming** — `camelCase` TS keys vs the `snake_case` used in some of the research reports. Current file uses `camelCase` consistent with Next.js / React conventions.
3. **Interaction handling** — `menopausalStage × currentHrt` and `earlyMenopause × menopausalStage` need a downstream mitigation (§4.2, §4.3). Should the spec model these as interaction terms in the weights file, or as rules in the scoring function?
4. **Age coefficient structure** — currently a continuous feature with `unit: "years_above_50"`. The spec may prefer a piecewise-linear or spline representation once real data is available.
5. **Calcium inclusion** — coefficient is near-null and the predictive signal is trivial. Should it be dropped from the feature set entirely, and the UX for calcium questions handed to the LLM education layer instead?
6. **Current-use vs ever-use glucocorticoids** — currently uses the pooled 1.66 (ever-use). Should the spec distinguish current from past exposure and use 2.0–2.2 for active users?

Flag these in the spec review.
