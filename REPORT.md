# Datasets for Predictive & Preventative Care of Menopause-Related Osteoporosis

**Purpose.** This report catalogues 149 datasets, cohorts, registries, and data-sharing platforms useful for building risk-analysis and predictive models targeting post-menopausal bone loss, fragility fractures, and preventative-care pathway optimisation. It is the result of six parallel research threads covering imaging, genomics, EHR/claims, comorbidities, lifestyle/wearables, and clinical-trial repositories, merged with a baseline of classical menopause and osteoporosis cohorts.

The companion file `datasets.json` is the machine-readable form with structured access, modality, outcome-label, and suitability fields for every entry.

**Scope.** The focus is osteoporosis, but the catalogue deliberately extends into:
- Cardiometabolic, cognitive, and sarcopenia cohorts because peri/post-menopause changes share risk factors with bone loss
- Imaging datasets suitable for opportunistic screening from routine CT/X-ray
- Genomics and polygenic risk because age-at-menopause and BMD are highly heritable
- Lifestyle/wearable/nutrition datasets because most preventative-care levers are behavioural

---

## 1. Headline picks by modelling goal

| Modelling goal | Primary dataset | Rationale |
|---|---|---|
| Prototype a fracture-risk model on open data | **NHANES** (+ dietary + accelerometer) | Free, DXA + menopause + diet + PA in one linkable survey |
| Train supervised fracture-risk model on gold-standard labels | **WHI** (via dbGaP phs000200 or BioLINCC) | Adjudicated hip/vertebral fractures, 25+ yr follow-up, HRT RCT |
| Multi-ethnic peri-menopause bone-loss trajectories | **SWAN** | Annual DXA across the full transition in 5 ethnic groups |
| Genomic + imaging + EHR ML at scale | **UK Biobank** | Genotype + DXA + accel + HES, unmatched N |
| Treatment-effect / uplift modelling | **ARCH** + **FREEDOM** via **Vivli** | Head-to-head + placebo RCTs with adjudicated fractures |
| Real-world hip-fracture outcome labels | **Swedish NPR + Rikshöft** | National linkage, personnummer matching, longest follow-up |
| Care-gap / missed-screening analysis | **CPRD Aurum** or **QResearch** + **FLS-DB** | Primary-care prescribing + FLS audit cascade |
| Opportunistic CT screening for vertebral fracture | **VerSe** + **TotalSegmentator** + **CTSpine1K** | Open, labelled, multi-vendor, segmentation-ready |
| Dental-panoramic screening | **OSTEODENT** (gated) | Only DXA-linked dental cohort |
| African-ancestry external validation | **AWI-Gen / MASC** | Only sub-Saharan cohort with longitudinal DXA in women |
| East-Asian external validation | **KNHANES** (open) + **BioBank Japan** (gated) | Open BMD + diet + menopause + genomics |
| Fall-risk feature engineering on real (not simulated) falls | **FARSEEING** | Only public corpus of in-the-wild elderly falls |
| Randomised exercise → BMD labels | **LIFTMOR + MEDEX-OP** | Rare demonstrations of BMD gains in low-BMD postmenopausal women |

---

## 2. Category summaries

### 2.1 Menopause and osteoporosis cohorts (11 datasets)

The classical studies are still the backbone: **SWAN** for transition-period BMD trajectories (multi-ethnic, annual DXA), **WHI** for adjudicated fractures and HRT uplift, **SOF** and **MrOS** (male comparator) for long-horizon fracture outcomes, **Framingham Osteoporosis** for cardiometabolic-bone coupling, and **Rotterdam** for rare longitudinal HR-pQCT microarchitecture. Internationally, **OSTPRE** (Finland, 30+ years) and **CaMos** (Canada, 25+ years) are the two longest-running post-menopausal cohorts outside the US. **ALSWH** (Australia) adds unique PBS/MBS claims linkage. **GLOW** provides 10-country cross-national risk factor data and **MsFLASH** adds vasomotor-symptom RCT data with healthy controls. **MWHP** (Melbourne) is small but hormone-dense.

### 2.2 Biobanks (13 datasets)

