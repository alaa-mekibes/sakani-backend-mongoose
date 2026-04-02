# 🏠 Sakani — Backend

> RESTful API for **Sakani**, an Algerian real estate platform built with Node.js, Express, and MongoDB.

**Frontend Repo:** [sakani-frontend-react](https://github.com/alaa-mekibes/sakani-frontend-react)

---

## 🛠 Tech Stack

| Technology | Purpose |
| ---------- | ------- |
| Node.js + Express 5 | HTTP server & routing |
| TypeScript | Type safety |
| MongoDB + Mongoose | Database & ODM |
| Cloudinary | Image storage |
| JWT | Authentication |
| Zod | Schema validation |
| Bcryptjs | Password hashing |

---

## 📦 Packages

### Dependencies

| Package | Why |
| ------- | --- |
| `express` | Web framework — handles routing, middleware, and HTTP |
| `mongoose` | MongoDB ODM — schema modeling, validation, and queries |
| `bcryptjs` | Hashes passwords before saving to DB — never store plain text passwords |
| `jsonwebtoken` | Creates and verifies JWT tokens for authentication |
| `cloudinary` | SDK to upload, delete, and manage images on Cloudinary |
| `multer` | Middleware to handle file uploads (`req.files`) — Express can't do this alone |
| `multer-storage-cloudinary` | Connects Multer directly to Cloudinary — files go straight to Cloudinary without touching disk |
| `zod` | Runtime schema validation for request body, query, and params |
| `dotenv` | Loads environment variables from `.env` file |
| `cors` | Allows cross-origin requests from the frontend (different port/domain) |
| `helmet` | Sets secure HTTP headers to protect against common attacks |
| `compression` | Gzip compresses responses — faster data transfer |
| `cookie-parser` | Parses cookies from requests — needed to read the JWT cookie |
| `express-rate-limit` | Limits repeated requests — protects against brute force attacks |

### Dev Dependencies

| Package | Why |
| ------- | --- |
| `typescript` | TypeScript compiler |
| `ts-node` | Runs TypeScript files directly without compiling |
| `nodemon` | Restarts server automatically on file changes during development |
| `@types/*` | Type definitions for packages that don't include them natively |

---

## 📁 Project Structure

```markdown
src/
├── config/
│   ├── cloudinary.ts       # Cloudinary SDK configuration
│   └── db.ts               # MongoDB connection
├── controllers/
│   ├── auth.ts             # register, login, logout, profile
│   ├── property.ts         # CRUD for properties
│   └── inquiry.ts          # Buyer inquiries
├── errors/
│   └── index.ts            # Custom error classes (AppError, NotFoundError, etc.)
├── lib/
│   └── zod.ts              # Zod instance (re-exported for consistency)
├── middleware/
│   ├── auth.ts             # JWT verification — protects private routes
│   ├── error.ts            # Global error handler
│   ├── notFound.ts         # 404 handler for unknown routes
│   ├── upload.ts           # Multer + Cloudinary storage configuration
│   └── validate.ts         # Zod validation middleware (body, query, params)
├── models/
│   ├── user.ts             # User mongoose schema
│   ├── property.ts         # Property mongoose schema
│   └── inquiry.ts          # Inquiry mongoose schema
├── routes/
│   ├── auth.ts             # /api/auth routes
│   ├── property.ts         # /api/property routes
│   └── inquiry.ts          # /api/inquiry routes
├── schemas/
│   ├── user.ts             # Zod schemas for user (register, login)
│   ├── property.ts         # Zod schemas for property (create, update, search)
│   └── inquiry.ts          # Zod schemas for inquiry
├── types/
│   ├── express.d.ts        # Extends Express Request with req.user & req.validated
│   ├── user.ts             # User TypeScript types
│   ├── property.ts         # Property TypeScript types
│   └── inquiry.ts          # Inquiry TypeScript types
├── utils/
│   ├── apiResponse.ts      # Standardized API response wrapper { status, data, message }
│   └── generateToken.ts    # Creates JWT and sets it as httpOnly cookie
└── server.ts               # App entry point
```

---

## 🔧 Utility Functions

### `ApiResponse` — `src/utils/apiResponse.ts`

Standardizes all API responses so the frontend always receives the same shape:

```typescript
ApiResponse.success(data)   // { status: 'success', data, meta, message }
ApiResponse.paginated(errors)    // { status: 'success', pagination: {page, limit, totalCount, totalPages,hasNextPage: page < totalPages,hasPreviousPage: page > 1,}, meta}
ApiResponse.error(errors)    // { status: 'error', message }
ApiResponse.fail(errors)    // { status: 'fail', errors }
```

**`meta` means additional data**

### `generateToken` — `src/utils/generateToken.ts`

Creates a signed JWT and sets it as an `httpOnly` cookie on the response. Using `httpOnly` means the token cannot be accessed by JavaScript — protects against XSS attacks.

### `validate` middleware — `src/middleware/validate.ts`

Reusable Zod validation middleware for any route. Validates `body`, `query`, or `params` and stores parsed data in `req.validated`:

```typescript
validate(createPropertySchema)           // validates req.body
validate(searchSchema, 'query')          // validates req.query
validate(propertyIdSchema, 'params')     // validates req.params
```

### `errorHandler` middleware — `src/middleware/error.ts`

Global error handler. Catches all thrown errors:

- `AppError` instances → returns the defined status code and message
- Unknown errors → returns 500 with stack trace in development

### Custom Errors — `src/errors/index.ts`

```typescript
throw new BadRequestError('client side error');    // 400
throw new NotFoundError('Property not found');    // 404
throw new ConflictError('Email already exists');  // 409
throw new UnauthorizedError('Not logged in');     // 401
throw new ForbiddenError('You don t have access for this');     // 403
```

---

## 🔌 API Routes

### Auth — `/api/auth`

| Method | Route | Access | Description |
| ------ | ----- | ------ | ----------- |
| POST | `/register` | Public | Create account |
| POST | `/login` | Public | Login + set cookie |
| POST | `/logout` | Private | Clear cookie |
| GET | `/me` | Private | Get current user |
| DELETE | `/` | Private | DELETE current user |

### Property — `/api/property`

| Method | Route | Access | Description |
| ------ | ----- | ------ | ----------- |
| GET | `/` | Public | List all with filters |
| GET | `/:propertyId` | Public | Get single property |
| POST | `/` | Private | Create property |
| PATCH | `/:propertyId` | Private (owner) | Update property |
| DELETE | `/:propertyId` | Private (owner) | Delete property |

### Inquiry — `/api/inquiry`

| Method | Route | Access | Description |
| ------ | ----- | ------ | ----------- |
| POST | `/:propertyId` | Private | Send inquiry |
| GET | `/` | Private | Get my inquiries (owner) |
| PATCH | `/:inquiryId/read` | Private | Mark as read |

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` or change his name:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=mongodb://localhost:27017/sakani
JWT_SECRET_KEY=your_secret_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🚀 Getting Started

```bash
# Install dependencies
bun install

# Run in development
bun dev
```

Server runs at `http://localhost:5000`
