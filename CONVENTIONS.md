## Project Structure (Modular Architecture)

```text

src/
├── config/           # Database & Environment variables
├── controllers/      # Request handling & input extraction
├── middlewares/      # Auth, Error handling, Validation
├── services/         # Core Business Logic (Prisma queries)
├── routes/           # Express route definitions
├── utils/            # Helper functions (JWT, hashing, formatting)
├── types/            # Global TypeScript interfaces
└── app.ts            # App entry point & middleware setup

```

## Naming Conventions

- controller -> auth.controller.ts

## API Design & Response

```json
// Success
{
  "status": "success",
  "message": "Data retrieved successfully",
  "data": { ... }
}

// Error
{
  "status": "error",
  "message": "Error message explanation",
}
```