**UK Biobank** is the single most powerful resource — 500k participants with genotype/WES/WGS, ~50k DXA imaging, ~104k wrist accelerometer, linked HES + primary care + cancer + death. Competing mega-biobanks each fill ancestry gaps: **All of Us** (diverse US), **FinnGen** (Finland registry linkage), **CKB** (Han Chinese), **EstBB** (Estonian EHR linkage), **BioBank Japan** (East Asian bone genomics), **MVP** (multi-ancestry US veterans — but only ~10% women), **MCPS** (female-majority Amerindian admixed), **Taiwan Biobank**, **Qatar Biobank** (Middle East + DXA in Phase I), **H3Africa / AWI-Gen** (only African-ancestry longitudinal bone cohort), **Rotterdam** (Dutch with HR-pQCT), and **CLSA** (Canadian aging with scalable DXA and sarcopenia phenotyping).

### 2.3 National surveys (2 datasets)

**NHANES** and **KNHANES** are the two open-access gold mines — both link DXA to dietary, lifestyle, and menopause modules, with full microdata freely downloadable. They are the fastest path from zero to a working cross-sectional prototype before investing in biobank applications.

### 2.4 Imaging datasets (19 datasets)

**Directly usable with bone labels**: VerSe (CT + Genant grades + opportunistic BMD), Hip Osteoporosis Mendeley (plain hip X-ray + DXA T-scores, postmenopausal-enriched), Knee Mendeley (menopause-age + T-scores), xVertSeg (fracture grading CT), OSTEODENT (panoramic + DXA — gated).

**Segmentation / pretraining backbones**: CTSpine1K, TotalSegmentator v2, CTPelvic1K, SpineWeb hub, RadImageNet.

**Fracture detection transfer learning**: RSNA Cervical Spine 2022, MURA (upper extremity), GRAZPEDWRI-DX (paediatric wrist), FracAtlas, DeepLesion.

**MRI bone quality**: fastMRI+ (knee bone marrow), MyoSegmenTUM Spine (lumbar water-fat Dixon for marrow adiposity).

**Gold-standard microarchitecture**: **HR-pQCT** sits almost entirely in controlled consortium holdings (BoMIC), with no open raw-image release — collaboration is the only path.

**Multimodal longitudinal**: MrOS Online (male — transferable) and OAI (OA-focused but has DXA and MRI).

Key gaps: no large open HR-pQCT dataset, no open panoramic+DXA cohort, no open MRI dataset linking vertebral marrow fat to fracture outcomes.

### 2.5 Genomics (12 datasets)

**PRS discovery backbone**: GEFOS (BMD, 450k), UKB eBMD GWAS (Morris 2019, 426k), deCODE (Icelandic fracture), BioBank Japan (East Asian BMD), ReproGen (age-at-menopause, 201k — gold-standard ANM instrument).

**Turn-key production scoring**: PGS Catalog (drop-in weight files — start with PGS000121/122 for BMD and the high-AUC family PGS002632/2681/1955).

**Causal inference toolkit**: IEU OpenGWAS / MR-Base + GWAS Catalog — enables menopause → bone Mendelian randomization.

**Functional annotation**: GTEx (muscle/adipose/blood eQTL — no bone tissue directly), bone scRNA atlases (CELLxGENE, Human Cell Atlas).

**Epigenomic biological-age**: DNAmMenoAge methylation clocks — complements genetic ANM with a mediator variable for bone loss.

**Rare-variant / multi-ancestry**: TOPMed WGS (180k, includes WHI), 23andMe Research (collaboration-only, massive).

A production PRS pipeline should combine Morris 2019 eBMD + Ruth 2021 ANM summary stats with PRS-CS or LDpred2, then validate in EstBB (EHR-linked), CKB (Han Chinese), and MCPS (admixed Amerindian). Ancestry calibration (PRS-CSx or GAUDI-style methods) is mandatory — European bias is severe.

### 2.6 EHR, claims, and registries (25 datasets)

**UK primary care**: CPRD Aurum (largest, mid-tier fee), QResearch (home of QFracture, lower fee but needs Nottingham collaborator), IQVIA MRD / legacy THIN (commercial).

**UK secondary care & linkage**: HES + NHS England SDE — national, linked via GDPPR to primary care.

**US EHR**: Epic Cosmos (>250M, Epic customer only), Cerner RWD (Oracle Health, commercial), TriNetX (federated global, fast feasibility), PCORnet (distributed CDM), OneFlorida+ (diverse regional), eMERGE (for PheKB phenotypes), VA CDW (female rep only ~10%), Kaiser Permanente Research Bank (integrated payer-provider).

**US claims**: Optum Clinformatics + IBM MarketScan + Medicare 5% Sample (Medicare via ResDAC is cost-effective for academics), PharMetrics Plus.

**Nordic national registries** — the gold standard for complete real-world outcomes: Swedish NPR + Rikshöft, Danish DNPR + DFDB + Prescription Registry, Norwegian Hip Fracture Register + NorPD + NPR. All three support linkage via national personal identifiers to mortality, cancer, and socioeconomic data with near-zero loss to follow-up.

