# 🧩 Quiz Logic & Car Matching Engine

This document details the technical implementation of the AutoMatch Quiz, explaining how user answers are translated into vehicle recommendations.

## 🏗 Architecture Overview

The quiz logic is a **client-side** recommendation engine that filters and scores a dataset of vehicles based on user input.

*   **Entry Point**: `src/app/quiz/page.tsx`
*   **Core Logic**: `src/utils/carScoring.ts`
*   **Data Source**: Google Sheets (fetched via `src/lib/dataset.ts`)
*   **State Management**: React `useState` (tracks answers, current question, and dataset).

---

## 🧠 Scoring Algorithm

The matching process consists of three distinct phases:
1.  **Category Weighting**: Translating answers into "Vibes" (Preferences).
2.  **Car Scoring**: Grading every car in the database on those same categories.
3.  **Filtering & Matching**: Applying constraints and calculating the final match score.

### 1. Category Weighting (User Preferences)
As the user answers questions, we accumulate points for specific categories.
*   **Categories**: `Performance`, `Efficiency`, `City`, `Road Trip`, `Practicality`, `Luxury`, `Adventure`, `Comfort`, `Technology`, `Reliability`.
*   **Logic**:
    *   Each answer option is mapped to a `primary` (2 points) and `secondary` (1 point) category.
    *   *Example*: Choosing "Fast Commute" adds points to `Performance` and `City`.
    *   **Normalization**: Final accumulated points are normalized so they sum to **1.0**. This creates a "weight vector" for the user.

### 2. Car Scoring (Database Grading)
Every car in the dataset is pre-scored (0-100) on the same categories based on its raw specifications. This happens in `calculateCarScores`.

| Category | Formula / Source Spec |
| :--- | :--- |
| **Performance** | Normalized Horsepower (`hp`) against global min/max. |
| **Efficiency** | Normalized MPGe or Combined MPG against global min/max. |
| **City** | Inverse of Length (shorter = better). |
| **Road Trip** | Normalized Wheelbase (longer = smoother ride). |
| **Practicality** | Normalized Cargo Capacity. |
| **Luxury** | Normalized MSRP. |
| **Adventure** | Normalized Towing Capacity. |
| **Comfort** | Derived from Road Trip score (70%). |
| **Technology** | Flat score: EV/Hybrid = 80, ICE = 40. |
| **Reliability** | Base score from Warranty years. **Bonuses**: <br>• +25 for Toyota, Lexus, Honda, Mazda, Subaru, Porsche. <br>• +15 for Ford, Chevrolet, Nissan, BMW, Mercedes. <br>• +5 for Roadside Assistance/Rust Warranty. |

### 3. Filtering & Matching (`matchCars`)
This is the most critical step. We calculate a `baseScore` and then apply `filters`.

#### A. Base Score Calculation
```typescript
BaseScore = Sum(CarCategoryScore * UserCategoryWeight)
```
*   A car with high *Performance* score will rank high for a user with high *Performance* weight.

#### B. Filters (Hard & Soft)
We apply multipliers (`matchScore *= X`) or hard exclusions (`return 0`) based on specific "Gatekeeper" questions.

**Key Filters:**

*   **Expense (Budget)**
    *   **Low**: Hard cap at $40k. Bonus for <$20k.
    *   **Balanced**: Hard cap at $70k. Bonus for $25k-$48k.
    *   **High/Unlimited**: Penalties for very cheap cars (assumed less desirable for high budget).

*   **Family Mode** (`isFamily`)
    *   **Practical**: Boosts Minivans (2.5x), SUVs (1.4x), Wagons. **Kills** Coupes/Convertibles.
    *   **Image Conscious**: Boosts SUVs/Crossovers (1.6x).
    *   **General**: Penalizes Trucks and Commercial Vans.

*   **Sport Mode** (`forceSport`)
    *   Boosts High HP (>300hp) and Coupes/Convertibles.
    *   **Penalty**: Cars with <140hp get a 50% score reduction.
    *   **Boring Penalty**: Minivans and low-HP SUVs get a 70% score reduction.

*   **Utility Mode** (`forceUtility`)
    *   Boosts Trucks/Vans (3.0x).
    *   Boosts High Towing (>5000lbs) and Cargo (>60cu ft).
    *   **Penalty**: Non-utility vehicles get an 85% score reduction.

*   **Size Preference**
    *   **Small**: Penalizes large vehicles (>185" length) unless they are coupes.
    *   **Mid/Large/Oversized**: Boosts/Penalizes based on length ranges (e.g., Mid = 175"-195").

*   **Fuel Priority**
    *   **Critical**: **Hard Exclusion** for non-EVs with <30 MPG.
    *   **High**: Heavy penalty (60%) for <25 MPG.

*   **Seating**: **Hard Exclusion** if `car.totalSeating < requiredSeats`.

### 4. Diversification
To prevent a list of 10 versions of the same car, we apply `diversifyByMake`:
*   **Limit**: Maximum **2** cars from the same Make (e.g., max 2 Toyotas) in the top results.

---

## 🛠 Developer Notes

### Important Files
*   `src/utils/carScoring.ts`: **DO NOT TOUCH** without understanding the multipliers. Small changes here drastically affect ranking.
*   `src/constants/quizQuestions.ts`: Defines the questions and which categories they boost.
*   `src/app/quiz/page.tsx`: Handles the UI flow and constructing the `filters` object from raw answers.

### Adding New Logic
If you need to add a new constraint (e.g., "Must have Apple CarPlay"):
1.  Add the question to `QUIZ_QUESTIONS`.
2.  Update `QuizFilters` interface in `carScoring.ts`.
3.  In `page.tsx`, map the answer to the new filter property.
4.  In `matchCars` (`carScoring.ts`), add the logic to penalize/exclude cars missing the feature.
