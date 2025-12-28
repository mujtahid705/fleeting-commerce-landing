# SSLCommerz Payment Gateway - API Documentation

## Overview

Complete API documentation for SSLCommerz payment integration in Fleeting Commerce Backend. This document covers all payment-related endpoints, request/response formats, authentication, and implementation examples.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Base URLs](#base-urls)
3. [API Endpoints](#api-endpoints)
4. [SSLCommerz Callbacks](#sslcommerz-callbacks)
5. [Payment Flow](#payment-flow)
6. [Testing Guide](#testing-guide)
7. [Error Handling](#error-handling)
8. [Frontend Integration](#frontend-integration)

---

## Authentication

### JWT Authentication

All protected endpoints require JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Role-Based Access

- **TENANT_ADMIN**: Can initiate payments, view payment history
- **CUSTOMER**: Cannot access payment endpoints
- **SUPER_ADMIN**: Full access

---

## Base URLs

### Development

```
Backend API: http://localhost:5000/api
Frontend: http://localhost:3000
```

### Production

```
Backend API: https://api.yourdomain.com/api
Frontend: https://yourdomain.com
```

---

## API Endpoints

### 1. Initiate Payment

**Endpoint:** `POST /api/payments/initiate`

**Description:** Initiates a new payment session with SSLCommerz for a selected subscription plan.

**Authentication:** Required (JWT + TENANT_ADMIN role)

**Request Body:**

```json
{
  "planId": "uuid-of-plan"
}
```

**Success Response (200):**

```json
{
  "message": "Payment initiated successfully",
  "data": {
    "paymentId": "550e8400-e29b-41d4-a716-446655440000",
    "gatewayUrl": "https://sandbox.sslcommerz.com/gwprocess/v4/gw.php?Q=SESSIONKEY123",
    "transactionId": "TXN_A1B2C3D4E5F6G7H8",
    "amount": 999,
    "currency": "BDT",
    "planName": "Professional Plan"
  }
}
```

**Error Responses:**

_Plan not found (404):_

```json
{
  "statusCode": 404,
  "message": "Plan not found",
  "error": "Not Found"
}
```

_Plan inactive (400):_

```json
{
  "statusCode": 400,
  "message": "This plan is no longer available",
  "error": "Bad Request"
}
```

_Free plan (400):_

```json
{
  "statusCode": 400,
  "message": "Free trial does not require payment. Use activate-trial endpoint.",
  "error": "Bad Request"
}
```

_SSLCommerz initialization failed (400):_

```json
{
  "statusCode": 400,
  "message": "Failed to initiate payment",
  "error": "Bad Request"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:5000/api/payments/initiate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "planId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

**Implementation Steps:**

1. Validate plan exists and is active
2. Get/create subscription for tenant
3. Generate unique transaction ID
4. Create pending payment record
5. Initialize SSLCommerz payment session
6. Return gateway URL to frontend
7. Frontend redirects user to gateway URL

---

### 2. Get Payment History

**Endpoint:** `GET /api/payments/history`

**Description:** Retrieves all payment transactions for the authenticated tenant.

**Authentication:** Required (JWT + TENANT_ADMIN role)

**Success Response (200):**

```json
{
  "message": "Payment history fetched successfully",
  "data": [
    {
      "id": "payment-uuid-1",
      "tenantId": "tenant-uuid",
      "subscriptionId": "subscription-uuid",
      "amount": 999,
      "currency": "BDT",
      "provider": "sslcommerz",
      "transactionId": "TXN_A1B2C3D4E5F6G7H8",
      "validationId": "123456789",
      "status": "PAID",
      "rawResponse": {
        "status": "VALID",
        "tran_id": "TXN_A1B2C3D4E5F6G7H8",
        "amount": "999.00",
        "card_type": "VISA-Dutch Bangla",
        "bank_tran_id": "1234567890"
      },
      "createdAt": "2025-12-27T10:30:00.000Z",
      "subscription": {
        "id": "subscription-uuid",
        "status": "ACTIVE",
        "plan": {
          "id": "plan-uuid",
          "name": "Professional Plan",
          "price": 999,
          "currency": "BDT",
          "interval": "MONTHLY"
        }
      }
    },
    {
      "id": "payment-uuid-2",
      "tenantId": "tenant-uuid",
      "subscriptionId": "subscription-uuid",
      "amount": 999,
      "currency": "BDT",
      "provider": "sslcommerz",
      "transactionId": "TXN_B2C3D4E5F6G7H8I9",
      "validationId": null,
      "status": "FAILED",
      "rawResponse": {
        "status": "FAILED",
        "tran_id": "TXN_B2C3D4E5F6G7H8I9",
        "error": "Card declined"
      },
      "createdAt": "2025-12-26T15:45:00.000Z",
      "subscription": {
        "id": "subscription-uuid",
        "status": "EXPIRED",
        "plan": {
          "id": "plan-uuid",
          "name": "Professional Plan",
          "price": 999,
          "currency": "BDT",
          "interval": "MONTHLY"
        }
      }
    }
  ]
}
```

**cURL Example:**

```bash
curl -X GET http://localhost:5000/api/payments/history \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 3. Get Single Payment

**Endpoint:** `GET /api/payments/:id`

**Description:** Retrieves details of a specific payment transaction.

**Authentication:** Required (JWT + TENANT_ADMIN role)

**URL Parameters:**

- `id` (UUID): Payment ID

**Success Response (200):**

```json
{
  "message": "Payment fetched successfully",
  "data": {
    "id": "payment-uuid",
    "tenantId": "tenant-uuid",
    "subscriptionId": "subscription-uuid",
    "amount": 999,
    "currency": "BDT",
    "provider": "sslcommerz",
    "transactionId": "TXN_A1B2C3D4E5F6G7H8",
    "validationId": "123456789",
    "status": "PAID",
    "rawResponse": {
      "status": "VALID",
      "tran_id": "TXN_A1B2C3D4E5F6G7H8",
      "val_id": "123456789",
      "amount": "999.00",
      "card_type": "VISA-Dutch Bangla",
      "card_no": "444444XXXXXX4444",
      "bank_tran_id": "1234567890",
      "card_issuer": "STANDARD CHARTERED BANK",
      "card_brand": "VISA",
      "card_issuer_country": "Bangladesh",
      "validation": {
        "status": "VALID",
        "tran_date": "2025-12-27 10:30:00",
        "tran_id": "TXN_A1B2C3D4E5F6G7H8",
        "val_id": "123456789",
        "amount": "999.00",
        "store_amount": "970.00",
        "currency": "BDT",
        "bank_tran_id": "1234567890",
        "card_type": "VISA-Dutch Bangla",
        "risk_level": "0",
        "risk_title": "Safe"
      }
    },
    "createdAt": "2025-12-27T10:30:00.000Z",
    "subscription": {
      "id": "subscription-uuid",
      "status": "ACTIVE",
      "startDate": "2025-12-27T10:30:00.000Z",
      "endDate": "2026-01-27T10:30:00.000Z",
      "plan": {
        "id": "plan-uuid",
        "name": "Professional Plan",
        "price": 999,
        "currency": "BDT",
        "interval": "MONTHLY"
      }
    }
  }
}
```

**Error Response (404):**

```json
{
  "statusCode": 404,
  "message": "Payment not found",
  "error": "Not Found"
}
```

**cURL Example:**

```bash
curl -X GET http://localhost:5000/api/payments/payment-uuid \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 4. Manual Payment Verification

**Endpoint:** `POST /api/payments/verify-manual`

**Description:** Manually verify a payment (for testing/development only).

**Authentication:** Required (JWT + TENANT_ADMIN role)

**Query Parameters:**

- `transactionId` (string): Transaction ID to verify

**Success Response (200):**

```json
{
  "message": "Payment successful and subscription activated",
  "data": {
    "id": "subscription-uuid",
    "tenantId": "tenant-uuid",
    "planId": "plan-uuid",
    "status": "ACTIVE",
    "startDate": "2025-12-27T10:30:00.000Z",
    "endDate": "2026-01-27T10:30:00.000Z",
    "autoRenew": false,
    "plan": {
      "id": "plan-uuid",
      "name": "Professional Plan",
      "price": 999,
      "currency": "BDT"
    }
  }
}
```

**Error Response (404):**

```json
{
  "statusCode": 404,
  "message": "Payment not found",
  "error": "Not Found"
}
```

**cURL Example:**

```bash
curl -X POST "http://localhost:5000/api/payments/verify-manual?transactionId=TXN_A1B2C3D4E5F6G7H8" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## SSLCommerz Callbacks

These endpoints are called by SSLCommerz after payment completion. **Do not call these endpoints directly.**

### 1. Success Callback

**Endpoint:** `POST /api/payments/callback/success`

**Called By:** SSLCommerz

**Request Body (from SSLCommerz):**

```json
{
  "tran_id": "TXN_A1B2C3D4E5F6G7H8",
  "val_id": "123456789",
  "amount": "999.00",
  "card_type": "VISA-Dutch Bangla",
  "store_amount": "970.00",
  "card_no": "444444XXXXXX4444",
  "bank_tran_id": "1234567890",
  "status": "VALID",
  "tran_date": "2025-12-27 10:30:00",
  "currency": "BDT",
  "card_issuer": "STANDARD CHARTERED BANK",
  "card_brand": "VISA",
  "card_issuer_country": "Bangladesh",
  "verify_sign": "abc123...",
  "verify_key": "amount,bank_tran_id,..."
}
```

**Behavior:**

1. Validates payment with SSLCommerz using `val_id`
2. Updates payment status to `PAID`
3. Activates tenant subscription
4. Creates success notification
5. Redirects to: `{FRONTEND_URL}/payment/success?transactionId={tran_id}`

---

### 2. Fail Callback

**Endpoint:** `POST /api/payments/callback/fail`

**Called By:** SSLCommerz

**Request Body (from SSLCommerz):**

```json
{
  "tran_id": "TXN_B2C3D4E5F6G7H8I9",
  "status": "FAILED",
  "error": "Card declined"
}
```

**Behavior:**

1. Updates payment status to `FAILED`
2. Creates failure notification
3. Redirects to: `{FRONTEND_URL}/payment/failed?transactionId={tran_id}`

---

### 3. Cancel Callback

**Endpoint:** `POST /api/payments/callback/cancel`

**Called By:** SSLCommerz

**Request Body (from SSLCommerz):**

```json
{
  "tran_id": "TXN_C3D4E5F6G7H8I9J0",
  "status": "CANCELLED"
}
```

**Behavior:**

1. Updates payment status to `FAILED`
2. Marks as cancelled in rawResponse
3. Redirects to: `{FRONTEND_URL}/payment/cancelled?transactionId={tran_id}`

---

### 4. IPN (Instant Payment Notification)

**Endpoint:** `POST /api/payments/ipn`

**Called By:** SSLCommerz (server-to-server)

**Description:** More reliable than browser redirects, called directly by SSLCommerz servers.

**Request Body (from SSLCommerz):**

```json
{
  "tran_id": "TXN_A1B2C3D4E5F6G7H8",
  "val_id": "123456789",
  "amount": "999.00",
  "status": "VALID",
  "card_type": "VISA-Dutch Bangla",
  "store_amount": "970.00",
  "bank_tran_id": "1234567890"
}
```

**Behavior:**

- If status is `VALID` or `VALIDATED`: Process as success
- Otherwise: Process as failure

**Response (200):**

```json
{
  "message": "IPN processed successfully"
}
```

---

## Payment Flow

### Complete Payment Journey

```
1. User selects a plan
   ↓
2. Frontend calls POST /api/payments/initiate
   ↓
3. Backend creates payment record (status: PENDING)
   ↓
4. Backend calls SSLCommerz init API
   ↓
5. Backend returns gatewayUrl to frontend
   ↓
6. Frontend redirects user to gatewayUrl
   ↓
7. User completes payment on SSLCommerz
   ↓
8. SSLCommerz calls POST /api/payments/callback/success
   ↓
9. Backend validates payment with SSLCommerz
   ↓
10. Backend updates payment (status: PAID)
    ↓
11. Backend activates subscription
    ↓
12. Backend creates notification
    ↓
13. Backend redirects to frontend success page
    ↓
14. Frontend shows success message
```

### Sequence Diagram

```
Frontend          Backend          SSLCommerz         Database
   |                 |                  |                 |
   |--initiate------>|                  |                 |
   |                 |--create--------->|                 |
   |                 |                  |                 |
   |                 |<--pending--------|                 |
   |                 |                  |                 |
   |                 |--init API------->|                 |
   |                 |                  |                 |
   |                 |<--gateway URL----|                 |
   |<--gatewayUrl----|                  |                 |
   |                 |                  |                 |
   |--redirect to SSLCommerz----------->|                 |
   |                 |                  |                 |
   |                 |                  |<--user pays--   |
   |                 |                  |                 |
   |                 |<--callback-------|                 |
   |                 |                  |                 |
   |                 |--validate------->|                 |
   |                 |                  |                 |
   |                 |<--VALID----------|                 |
   |                 |                  |                 |
   |                 |--update status------------->PAID   |
   |                 |                  |                 |
   |                 |--activate subscription------------>|
   |                 |                  |                 |
   |<--redirect success-----------------|                 |
   |                 |                  |                 |
```

---

## Testing Guide

### Test Cards (Sandbox Mode)

**Successful Payment:**

- Card Number: `4111 1111 1111 1111`
- CVV: `123`
- Expiry: Any future date
- Name: Any name

**Failed Payment:**

- Card Number: `4444 4444 4444 4444`
- CVV: `123`
- Expiry: Any future date

### Testing Steps

#### 1. Test Initiate Payment

```bash
# Login first to get JWT token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@tenant1.com",
    "password": "password123"
  }'

# Use the JWT token from response
export JWT_TOKEN="your-jwt-token-here"

# Initiate payment
curl -X POST http://localhost:5000/api/payments/initiate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "planId": "your-plan-uuid"
  }'
```

#### 2. Test Payment Gateway

1. Copy `gatewayUrl` from response
2. Open in browser
3. Fill payment form with test card
4. Submit payment
5. Verify redirect to frontend success page

#### 3. Test Payment History

```bash
curl -X GET http://localhost:5000/api/payments/history \
  -H "Authorization: Bearer $JWT_TOKEN"
```

#### 4. Test Manual Verification (Dev Only)

```bash
curl -X POST "http://localhost:5000/api/payments/verify-manual?transactionId=TXN_A1B2C3D4E5F6G7H8" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning      | Example                         |
| ---- | ------------ | ------------------------------- |
| 200  | Success      | Payment processed               |
| 400  | Bad Request  | Invalid plan, SSLCommerz error  |
| 401  | Unauthorized | Missing/invalid JWT token       |
| 403  | Forbidden    | Wrong role (not TENANT_ADMIN)   |
| 404  | Not Found    | Plan/Payment not found          |
| 500  | Server Error | Database error, SSLCommerz down |

### Common Errors

#### 1. SSLCommerz Credentials Not Configured

```json
{
  "statusCode": 500,
  "message": "SSLCommerz credentials are required"
}
```

**Solution:** Add `SSLCOMMERZ_STORE_ID` and `SSLCOMMERZ_STORE_PASSWORD` to `.env`

#### 2. Payment Validation Failed

```json
{
  "statusCode": 400,
  "message": "Payment validation failed"
}
```

**Solution:** Check `val_id` from callback, ensure SSLCommerz credentials are correct

#### 3. Payment Already Processed

```json
{
  "message": "Payment already processed",
  "data": { ... }
}
```

**Solution:** This is idempotency protection, not an error. Payment was already completed.

#### 4. Tenant or Admin Not Found

```json
{
  "statusCode": 404,
  "message": "Tenant or admin user not found"
}
```

**Solution:** Ensure tenant has at least one TENANT_ADMIN user

---

## Frontend Integration

### React Example

```typescript
// services/paymentService.ts
import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const initiatePayment = async (planId: string, token: string) => {
  const response = await axios.post(
    `${API_URL}/payments/initiate`,
    { planId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

export const getPaymentHistory = async (token: string) => {
  const response = await axios.get(`${API_URL}/payments/history`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getPayment = async (paymentId: string, token: string) => {
  const response = await axios.get(`${API_URL}/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
```

```tsx
// components/PaymentButton.tsx
import React, { useState } from "react";
import { initiatePayment } from "../services/paymentService";

interface PaymentButtonProps {
  planId: string;
  planName: string;
  amount: number;
  currency: string;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  planId,
  planName,
  amount,
  currency,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("jwt_token");
      if (!token) {
        throw new Error("Please login first");
      }

      const response = await initiatePayment(planId, token);

      // Redirect to SSLCommerz gateway
      window.location.href = response.data.gatewayUrl;
    } catch (err: any) {
      setError(err.response?.data?.message || "Payment initiation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handlePayment}
        disabled={loading}
        className="btn-primary"
      >
        {loading ? "Processing..." : `Pay ${currency} ${amount}`}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
};
```

```tsx
// pages/PaymentSuccess.tsx
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getPayment } from "../services/paymentService";

export const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get("transactionId");
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    // Optional: Fetch payment details
    const fetchPayment = async () => {
      const token = localStorage.getItem("jwt_token");
      if (token && transactionId) {
        try {
          const response = await getPayment(transactionId, token);
          setPaymentDetails(response.data);
        } catch (error) {
          console.error("Failed to fetch payment details");
        }
      }
    };

    fetchPayment();
  }, [transactionId]);

  return (
    <div className="success-page">
      <h1>✅ Payment Successful!</h1>
      <p>Transaction ID: {transactionId}</p>
      <p>Your subscription has been activated.</p>
      {paymentDetails && (
        <div>
          <p>
            Amount: {paymentDetails.currency} {paymentDetails.amount}
          </p>
          <p>Plan: {paymentDetails.subscription.plan.name}</p>
        </div>
      )}
      <button onClick={() => (window.location.href = "/dashboard")}>
        Go to Dashboard
      </button>
    </div>
  );
};
```

---

## Security Best Practices

### 1. Always Validate with SSLCommerz

Never trust the success callback alone. Always validate using `val_id`:

```typescript
const validationResponse = await this.sslCommerz.validate({ val_id });
if (validationResponse.status !== "VALID") {
  throw new Error("Payment validation failed");
}
```

### 2. Check Payment Status Before Processing

Prevent duplicate processing:

```typescript
if (payment.status === "PAID") {
  return { message: "Payment already processed" };
}
```

### 3. Store All Response Data

For auditing and dispute resolution:

```typescript
rawResponse: {
  ...callbackData,
  validation: validationResponse,
} as any
```

### 4. Use HTTPS in Production

Ensure all URLs use HTTPS:

```env
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
```

### 5. Validate Transaction Amounts

Compare SSLCommerz amount with your database:

```typescript
if (parseFloat(validationResponse.amount) !== payment.amount) {
  throw new Error("Amount mismatch");
}
```

---

## Troubleshooting

### Issue: "SSLCommerz credentials are required"

**Cause:** Missing environment variables  
**Solution:** Add credentials to `.env`:

```env
SSLCOMMERZ_STORE_ID=fleet694e7a7842e83
SSLCOMMERZ_STORE_PASSWORD=fleet694e7a7842e83@ssl
```

### Issue: "Failed to initiate payment"

**Cause:** SSLCommerz API error  
**Solution:**

1. Check credentials are correct
2. Verify sandbox mode matches credentials
3. Check SSLCommerz dashboard for errors

### Issue: "Payment validation failed"

**Cause:** Invalid `val_id` or credentials  
**Solution:**

1. Ensure callback includes `val_id`
2. Verify credentials
3. Check SSLCommerz logs

### Issue: Callbacks not working locally

**Cause:** SSLCommerz cannot reach localhost  
**Solution:** Use ngrok:

```bash
ngrok http 5000
# Update BACKEND_URL to ngrok URL
```

---

## Rate Limits

SSLCommerz has rate limits on API calls:

- **Sandbox:** ~100 requests/minute
- **Production:** Varies by merchant agreement

Implement retry logic with exponential backoff if needed.

---

## Support & Resources

- **SSLCommerz Documentation:** https://developer.sslcommerz.com/
- **Sandbox Dashboard:** https://sandbox.sslcommerz.com/
- **Test Cards:** https://developer.sslcommerz.com/doc/v4/#test-cards
- **Support Email:** integration@sslcommerz.com
- **Integration Support:** +880 1799-922366

---

**Version:** 1.0  
**Last Updated:** December 27, 2025  
**Status:** Production Ready
