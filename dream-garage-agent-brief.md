# Dream Garage — Analysis & Implementation Brief

**For:** the coding agent working in the CarCupid repository
**Mode:** analysis and planning first. **Do not write feature code yet.** Produce the plan and surface every assumption, then wait for sign-off.

---

## 0. What we're building (read this first)

CarCupid already matches a single person to a single car via a personality quiz. **Dream Garage** is a new page where a user builds a *small fleet* — 2–5 cars — inside one total budget, where each car has a distinct job ("daily driver", "family hauler", "weekend toy", etc.). It's modelled on the "build-a-garage" segments from US car podcasts.

A working design prototype exists: **`dream-garage.html`** (self-contained HTML/CSS/JS). It defines the intended UX, the visual language, the state shape, and three integration points marked `// HOOK 1/2/3`. Treat it as the source of truth for *interaction and look*, not for production architecture.

The user input is: a **total budget**, a set of **bays** (each bay = one role + a % of the budget), and a press of **"Reveal my garage"**. The output is: one real car parked in each bay, every car priced within that bay's slice, and the whole garage inside the total budget.

---

## 1. The core mechanic to internalize

This is the part that must be designed correctly; everything else follows from it.

**A "role" is not a database column.** The car database stores physical attributes (price, body type, seats, drivetrain, power, year, etc.). A role is a *rule expressed over those attributes*:

| Role (bay) | Plain meaning | Likely rule over real columns (you will confirm against the actual schema) |
|---|---|---|
| Daily Driver | Everyday, easy, cheap to run | body ∈ {sedan, hatch, compact SUV}; favor efficiency/value; sort by value |
| Family Hauler | Kids, dogs, gear | seats ≥ 6 OR body ∈ {3-row SUV, minivan, large SUV}; favor safety/space |
| Weekend Thrill | Pure fun, impractical | body ∈ {coupe, convertible, roadster}; favor power-to-weight; 2 seats ok |
| The Statement | Turns heads | price in top quartile; flagship/exotic brands; coupe/sedan/GT |
| The Explorer | Off-road, snow, trails | drivetrain ∈ {AWD, 4WD}; body ∈ {SUV, truck}; off-road trims |
| The Project | Future classic / enthusiast | sporty coupes; manual available; enthusiast brands |

So the implementation is a **mapping layer**: `role → (hard filter + soft scoring)` over whatever columns actually exist. Your first job is to find out which columns exist, then define each role concretely against them. **If a role's rule can't be expressed because the data doesn't have the attribute, say so** — that's a finding, not a blocker to hide.

---

## 2. What to analyze (and the questions to answer)

### 2.1 The codebase
Inventory the existing CarCupid app and answer:
- Framework/structure: App Router or Pages Router? Where do pages/components/styles live? What's the styling system (Tailwind, CSS modules, styled-components)?
- **The existing quiz**: where is it, what does it output (a profile object? scores? a single matched car?), and how is that output stored/passed? This matters for HOOK 3 (seeding the garage from quiz results).
- **The car data layer**: how are listings stored and served today (Postgres? Sanity? a JSON/CSV import? an external API)? Where is the query/fetch code for "Car Listings"? Is there an existing `/api/...` route that returns cars with filters?
- Auth/session: can a built garage be saved to a user, or is this anonymous for v1?
- Design system: list the existing color tokens, fonts, button styles, and shared layout/nav components the new page must reuse (so Dream Garage matches the site, not the standalone prototype).

### 2.2 The car database
This is the most important analysis. Report back:
- **The exact schema**: every column relevant to matching, with type and an example value. Specifically look for: price, make, model, trim, year, body type, segment, number of seats/doors, drivetrain (FWD/RWD/AWD/4WD), horsepower, transmission, fuel/MPG/EV, and any "class"/"category"/"tags" field.
- **Coverage gaps**: which of the attributes in §1's table are *missing* from the data? (e.g. if there's no "seats" column, "Family Hauler" has to lean on body type instead.)
- **Distribution facts** we need for UX guardrails:
  - Confirm the global price floor (stated as ~$16,000) and ceiling (~$500,000).
  - For each role, what is the **cheapest car** that satisfies its rule? (This sets the minimum viable allocation for a bay of that role — e.g. a "Statement" bay below the cheapest statement car is unfillable.)
  - Roughly how many cars satisfy each role? (Sanity check that no role is starved.)
- Dedupe granularity available: is "model" stable enough to prevent recommending the same car twice, or do we dedupe on make+model+trim?

### 2.3 The design prototype (`dream-garage.html`)
- Extract the `STATE` shape (`budget` + `bays:[{role, alloc}]`) and the `ARCHETYPES` config — these become the typed client state.
- Note the three `// HOOK` comments: HOOK 1 = swap `matchCar()` for the real API; HOOK 2 = real car images; HOOK 3 = `prefillFromQuiz()`.
- Note the UX guardrails the prototype already implements: live budget gauge, over-budget warning, min 2 / max 5 bays, "this bay's budget" slider.

---

## 3. The matching model to design

Define this precisely; it's the heart of the feature.

