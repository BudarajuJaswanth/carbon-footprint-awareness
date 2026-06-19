# Improved Prompt Specification: Carbon Footprint Tracker

## Architectural Goals
Implement a responsive web solution that models, monitors, and reduces carbon footprint profiles. Follow clean code principles (SOLID, DRY) and separation of concerns.

## Technical Framework Constraints
- Client-side execution utilizing ES Modules.
- Central state store persisting to local storage, handling data corruption gracefully.
- Responsive styling using custom design tokens and media queries.
- Clean DOM generation via safe rendering functions preventing XSS.

## Core Services & Calculations
- Transportation: Calculate car travel by fuel type, public transit, and flights (annually divided by 12).
- Energy: Calculate grid emissions minus renewable offsets.
- Lifestyle: Calculate diet type, shopping habits, and waste generation.
- Recommendation Engine: Priority-sort actions based on heaviest emissions categories and boost high-impact suggestions if historical emissions reductions stagnate.
- Goals and Achievements: Auto-evaluate targets against baselines and log daily green routines.

## Testing & Quality Assurance
- BDD framework: unit tests verifying calculators and validators, and integration tests confirming state mutations and achievement unlocks.
- Browser test report page and CLI verification script.
