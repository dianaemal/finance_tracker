
---

# DESIGN.md

```markdown
# Design Document

## Domain and Motivation

Personal finance management is a common challenge, especially for users who need a simple and centralized way to track income, expenses, and budgets. This application was designed to provide a lightweight, user friendly solution for managing financial data without relying on complex or paid tools. The goal is to give users clear visibility into their financial habits and help them stay within budget through structured tracking and analysis.

---

## Technology Stack

### Backend: FastAPI

FastAPI was chosen for its high performance, simplicity, and automatic API documentation. It supports asynchronous operations and integrates well with modern Python tools.

### Frontend: React

React enables a dynamic and responsive user interface. Component based architecture allows for reusable UI elements and efficient state management.

### Database: SQLite with SQLAlchemy

SQLite is used for simplicity and ease of setup. SQLAlchemy ORM abstracts database interactions, making queries more maintainable and readable.

### Authentication

JWT-based authentication is used with access and refresh tokens stored in HTTP-only cookies. Axios interceptors handle token refresh automatically.

---

## Core Features

### 1. Authentication System

Implements secure user authentication using JWT tokens. Access tokens are short lived, while refresh tokens allow session continuation without requiring frequent logins. Cookies are used to securely store tokens.

### 2. Accounts Management

Users can create multiple financial accounts (e.g., checking, savings). Each account maintains its own balance, which updates dynamically based on transactions.

### 3. Transaction Management

Users can record income and expense transactions. Each transaction includes details such as amount, type, category, account, date, and description. Updating transactions adjusts account balances accordingly.

### 4. Budget Tracking

Users can set monthly budgets and budgets per different categories (e.g., food, transport, rent, personal) and track spending against those budgets. The system calculates remaining budget and indicates whether the user is over or under budget.

### 5. Dashboard Analytics

The dashboard aggregates financial data to provide insights such as total balance, monthly income, expenses, net value, and budget status.

### 6. Filtering System

Transactions can be filtered by multiple criteria, including type, category, account, description, and date range. This improves usability when dealing with large datasets.

---

## Data Model

### Entities and Relationships

#### User

- `id`
- `username`
- `email`
- `password_hash`

**Relationships:**
- One-to-many with Accounts
- One-to-many with Transactions
- One-to-many with Categories
- One-to-many with Budgets

---

#### Account

- `id`
- `name`
- `balance`
- `user_id`

**Relationships:**
- Belongs to User
- One-to-many with Transactions

---

#### Transaction

- `id`
- `type` (Income / Expense)
- `amount`
- `date`
- `description`
- `account_id`
- `category_id`
- `user_id`

**Relationships:**
- Belongs to User
- Belongs to Account
- Belongs to Category

---

#### Category

- `id`
- `name`
- `user_id`

**Relationships:**
- Belongs to User
- One-to-many with Transactions

---

#### Budget

- `id`
- `amount`
- `month`
- `year`
- `user_id`
- `category_id` (optional if monthly then null)

**Relationships:**
- Belongs to User
- Optionally linked to Category

---

## Summary

This system follows a standard full stack architecture with clear separation between frontend and backend. The backend handles business logic, authentication, and data persistence, while the frontend focuses on user interaction and presentation. The modular design allows for future improvements such as improved security, and scalability enhancements.