### 3.1 Inputs
`{ totalBudget, bays: [{ role, allocationPct }] }` where Σ allocationPct should be ≤ 100%.

### 3.2 Algorithm (per bay)
```
allocation        = round(totalBudget * bay.allocationPct)
hardCandidates    = cars where price ≤ allocation AND matchesRole(car, bay.role)
exclude any car already chosen for an earlier bay   // dedupe across the garage
if hardCandidates is empty:
    mark bay UNFILLABLE with a reason (see §3.4)
else:
    score each candidate with roleFitScore(car, role) ∈ [0,1]
    pick winner per the selection strategy (§3.3)
    record leftover = allocation - winner.price
```
Return: the filled garage, `totalSpent = Σ winner.price`, and `budgetLeftover = totalBudget - totalSpent`.

`matchesRole` = the hard filter from §1. `roleFitScore` = a small weighted sum over soft attributes (e.g. for Thrill: power-to-weight ↑, 2-seat ↑, convertible ↑). Keep the weights in a single config object so they're tunable without code changes — and so we can explain *why* a car was picked.

### 3.3 Selection strategy (pick a default, make it swappable)
- **A — "the most car the budget allows"** (the prototype's default): among the top fit tier, choose the highest-priced car ≤ allocation. Feels aspirational.
- **B — "best fit / best value"**: choose the highest `roleFitScore` regardless of how much budget is left.

Recommend a default and explain the trade-off. We may want A for "Statement"/"Thrill" and B for "Daily" — note if a per-role default makes sense.

### 3.4 Edge cases (enumerate handling for each)
- **Allocation below the global floor (~$16k):** no car can ever fit. The UI must prevent or clearly warn ("This bay only has $9,000 — the cheapest new car is ~$16,000").
- **Allocation below the role floor:** e.g. a "Statement" bay at $40k when the cheapest statement car is ~$120k. Surface: "No statement car under $40k — raise this bay or change its role."
- **Σ allocationPct > 100%:** garage is over budget. The prototype already turns the gauge red; decide whether Reveal is blocked or allowed-with-warning.
- **Leftover budget (Σ < 100%):** allowed; optionally suggest upgrading a bay.
- **Same car wins two bays:** dedupe (decide granularity per §2.2).
- **Role starved by filters:** if a role returns too few cars overall, that's a data finding to flag.

### 3.5 Where it runs
Recommend client vs server. Default recommendation: a **server route** (`POST /api/garage/match`) that takes the input and returns the filled garage — keeps the full 10k-row dataset and the scoring config off the client, and lets us reuse the existing data layer. Justify if you'd do otherwise.

---

## 4. Implementation plan to produce

Lay out, concretely against the real repo:
1. **Data prep** — any role-tagging or indexing needed (e.g. a derived `roleTags[]` per car computed at import/build time vs. computed at query time). State the cost/benefit.
2. **API** — route signature, request/response types, where it plugs into the existing data layer.
3. **Components** — break the prototype into React components (BudgetSetter, GarageBays, Bay, RolePicker, BudgetGauge, RevealedGarage, etc.), typed, using the *site's* design tokens not the prototype's inline styles. Map each piece of prototype JS to React state/handlers.
4. **Quiz reuse (HOOK 3)** — exactly which quiz outputs seed which bays/allocations, and the shape of the payload `prefillFromQuiz` should accept.
5. **Images (HOOK 2)** — how to source a real image per matched car from existing listings; fallback when none exists (the prototype's silhouette).
6. **State & persistence** — v1 anonymous in-memory vs. saving a garage to the user account; if saving, the data shape.
7. **Routing/nav** — add "Dream Garage" to the existing nav; the page route.
8. **Effort estimate** — phase the work (e.g. Phase 1: static page + role rules + API + reveal; Phase 2: quiz seeding; Phase 3: save/share) with rough hours per phase.

---

## 5. Required deliverables

Return a single document containing:
1. **A plain-language explanation of the matching mechanic** with **one fully worked example using real cars pulled from the actual database** — e.g. "$200k budget, 3 bays (Daily 20% / Hauler 40% / Thrill 40%) → here are the exact cars the algorithm would park and why." This is for the non-engineer stakeholder; make it readable by someone who doesn't read code.
2. The schema analysis and the per-role rule definitions (§2.2, §1).
3. The matching algorithm spec with edge-case handling (§3).
4. The phased implementation plan with component breakdown and estimate (§4).
5. **Open questions / decisions needed** — anywhere the data forces a choice (missing columns, starved roles, selection-strategy default, dedupe granularity, save vs. anonymous).

---

## 6. Guardrails
- Reuse the site's existing nav, design tokens, and data layer. The standalone prototype's styles are a *reference*, not a dependency.
- Don't invent attributes the database doesn't have — map roles only to columns that exist, and report gaps.
- Keep the role rules and scoring weights in one config object, not scattered through logic.
- No scope creep beyond a buildable v1: get a budget → assign bays → reveal real cars. Save, share, and quiz-seeding are explicitly later phases.
- **Plan first, code after sign-off.** End by listing your assumptions and open questions before proposing to implement.
