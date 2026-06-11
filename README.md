# Task Management Application

A full-stack Task Management Application built using **Angular 20**, **Node.js**, **Express.js**, **MongoDB**, **JWT Authentication**, and **Socket.IO**.

The application allows organizations to manage tasks efficiently through a hierarchical role-based system consisting of:

* Manager
* Team Lead
* Employee

Users can create, assign, update, track, and manage tasks while receiving real-time updates across connected clients.

---

# Features

## Authentication

* User Registration
* User Login
* JWT Authentication
* Password Hashing using bcrypt
* Protected Routes
* Session Management

---

## Role-Based Authorization

### Manager

Manager has full access to the system.

Capabilities:

* View all users
* View all Team Leads
* View all Employees
* View all tasks
* Create tasks
* Assign tasks to any user
* Reassign tasks
* Update any task
* Delete any task
* Monitor overall progress

---

### Team Lead

Team Lead manages assigned teams.

Capabilities:

* View team members
* View team tasks
* Create tasks
* Assign tasks to team members
* Assign tasks to self
* Update team tasks
* Track team progress

---

### Employee

Employee manages personal tasks.

Capabilities:

* Create tasks
* View own tasks
* Update own tasks
* Delete own tasks
* Mark tasks as completed

Tasks created by employees are automatically assigned to themselves.

---

# Real-Time Communication

The application uses Socket.IO for real-time synchronization.

Whenever:

* Task is created
* Task is updated
* Task is deleted
* Task is reassigned

All connected dashboards are updated instantly.

Example:

Employee updates task status.

Result:

* Manager dashboard updates automatically
* Team Lead dashboard updates automatically
* Employee dashboard updates automatically

No page refresh required.

---

# Technology Stack

## Frontend

| Technology       | Purpose              |
| ---------------- | -------------------- |
| Angular 20       | Frontend Framework   |
| TypeScript       | Development Language |
| Angular Router   | Routing              |
| RxJS             | Reactive Programming |
| Angular Forms    | Form Validation      |
| HTTP Client      | API Communication    |
| Socket.IO Client | Real-Time Updates    |
| Bootstrap / CSS  | UI Styling           |

---

## Backend

| Technology | Purpose                 |
| ---------- | ----------------------- |
| Node.js    | Runtime Environment     |
| Express.js | API Development         |
| JWT        | Authentication          |
| bcrypt     | Password Encryption     |
| Socket.IO  | Real-Time Communication |
| dotenv     | Environment Variables   |

---

## Database

| Technology | Purpose  |
| ---------- | -------- |
| MongoDB    | Database |
| Mongoose   | ODM      |

---

# System Architecture

```text
+--------------------------+
|      Angular Frontend    |
+------------+-------------+
             |
             |
      HTTP Requests
             |
             ▼
+--------------------------+
|    Node.js + Express     |
+------------+-------------+
             |
             |
      MongoDB Database
             |
             ▼
+--------------------------+
|         MongoDB          |
+--------------------------+
```

---

# Real-Time Architecture

```text
Employee Updates Task
           |
           ▼
     Express API
           |
           ▼
     Socket.IO Server
           |
     -----------------
     |       |       |
     ▼       ▼       ▼
 Manager  TeamLead Employee
 Dashboard Dashboard Dashboard
```

---

# Application Flow

## Authentication Flow

1. User registers.
2. Password is hashed using bcrypt.
3. User logs in.
4. JWT token is generated.
5. Token is stored in localStorage.
6. Angular Interceptor automatically attaches token.
7. Backend verifies token.
8. User is redirected to role-specific dashboard.

---

## Task Workflow

### Manager

Manager creates task.

Task can be assigned to:

* Manager
* Team Lead
* Employee

---

### Team Lead

Team Lead creates task.

Task can be assigned to:

* Self
* Team Members

---

### Employee

Employee creates task.

Task automatically assigned to self.

---

# Frontend Architecture

The frontend is built using Angular Standalone Components architecture.

## Frontend Structure

```text
Frontend/
│
├── src/
│
├── app/
│   │
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   │
│   ├── core/
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   └── role.guard.ts
│   │   │
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts
│   │   │
│   │   └── services/
│   │       ├── auth.service.ts
│   │       ├── task.service.ts
│   │       ├── user.service.ts
│   │       └── socket.service.ts
│   │
│   ├── dashboard/
│   │   ├── dashboard.component.ts
│   │   └── dashboard.component.html
│   │
│   ├── models/
│   │   ├── user.ts
│   │   └── task.ts
│   │
│   ├── app.routes.ts
│   ├── app.config.ts
│   ├── app.config.server.ts
│   ├── app.routes.server.ts
│   ├── app.ts
│   ├── app.html
│   └── app.css
│
├── environments/
│
├── main.ts
├── main.server.ts
└── styles.css
```

