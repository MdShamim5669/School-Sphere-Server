# School-Sphere-Server

RESTful API backend for **School Sphere** — a School Management Platform built with Node.js, Express, TypeScript, Prisma ORM, and PostgreSQL.

---

## 🚀 Features & Modules

- **Authentication & Authorization**: Role-Based Access Control (Admin, Teacher, Parent, Student) using JWT (Access & Refresh tokens with HTTP-only cookies).
- **User Management**: Admins can manage Teachers, Students, Parents, and Admins with bcrypt password hashing.
- **Academic Hierarchy**: Manage Grades, Classes, and Subjects with capacity controls and grade-matching validation.
- **Lesson Scheduling**: Timetable scheduling with automatic conflict detection for teachers and classes.
- **Exams & Assignments**: Lesson-linked assessments.
- **Results Management**: Assessment scores with mutual exclusivity (Exam XOR Assignment).
- **Attendance Tracking**: Daily lesson attendance records restricted to authorized teachers/admins.
- **Events & Announcements**: School-wide and class-specific announcements and events.
- **File Uploads**: Cloudinary integration with Multer memory storage and automatic cleanup of orphaned assets.

---

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/) (Multi-file schema structure)
- **Validation**: [Zod](https://zod.dev/)
- **Authentication**: JWT (`jsonwebtoken`) & `bcryptjs`
- **File Storage**: [Cloudinary](https://cloudinary.com/) & [Multer](https://github.com/expressjs/multer)

---

## 📦 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/MdShamim5669/School-Sphere-Server.git
cd School-Sphere-Server
npm install
```

### 2. Configure Environment Variables
Create a `.env` file based on `.env.example`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/school_sphere?schema=public"
BCRYPT_SALT_ROUNDS=12
JWT_ACCESS_SECRET=your_access_secret
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Generate Prisma Client & Run Migrations
```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4. Run the Development Server
```bash
npm run dev
```

---

## 📜 Scripts

- `npm run dev`: Start dev server with hot-reloading (`ts-node-dev`)
- `npm run build`: Compile TypeScript to JavaScript (`tsc`)
- `npm run start`: Start production server from `dist/`
- `npm run prisma:generate`: Generate Prisma Client from multi-file schemas
- `npm run prisma:migrate`: Run database migrations
- `npm run lint`: Lint code with ESLint
- `npm run format`: Format code with Prettier
