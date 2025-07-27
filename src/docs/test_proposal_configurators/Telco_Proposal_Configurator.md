https://docs.google.com/spreadsheets/d/1jkCoixgXV-WQ2crTsRupb8VAfo_G2XulpAS4AKWcaT8/edit?usp=sharing
---
### Analysis of "Input Page"
- Contains the user-facing configuration options.
- Crucially, embeds business logic, rules, and dependencies directly in the descriptions.
- Examples: "must be included", "add one for every", "if no Switch is included...".
- Confirms the need for an AI-driven rules engine.

### Analysis of "Calc Page"
- The backend data source for the configurator.
- Contains private financial data: Cost Price, Selling Price.
- Includes formulas for line totals, hardware rental, and commissions.
- Confirms the need for a private, tenant-specific product catalog with detailed pricing fields.

### Analysis of "Hosted Output"
- The final, customer-facing proposal document.
- Provides the structure for proposal templates: Hardware section, Monthly Service section, Terms & Conditions.
- Confirms the need to separate and categorize different types of costs (Once-off, Recurring).
- Validates the entire data flow from configuration to final presentation.