---

# Core Layer

## Services

### Auth Service

Responsible for:

* Register
* Login
* Logout
* Token Storage
* Authentication State

---

### Task Service

Responsible for:

* Fetch Tasks
* Create Task
* Update Task
* Delete Task

---

### User Service

Responsible for:

* Fetch Users
* Fetch Team Members
* User Assignment

---

### Socket Service

Responsible for:

* Connect Socket
* Listen Events
* Emit Events
* Disconnect Socket

---

# Angular Guards

## Auth Guard

Protects routes from unauthorized access.

Example:

```text
/dashboard
/tasks
/users
```

Only authenticated users can access these routes.

---

## Role Guard

Restricts access according to user role.

### Manager Routes

```text
/manager
```

### Team Lead Routes

```text
/teamlead
```

### Employee Routes

```text
/employee
```

---

# HTTP Interceptors

The application uses Angular HTTP Interceptors.

Responsibilities:

* Attach JWT token automatically
* Handle API errors globally
* Handle unauthorized responses
* Centralized request processing

Flow:

```text
Component
   |
Service
   |
Interceptor
   |
Backend API
```

---

# Backend Architecture

```text
Backend/
│
├── config/
│
├── controllers/
│   ├── authController.js
│   ├── taskController.js
│   └── userController.js
│
├── middleware/
│   ├── authMiddleware.js
│   ├── roleMiddleware.js
│   └── errorMiddleware.js
│
├── models/
│   ├── User.js
│   └── Task.js
│
├── routes/
│   ├── authRoutes.js
│   ├── taskRoutes.js
│   └── userRoutes.js
│
├── sockets/
│   └── socketServer.js
│
├── server.js
│
└── package.json
```

---

# Database Design

## User Collection

```json
{
  "_id": "",
  "username": "",
  "email": "",
  "password": "",
  "role": "Manager",
  "manager": "",
  "teamLead": ""
}
```

Roles:

* Manager
* TeamLead
* Employee

---

## Task Collection

```json
{
  "_id": "",
  "title": "",
  "description": "",
  "status": "Pending",
  "createdBy": "",
  "assignedTo": "",
  "createdAt": "",
  "updatedAt": ""
}
```

Status Values:

* Pending
* Completed

---

# API Endpoints

## Authentication

### Register

```http
POST /api/auth/register
```

### Login

```http
POST /api/auth/login
```

---

## Users

### Get Users

```http
GET /api/users
```

Manager only.

---

## Tasks

### Create Task

```http
POST /api/tasks
```

### Get Tasks

```http
GET /api/tasks
```

### Update Task

```http
PUT /api/tasks/:id
```

### Delete Task

```http
DELETE /api/tasks/:id
```

---

# Security Features

## Authentication Security

* JWT Tokens
* Password Hashing
* Token Verification

---

## Authorization Security

* Role-Based Access Control
* Protected APIs
* Route Guards

---

## Data Security

* Environment Variables
* Input Validation
* Request Validation
* Error Handling

---

# Error Handling

Backend:

* Try-Catch Blocks
* Centralized Error Middleware
* Validation Errors
* Authentication Errors
* Authorization Errors

Frontend:

* Form Validation
* API Error Handling
* User-Friendly Messages
* Loading States

---

# Server-Side Rendering (SSR)

Angular SSR support is enabled.

Files:

```text
app.config.server.ts
app.routes.server.ts
main.server.ts
server.ts
```

Benefits:

* Better SEO
* Faster Initial Load
* Improved Performance

---

# Installation

## Clone Repository

```bash
git clone https://github.com/your-username/Task-Managment-Application.git
```

---

# Backend Setup

```bash
cd backend
npm install
```

Create .env

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key
```

Run Backend

```bash
npm run dev
```

---

# Frontend Setup

```bash
cd Frontend
npm install
```

Run Angular Application

```bash
ng serve
```

Open:

```text
http://localhost:4200
```

---

# Future Enhancements

* Task Priority Levels
* Due Dates
* Calendar View
* Activity Logs
* Email Notifications
* Push Notifications
* Team Chat
* Analytics Dashboard
* Performance Reports
* File Uploads
* Dark Mode
* Advanced Search
* Task Comments

---

# Author

Deepika Jaiswal

MEAN / MERN Stack Developer

GitHub:
https://github.com/Deepika-555

---

# License

This project is licensed under the MIT License.