**Canada**: ICES Ontario (excellent track record of osteoporosis care-gap publications), RAMQ Quebec (Francophone).

**East Asia**: Taiwan NHIRD + HWDC (universal coverage, on-site only), Korea NHIS + K-CaMos (national claims linked to biennial screening biomarkers — rare globally), JMDC Japan (commercial, employer-insured).

**Distributed standardisation**: OHDSI Network (>800M OMOP, open PLP package), EHDS / DARWIN EU (emerging).

**Synthetic**: Synthea (for pipeline prototyping without governance friction).

### 2.7 Fracture registries (9 datasets)

Hip fracture audit registries exist in most high-income countries: **NHFD** (UK, ~75k/year), **Rikshöft** (Sweden, 1988+ and linkable), **Norwegian HFR** (PROMs at 4/12/36 months), **ANZHFR** (Australia + NZ, cleanest access pathway), **DHFA** (Netherlands, 85% coverage), **AltersTraumaRegister DGU** (DACH), **Irish HFD**, **Scottish HFA** (linkable via eDRIS), **Catalan HFR** (linkable to SIDIAP primary care).

Fragility fracture cascade: **UK FLS-DB** is the only national post-fracture FLS audit, capturing case identification, bone-protection initiation, monitoring, and 1-year adherence for ~500k patients. **IOF Capture the Fracture** provides site-level benchmarks (not patient-level) across 48 countries — useful as a hierarchical model site-level covariate.

### 2.8 Clinical-trial repositories and landmark RCTs (21 datasets)

**Repositories**: Vivli (largest bone-trial holding — hosts Amgen, Novartis, Merck, Roche, Lilly bone trials under a single DUA), BioLINCC (free NIH-funded studies including WHI/HERS/MESA/Framingham), dbGaP phs000200 (the richest WHI access tier), CSDR (transitioning to Vivli), YODA (shallow bone coverage), EMA Policy 0070 (redacted CSRs, no IPD), Medidata Synthetic Control (commercial).

**Landmark osteoporosis RCTs with IPD accessible via Vivli**:
- **FIT + FLEX** (alendronate, Merck) — gold-standard morphometric vertebral fracture adjudication, 6,457 women
- **HORIZON-PFT + RFT** (zoledronate, Novartis) — only IV bisphosphonate trial with hard mortality endpoint
- **FREEDOM + Extension** (denosumab, Amgen) — unique 10-year follow-up
- **FRAME** (romosozumab, Amgen/UCB) — only large placebo-controlled romosozumab trial
- **ARCH** (romosozumab vs alendronate head-to-head) — closest to real-world FLS population
- **FPT** (teriparatide pivotal, Lilly) — seminal anabolic trial
- **BONE/MOBILE/DIVA** (ibandronate, Roche/GSK)

**HRT trials**: WHI HT arms (via dbGaP/BioLINCC), HERS + HERS II, KEEPS + KEEPS Continuation, ELITE, Million Women Study.

**Access friction is real**: Lilly has denied requests on consent-scope grounds (affecting MORE, RUTH, FPT); legacy P&G/AbbVie custody gaps block VERT/HIP; Radius/Ipsen has no sharing policy for ACTIVE (abaloparatide). Vivli is secure-enclave only — no IPD export — so any modelling must be portable to the enclave.

### 2.9 Comorbidity cohorts (18 datasets)

Built-in bone-adjacent phenotyping:
- **Health ABC** (DXA + CT thigh + grip + SPPB + adjudicated fractures + biracial) — canonical for joint osteo-sarcopenia modelling
- **InCHIANTI** (pQCT volumetric BMD + grip + biopsies) — European external validation
- **Framingham Osteoporosis** (ancillary, already counted) — cardiometabolic crosstalk
- **MESA** (thoracic vertebral BMD from chest CT, multi-ethnic) — vascular-bone axis

Bone-adjacent without direct imaging:
- **ARIC**, **CARDIA**, **NHS/NHS II**, **Jackson Heart**, **Dallas Heart** (cardiometabolic long follow-up with linked fractures)
- **WHIMS/WHIMS-Y** (only RCT on HT-dementia, linked to WHI bone)
- **TILDA**, **ELSA**, **SHARE**, **HRS** (harmonised aging studies with grip + falls + cognition)
- **InterLACE** (pooled IPD across 27 reproductive-health studies — 850k women, 12 countries — the most efficient external-validation pipeline)
- **BCAC** (breast cancer consortium — shared reproductive risk factors)

