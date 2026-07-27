# AI Instructions

Before making changes, read:

- docs/architecture.md
- docs/coding-standards.md
- docs/database.md
- docs/api-conventions.md

General Rules

- Use dependency injection everywhere.
- Never instantiate services using `new`.
- Every module must own its data.
- Controllers should remain thin.
- Business logic belongs in services.
- Use DTOs for every request and response.
- Validate all incoming DTOs.
- Never access Sequelize models directly from controllers.
- Prefer transactions for multi-table writes.
- Follow existing folder structure.