---
name: school-sphere-backend
description: Comprehensive development and architecture skill for School Sphere RESTful backend. Use when building, scaffolding, modifying, or testing modules, Prisma schemas, business logic, authentication, Cloudinary uploads, or API endpoints for the School Sphere backend platform.
---

# School Sphere Backend — Specialized Engineering Skill

This skill guides the implementation, scaffolding, and verification of backend services for **School Sphere**, a modular school management RESTful API built on Express, TypeScript, PostgreSQL, Prisma ORM, and Cloudinary.

---

## 1. Domain References & Architecture

When developing or modifying features, refer to the offline domain references in the `references/` directory:

- **Data Models & Prisma Schema**: [data_model_and_prisma.md](references/data_model_and_prisma.md) — 14 core entities, enums, relations, composite constraints, and Prisma definitions.
- **API Routes & RBAC Matrix**: [api_routes_matrix.md](references/api_routes_matrix.md) — Complete endpoint routing table, HTTP methods, route guards, and payload expectations.
- **Business Rules & Validation Checklist**: [business_rules_checklist.md](references/business_rules_checklist.md) — Exact recipes for lesson conflict detection, exam/assignment result XOR, class capacity guards, attendance constraints, and Cloudinary image handling.

---

## 2. Module Implementation Workflow

When creating or modifying a feature module under `src/modules/<ModuleName>/`, follow this systematic 6-step workflow:

### Step 1: Define Interfaces & Types (`<module>.interface.ts`)
- Define TypeScript types for input DTOs, query filters, search criteria, and response entities.

### Step 2: Implement Zod Validation Schemas (`<module>.validation.ts`)
- Create Zod schemas for `body`, `query`, and `params`.
- Ensure strict typing (e.g., date formats, email formats, enum values for UserRole, DayOfWeek, BloodType, Sex).

### Step 3: Implement Service Layer Logic (`<module>.service.ts`)
- Implement business logic with Prisma client queries (`prisma.<model>`).
- Enforce business constraints (e.g., capacity check, grade consistency, scoped owner permissions).
- Use transactions (`prisma.$transaction`) when operations involve multiple related writes or image deletions.

### Step 4: Implement Controller Layer (`<module>.controller.ts`)
- Wrap each handler function with `catchAsync`.
- Retrieve validated input from `req.body`, `req.query`, `req.params`, and authenticated user from `req.user`.
- Return responses using `sendResponse(res, { statusCode, success, message, meta, data })`.

### Step 5: Configure Express Routes & Guards (`<module>.route.ts`)
- Mount endpoints with proper HTTP verbs (`GET`, `POST`, `PATCH`, `DELETE`).
- Apply `auth(...allowedRoles)` middleware.
- Apply `validateRequest(<schema>)` middleware.
- Connect to controller methods.

### Step 6: Register Route in Central Aggregator (`src/routes/index.ts`)
- Add the module route definition to the module route array in `src/routes/index.ts`.

---

## 3. Core Recipes

### Lesson Conflict Detection
```typescript
const isConflict = await prisma.lesson.findFirst({
  where: {
    day: payload.day,
    OR: [
      { teacherId: payload.teacherId },
      { classId: payload.classId }
    ],
    ...(lessonId && { NOT: { id: lessonId } }),
    AND: [
      { startTime: { lt: payload.endTime } },
      { endTime: { gt: payload.startTime } }
    ]
  }
});
if (isConflict) {
  throw new AppError(httpStatus.CONFLICT, "Lesson time slot conflicts with an existing lesson for this teacher or class");
}
```

### Result Exam/Assignment XOR Validation
```typescript
if ((payload.examId && payload.assignmentId) || (!payload.examId && !payload.assignmentId)) {
  throw new AppError(httpStatus.BAD_REQUEST, "A Result must reference either an exam or an assignment, never both and never neither");
}
```

### Standard Unified Response Invocation
```typescript
sendResponse(res, {
  statusCode: httpStatus.OK,
  success: true,
  message: "Teacher fetched successfully",
  data: result
});
```
