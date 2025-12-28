# OTP-Based Tenant Registration

This document describes the email OTP verification flow for tenant registration in the Fleeting Commerce platform.

## Overview

The registration process is now a **2-step verification flow**:

1. **Initiate Registration**: User provides email, receives OTP via email
2. **Verify & Complete**: User provides OTP + registration details to complete signup

## Flow Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  User enters    │     │  Backend sends  │     │  User receives  │
│     email       │────▶│   OTP email     │────▶│   OTP in inbox  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Registration   │     │  Backend creates│     │  User submits   │
│    complete     │◀────│  tenant & user  │◀────│  OTP + details  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## API Endpoints

### 1. Initiate Registration

Sends an OTP to the provided email address.

**Endpoint:** `POST /api/auth/register/initiate`

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**

```json
{
  "message": "OTP sent successfully to your email",
  "data": {
    "email": "user@example.com",
    "expiresIn": "5 minutes"
  }
}
```

**Error Responses:**

| Status | Message                                                | Cause                        |
| ------ | ------------------------------------------------------ | ---------------------------- |
| 400    | Email has already been taken!                          | Email already registered     |
| 400    | Too many OTP requests. Please try again after an hour. | Rate limit exceeded (3/hour) |
| 400    | Please wait X seconds before requesting a new OTP.     | Cooldown period (60 seconds) |
| 400    | Failed to send OTP email. Please try again.            | Email service error          |

---

### 2. Verify OTP & Complete Registration

Verifies the OTP and creates the tenant + user account.

**Endpoint:** `POST /api/auth/register/verify-otp`

**Request Body:**

```json
{
  "email": "user@example.com",
  "otp": "123456",
  "name": "John Doe",
  "password": "securePassword123",
  "phone": "+8801712345678",
  "tenantName": "My Store"
}
```

**Success Response (200):**

```json
{
  "message": "Registration completed successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "user@example.com",
      "phone": "+8801712345678",
      "role": "TENANT_ADMIN",
      "tenantId": "tenant-uuid",
      "isActive": true,
      "createdAt": "2025-12-26T00:00:00.000Z",
      "updatedAt": "2025-12-26T00:00:00.000Z"
    },
    "tenant": {
      "id": "tenant-uuid",
      "name": "My Store",
      "domain": null,
      "hasUsedTrial": false,
      "isActive": true,
      "createdAt": "2025-12-26T00:00:00.000Z",
      "updatedAt": "2025-12-26T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**

| Status | Message                                                  | Cause                            |
| ------ | -------------------------------------------------------- | -------------------------------- |
| 400    | No OTP found for this email. Please request a new OTP.   | No OTP record exists             |
| 400    | OTP has expired. Please request a new one.               | OTP older than 5 minutes         |
| 400    | Maximum OTP attempts exceeded. Please request a new OTP. | 3+ failed attempts               |
| 400    | Invalid OTP. X attempt(s) remaining.                     | Wrong OTP entered                |
| 400    | Email has already been taken!                            | Email registered during OTP flow |

---

### 3. Resend OTP

Resends a new OTP to the email address (subject to rate limits).

**Endpoint:** `POST /api/auth/register/resend-otp`

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**

```json
{
  "message": "OTP sent successfully to your email",
  "data": {
    "email": "user@example.com",
    "expiresIn": "5 minutes"
  }
}
```

**Error Responses:** Same as Initiate Registration

---

## Security Features

### Rate Limiting

- **Max 3 OTP requests per email per hour**
- Prevents abuse and email bombing

### Cooldown Period

- **60 seconds between OTP requests**
- Prevents rapid-fire requests

### OTP Expiry

- **5 minutes validity**
- Short window reduces risk of interception

### Attempt Limiting

- **Max 3 attempts per OTP**
- Prevents brute-force attacks
- After 3 failed attempts, OTP is invalidated

### Email Validation

- Checks if email is already registered before sending OTP
- Re-checks before completing registration (race condition prevention)

---

## Database Schema

```prisma
model EmailOtp {
  id            String    @id @default(uuid())
  email         String
  otp           String
  expiresAt     DateTime
  verified      Boolean   @default(false)
  attempts      Int       @default(0)
  lastAttemptAt DateTime?
  createdAt     DateTime  @default(now())

  @@index([email])
}
```

---

## Environment Variables

Add these to your `.env` file:

```env
# Mailtrap Configuration
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=your_mailtrap_username
MAILTRAP_PASS=your_mailtrap_password
MAIL_FROM="Fleeting Commerce <noreply@fleetingcommerce.com>"
```

---

## Frontend Implementation Guide

### Step 1: Email Input Screen

```typescript
// User enters email
const initiateRegistration = async (email: string) => {
  const response = await fetch("/api/auth/register/initiate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (response.ok) {
    // Navigate to OTP verification screen
    // Start 5-minute countdown timer
  } else {
    // Show error message
  }
};
```

### Step 2: OTP & Details Screen

```typescript
// User enters OTP and other details
const completeRegistration = async (data: {
  email: string;
  otp: string;
  name: string;
  password: string;
  phone: string;
  tenantName: string;
}) => {
  const response = await fetch("/api/auth/register/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (response.ok) {
    // Registration successful
    // Navigate to login or dashboard
  } else {
    // Show error message
    // If OTP expired, show resend button
  }
};
```

### Step 3: Resend OTP

```typescript
// Resend OTP (with cooldown handling)
const resendOtp = async (email: string) => {
  const response = await fetch("/api/auth/register/resend-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (response.ok) {
    // Reset countdown timer
    // Show success message
  } else {
    const error = await response.json();
    // Handle rate limit or cooldown errors
  }
};
```

---

## Legacy Endpoint (Preserved)

The original direct registration endpoint is still available for backward compatibility or testing:

**Endpoint:** `POST /api/auth/register/tenant-admin-with-tenant`

**Request Body:**

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securePassword123",
  "phone": "+8801712345678",
  "tenantName": "My Store"
}
```

> ⚠️ **Note:** This endpoint bypasses email verification. Consider protecting it with admin authentication in production.

---

## Testing with Mailtrap

1. Sign up at [mailtrap.io](https://mailtrap.io)
2. Create an inbox
3. Copy SMTP credentials to `.env`
4. Test OTP emails appear in Mailtrap inbox

---

## Error Handling Best Practices

### Frontend Error Display

```typescript
const handleRegistrationError = (error: any) => {
  switch (true) {
    case error.message.includes("already been taken"):
      return "This email is already registered. Please login instead.";
    case error.message.includes("Too many OTP"):
      return "Too many attempts. Please try again in an hour.";
    case error.message.includes("wait"):
      return error.message; // Shows remaining seconds
    case error.message.includes("expired"):
      return "OTP expired. Please request a new one.";
    case error.message.includes("Invalid OTP"):
      return error.message; // Shows remaining attempts
    default:
      return "Something went wrong. Please try again.";
  }
};
```
