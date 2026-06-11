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
git clone https://github.com/Deepika-555/Task-Managment-Application.git
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

## Application Screenshots
### Register

<img width="1918" height="966" alt="Screenshot 2026-06-11 131321" src="https://github.com/user-attachments/assets/fbfa5a6d-850f-4c57-a53e-adf48b40e04a" />

<img width="1918" height="972" alt="Screenshot 2026-06-11 131230" src="https://github.com/user-attachments/assets/16b01e16-949a-496b-b6bb-a28875e92781" />
<img width="1918" height="970" alt="Screenshot 2026-06-11 131215" src="https://github.com/user-attachments/assets/f4ed09e7-ab72-41d5-86a7-c3eaa3384e40" />

### Login

<img width="1918" height="963" alt="Screenshot 2026-06-11 131400" src="https://github.com/user-attachments/assets/c0b67e35-a076-4936-bdbf-04263a6c2d13" />

### Manager Dashboard
<img width="1918" height="971" alt="Screenshot 2026-06-11 131453" src="https://github.com/user-attachments/assets/8465a469-93c0-4983-86a9-1eb99722ea0d" />

### Team Lead Dashboard

<img width="1903" height="972" alt="Screenshot 2026-06-11 131613" src="https://github.com/user-attachments/assets/09f9e223-a1d2-4d7f-b8f4-eaaff728e6b9" />

### Employee Dashboard

<img width="1917" height="965" alt="Screenshot 2026-06-11 131737" src="https://github.com/user-attachments/assets/36690835-d16a-4dec-ab01-10f3f3b257cd" />

### Task Creation 
<img width="1918" height="970" alt="Screenshot 2026-06-11 131520" src="https://github.com/user-attachments/assets/34f568cc-5c8d-4ed5-9484-75c4048a4d23" />


## Demo Credentials

### Manager

Email: manager123@gmail.com
Password: manager123

### Team Lead

Email: teamleader123@gmail.com
Password: teamlead123@

### Employee

Email: deepikatest@gmail.com
Password: Deepika123


# Assignment Requirements Coverage

| Requirement | Status |
|------------|---------|
| User Registration | ✅ |
| User Login | ✅ |
| JWT Authentication | ✅ |
| Protected Routes | ✅ |
| Role-Based Authorization | ✅ |
| Manager Dashboard | ✅ |
| Team Lead Dashboard | ✅ |
| Employee Dashboard | ✅ |
| Create Task | ✅ |
| View Tasks | ✅ |
| Update Task | ✅ |
| Delete Task | ✅ |
| Task Assignment | ✅ |
| Task Reassignment | ✅ |
| Task Status Filter | ✅ |
| Angular Frontend | ✅ |
| Form Validation | ✅ |
| Error Handling | ✅ |
| Responsive Design | ✅ |
| Socket.IO Updates | ✅ / Optional |
| Deployment | Optional |

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
* Advanced Search
* Task Comments

---

# Author

Deepika Jaiswal

MEAN / MERN Stack Developer

GitHub:
https://github.com/Deepika-555

---

