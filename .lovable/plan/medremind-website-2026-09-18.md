# MedRemind website

## Goal
Turn the uploaded presentation into a usable, senior-friendly medicine reminder website matching its teal-and-white visual identity. Everything will run locally without external APIs.

## What I’ll build
- A large-text home screen showing today’s medicines and the next scheduled dose.
- Add-medicine flow for name, dosage, time of day, time, and stock count.
- Medicine reminder actions: Taken, Skip, and Snooze.
- Adherence calendar and recent dose history using clear status colors.
- Caregiver-style summary showing adherence and missed-dose notices on the same device.
- Refill warnings based on locally tracked stock.
- Responsive layouts for desktop and mobile, with accessible controls and high contrast.

## Visual direction
- Preserve the presentation’s deep teal backgrounds, bright mint accents, white sections, circular medical icons, bold headings, and restrained card shapes.
- Use large controls and minimal steps for elderly users.

## Technical details
- Build within the project’s supported React/TanStack website runtime; Python cannot power the browser interface in this workspace.
- Store medicines and history locally in the browser so there is no API, account, or cloud dependency.
- Use browser notifications only when the user grants permission; otherwise reminders remain visible inside the website.
- Include realistic starter demo data derived from the presentation, clearly editable by the user.