Underrepresented populations:
- **AWI-Gen / MASC** (Africa, longitudinal DXA)
- **REDLINC** (Latin America)
- **CURES** (India, diabetes-bone crosstalk)

Extreme phenotypes:
- **POI Registries** (premature ovarian insufficiency — anchors the causal chain between estrogen deprivation and accelerated bone loss)

### 2.10 Lifestyle and wearables (19 datasets)

**Accelerometer at scale with bone linkage**: UK Biobank accelerometer (~104k, linked HES fractures), NHANES PAM (2003–06 hip, 2011–14 wrist, linked DXA), SWAN V15 wrist accel (linked longitudinal DXA — the most targeted postmenopausal dataset), LIFE Study (randomised PA intervention, no bone), Fenland (PAEE validation), Maastricht (activPAL thigh gold-standard sedentary).

**Sleep linked to bone outcomes**: SOF Sleep V8 (the only large female cohort with actigraphy + longitudinal DXA + adjudicated fractures), Wisconsin Sleep Cohort (menopause-transition PSG substudy), SHHS, MrOS Sleep (male comparator).

**Gait and fall datasets**: FARSEEING (the benchmark for real-world fall training — 208 verified in-the-wild falls), SisFall, mPower (PD-enriched smartphone gait).

**Nutrition → BMD**: NHANES Dietary (open, DXA-linked), EPIC-Oxford/Norfolk (17.6-year fracture follow-up with quality FFQ, vegan sub-cohort), Nurses' Health Study FFQ (decades of adjudicated fracture data — but no DXA), NDNS UK, NutriNet-Santé France, CHNS China.

**Physical performance cross-nationally harmonised**: Gateway to Global Aging grip strength (SHARE + ELSA + TILDA + HRS).

**Intervention trials with randomised bone outcomes**: LIFTMOR + MEDEX-OP (only robust demonstrations of meaningful BMD gains in low-BMD postmenopausal women from free-living exercise), Too Fit To Fracture (safety-constrained exercise guidelines — expert labels).

**Digital health apps**: Clue × 4M Consortium (10M+ users, only at-scale perimenopause symptom data — controlled access).

---

## 3. Recommended modelling pipeline stack

```
Layer 1 — Prototype on open data
  NHANES (DXA + diet + accel + menopause) → establish baseline
  KNHANES (Asian external comparator) → ancestry generalisation

Layer 2 — Supervised label training on adjudicated outcomes
  WHI via dbGaP or BioLINCC → HRT uplift + hip fracture labels
  FIT via Vivli → vertebral fracture labels
  FREEDOM via Vivli → 10-year longitudinal denosumab response

Layer 3 — Genomic feature layer
  PGS Catalog (PGS000121/122, PGS002632) → drop-in BMD PRS
  ReproGen ANM → age-at-menopause PRS feature
  Custom PRS-CS on Morris 2019 + Ruth 2021 summary stats

Layer 4 — Imaging feature layer
  VerSe + TotalSegmentator → opportunistic CT BMD + vertebral fracture
  Hip Osteoporosis Mendeley → plain-radiograph DXA regression
  RadImageNet → transfer-learning backbone

Layer 5 — Lifestyle/wearable feature layer
  UK Biobank accelerometer → cadence, rest-activity rhythm, sedentary fraction
  SOF Sleep → circadian disruption + fragmentation
  FARSEEING → real-world fall-risk classifier

Layer 6 — External validation
  InterLACE pooled IPD → 27 cohorts, 12 countries
  AWI-Gen / MASC → African ancestry
  CKB → Han Chinese
  Rikshöft linked to Swedish registers → real-world hip-fracture labels

Layer 7 — Intervention / treatment-effect
  ARCH via Vivli → romosozumab vs alendronate uplift
  LIFTMOR → exercise → BMD causal labels
  WHI HT arms → HRT uplift (gold standard)

Layer 8 — Care-gap / deployment
  CPRD Aurum or QResearch → prediction deployment in UK primary care
  UK FLS-DB → post-fracture cascade intervention targeting
  ICES Ontario → North American care-gap benchmarking
```

---

## 4. Access strategy and sequencing

Access friction varies enormously. A practical ordering:

