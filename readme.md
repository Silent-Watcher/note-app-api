# AI-Note-APP-API

## Tools & Tech ⛏

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Zod](https://img.shields.io/badge/zod-%233068b7.svg?style=for-the-badge&logo=zod&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Vitest](https://img.shields.io/badge/-Vitest-252529?style=for-the-badge&logo=vitest&logoColor=FCC72B)

## API Versioning

Our API uses header-based versioning via the `Accept` HTTP header. Clients **must** include the following header on every request:

```http
Accept: application/vnd.myapp.v{version}+json
```

- If the `Accept` header is **omitted**, the API **defaults to version 1**.
- **Currently, only version 1 is available.**

---

## API Reference

Use this document to quickly look up each endpoint, its headers, request body, response schema, status codes, and whether it’s protected or public.

---

### Authentication

#### POST `/auth/register`

**Tag:** Public

**Headers:**

```http
Accept: application/vnd.myapp.v1+json
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "string",
  "confirmPassword": "string"
}
```

> Password must be at least 8 characters long

**Responses:**

| Status | Description
|--------|-------------------------------
| 201    | Created successfully
| 400    | Validation error
| 403    | Forbidden error

> you recieve 403 in cases where you already loggedIn
---

#### POST `/auth/login`

**Tag:** Public

**Headers:**

```http
Accept: application/vnd.myapp.v1+json
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "string"
}
```

**Responses:**

| Status | Description
|--------|-------------------------------
| 201    | Created successfully
| 400    | Validation error
| 403    | Forbidden error

> you recieve 403 in cases where you already loggedIn

---

#### GET `/auth/logout`

**Tag:** Protected

**Headers:**

```http
Accept: application/vnd.myapp.v1+json
```

**Responses:**

| Status | Description
|--------|-------------------------------
| 200    | OK
| 403    | Forbidden error

> you recieve 403 in cases where you don't have any active session and valid access token

---

#### POST `/auth/refresh`

**Tag:** Public

**Headers:**

```http
Accept: application/vnd.myapp.v1+json
```

**Responses:**

| Status | Description
|--------|-------------------------------
| 201    | Created successfully

> The cookie that contains the refresh token is sent automatically when you hit this endpoint

---

## Authentication Flow & Error Handling Guide for Frontend

This guide outlines how our backend and frontend coordinate for JWT-based authentication, covering public vs. protected routes, token management, middleware logic, frontend integration, and a sequence diagram.

---

### 1. Public vs. Protected Routes

- **Public Endpoints**:
  - `/auth/login`
  - `/auth/register`
  These routes are accessible without a valid **accessToken**.

- **Protected Endpoints**:
  - All other API routes that marked as **protected**.
  - Require a valid **accessToken** in the `Authorization` header.

---

### 2. Token Types, Lifetimes, and Storage

| Token Type     | Lifetime      | Storage              | Sent via                              |
|----------------|---------------|----------------------|---------------------------------------|
| **Access Token**  | Short (e.g. 5m) | in-memory | `Authorization: Bearer <accessToken>` header |
| **Refresh Token** | Long (e.g. 1d) | HTTP-only, Secure **cookie** scoped to `/auth/refresh` | Browser sends cookie automatically on `/auth/refresh` |

> **Total session time:** A user’s session (via rolling refreshes) can remain active for up to **7 days** before they must fully re-authenticate.
> **Security Note:** Refresh tokens are never exposed to JavaScript. Access tokens are kept minimal and short-lived.

---

### 3. Middleware Logic (`blockIfAuthenticated`)

Applied on public routes (`/login`, `/register`) to prevent already-authenticated users from re-authenticating:

1. **Check for `Authorization` header**:
   - No header → `next()` (allow).
2. **Verify `accessToken`**:
   - **Valid** → respond `403 Forbidden` with `{ code: "FORBIDDEN", message: "Authenticated users cannot access the login or register endpoints." }`.
   - **Expired or invalid** → `next()` (treat as unauthenticated).

> **Frontend Note:** Before each request, the front end should avoid attaching an expired or invalid access token**. If it’s expired, trigger the refresh flow instead of sending it to the server.

This ensures only valid active sessions are blocked, while expired tokens let users re-login or register.

---

### 4. Frontend Responsibilities

#### 4.1 Attaching Access Token

Configure your HTTP client (e.g. Axios) to include the access token on protected requests:

```js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.API_URL,
  withCredentials: true, // if using cookie-based refresh
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

#### 4.2 Handling `403 Unauthorized`

On any 403 response from a protected endpoint, attempt a token refresh before redirecting to login:

```js
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await api.post('/auth/refresh');
        localStorage.setItem('accessToken', data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed: clear tokens and redirect
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

#### 4.3 Refresh Flow

1. **On 401**, call `/auth/refresh` once with `{ withCredentials: true }`.
2. **If successful**, store new `accessToken` and retry original request.
3. **If failed**, clear storage and navigate to `/login`.

#### 4.4 Login/Register Flow

- Send email/password to `/auth/login` or `/auth/register`.
- Backend returns `{ accessToken }` on success.
- **Store** `accessToken` in `localStorage` (or preferred storage).

```js
async function login(credentials) {
  const { data } = await api.post('/auth/login', credentials);
  localStorage.setItem('accessToken', data.accessToken);
  // Handle post-login initialization...
}
```

---

### 5. Sequence Diagram

```mermaid
sequenceDiagram
  participant FE as Frontend
  participant BE as Backend

  FE->>BE: POST /auth/login {email, password}
  BE-->>FE: 200 {accessToken}
  FE->>FE: store accessToken

  FE->>BE: GET /profile (with expired token)
  BE-->>FE: 401 Unauthorized

  FE->>BE: POST /auth/refresh (cookie sent)
  BE-->>FE: 200 {accessToken}
  FE->>FE: update accessToken

  FE->>BE: GET /profile (with new token)
  BE-->>FE: 200 {userProfile}
```