| Priority | Action | Timeline |
|---|---|---|
| Immediate (week 1) | Download NHANES, KNHANES, SHARE/ELSA, Synthea, PGS Catalog, GEFOS, IEU OpenGWAS, VerSe, TotalSegmentator, CTSpine1K, SisFall, SOF Online (after DUA) | Days |
| Short-term (month 1–2) | Apply to BioLINCC for WHI-CT/OS + HERS + MESA + Framingham + CARDIA + ARIC (single portal) | 4–8 weeks |
| Short-term | Apply to NIA Aging Research Biobank for SWAN + Health ABC + LIFE + InCHIANTI | 4–8 weeks |
| Medium-term (month 2–4) | Apply to UK Biobank (includes accelerometer + DXA imaging subset + genotype) | 2–4 months + fee |
| Medium-term | Apply to Vivli for FIT, HORIZON, FREEDOM, FRAME, ARCH in a single DUA covering multiple sponsors where possible | 3–9 months |
| Medium-term | Apply to dbGaP for phs000200 (full WHI) | ~6 weeks DAC |
| Long-term (month 3–6) | Apply to CPRD Aurum or QResearch for primary-care deployment data | 2–4 months |
| Long-term | Identify Swedish / Danish / Norwegian collaborators for Nordic registry access | 6–12 months |
| Opportunistic | Collaboration outreach for AWI-Gen / MASC, LIFTMOR, KEEPS, FLS-DB | varies |

**Budget implications**: A resource-constrained team can run Layers 1–3 (NHANES + PGS Catalog + BioLINCC WHI) at essentially zero cost, which is enough to publish a defensible prototype fracture-risk model. UK Biobank (mid-tier fee) and Vivli access (free but time-intensive) unlock Layers 4–7 substantially. Nordic registry access unlocks Layer 6 real-world labels but takes 6–12 months and needs local partnership.

---

## 5. Known gaps and caveats

1. **HR-pQCT microarchitecture**: No large open dataset exists. The BoMIC consortium holds most of it; access is collaborative only. If bone microarchitecture is central to a project, identify a BoMIC member site early.
2. **Dental panoramic + DXA**: OSTEODENT (671 postmenopausal women) is the gold-standard reference but is not openly downloadable. A novel cohort may need to be collected.
3. **MRI → fracture outcome**: No large public MRI dataset links vertebral marrow fat fraction to prospective fractures. MyoSegmenTUM (N=54 healthy) is the only open marrow-fat dataset.
4. **Non-European ancestry bone genetics**: Severe gap. AWI-Gen/MASC, CKB, MCPS, and Qatar Biobank are the main non-European sources; none match UKB/GEFOS scale. PRS ancestry calibration is mandatory.
5. **Longitudinal wearable + DXA pairs**: SWAN V15 is cross-sectional at the accel wear timepoint. UK Biobank accelerometer subjects mostly lack baseline DXA. The field needs a dedicated prospective wearable + repeat DXA cohort.
6. **Consent-scope denials**: Lilly has refused Vivli requests on consent grounds (MORE, RUTH, FPT). Plan alternatives before committing to these as training labels.
7. **Vivli no-IPD-export rule**: All modelling in Vivli must run inside the secure enclave. Pre-port your pipeline before the DUA starts.
8. **Claims datasets skew**: Optum/MarketScan/PharMetrics are commercial-insured (miss older post-menopausal women who've moved to Medicare); Medicare 5% Sample fills the 65+ gap at lower academic cost via CMS ResDAC.
9. **Unverifiable URLs**: A handful of entries have `"url": "unknown"` or couldn't be confirmed by research agents. These are flagged in `datasets.json` and should be re-verified before committing access budget to them.

---

## 6. Files produced

- **`datasets.json`** — Machine-readable catalogue of all 149 entries with access, modality, label, and suitability fields. Schema documented in the file's `meta` block.
- **`REPORT.md`** — This document.

## 7. Sources

Research was conducted by six parallel agents with web-search access:
- Imaging thread (VerSe, TotalSegmentator, CTSpine1K, RSNA, Mendeley bone datasets, OSTEODENT, HR-pQCT)
- Genomics thread (GEFOS, ReproGen, PGS Catalog, biobanks, MR/epigenomics)
- EHR / claims / registry thread (CPRD, NHS, Nordic registries, OHDSI, Asian claims)
- Comorbidity thread (SWAN, WHI, MESA, Health ABC, AWI-Gen, InterLACE)
- Lifestyle / wearables thread (UK Biobank accel, SOF sleep, FARSEEING, NHANES diet, LIFTMOR)
- Trial repositories thread (Vivli, BioLINCC, landmark osteoporosis RCTs, fracture registries)

Full citation URLs are embedded in the `access.url` and `notes` fields of each entry in `datasets.json`.
