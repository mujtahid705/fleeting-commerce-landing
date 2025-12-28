# Tenant Brand API Documentation

This module allows tenants to customize their brand settings including logo, tagline, description, and theme.

## Database Schema

```prisma
model TenantBrand {
  id          String   @id @default(uuid())
  tenantId    String   @unique
  logoUrl     String?
  tagline     String?
  description String?
  theme       Int      @default(1)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
}
```

### Fields Description

| Field         | Type              | Description                                           |
| ------------- | ----------------- | ----------------------------------------------------- |
| `id`          | UUID              | Primary key                                           |
| `tenantId`    | UUID              | Foreign key to Tenant (unique - one brand per tenant) |
| `logoUrl`     | String (nullable) | URL path to the uploaded logo image                   |
| `tagline`     | String (nullable) | Short tagline/slogan (max 200 characters)             |
| `description` | String (nullable) | Brand description (max 2000 characters)               |
| `theme`       | Integer           | Theme identifier number (default: 1, range: 1-100)    |
| `createdAt`   | DateTime          | Record creation timestamp                             |
| `updatedAt`   | DateTime          | Last update timestamp                                 |

---

## API Endpoints

### 1. Get Current Tenant's Brand Settings

Retrieves brand settings for the authenticated user's tenant.

**Endpoint:** `GET /api/tenant-brand`

**Authentication:** Required (JWT)

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**

```json
{
  "message": "Brand settings retrieved successfully",
  "data": {
    "id": "uuid",
    "tenantId": "uuid",
    "logoUrl": "/uploads/brands/logo-uuid.png",
    "tagline": "Your trusted commerce partner",
    "description": "We provide the best e-commerce solutions...",
    "theme": 1,
    "createdAt": "2025-12-28T12:00:00.000Z",
    "updatedAt": "2025-12-28T12:00:00.000Z",
    "tenant": {
      "id": "uuid",
      "name": "My Store",
      "domain": "mystore.com"
    }
  }
}
```

**Response (No brand exists):**

```json
{
  "message": "No brand settings found",
  "data": {
    "tenantId": "uuid",
    "logoUrl": null,
    "tagline": null,
    "description": null,
    "theme": 1
  }
}
```

---

### 2. Get Brand Settings by Tenant ID (Public)

Retrieves brand settings for a specific tenant. This is a public endpoint for storefront use.

**Endpoint:** `GET /api/tenant-brand/tenant/:tenantId`

**Authentication:** Not required

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `tenantId` | UUID | The tenant's unique identifier |

**Example:** `GET /api/tenant-brand/tenant/550e8400-e29b-41d4-a716-446655440000`

**Response (200 OK):**

```json
{
  "message": "Brand settings retrieved successfully",
  "data": {
    "id": "uuid",
    "tenantId": "uuid",
    "logoUrl": "/uploads/brands/logo-uuid.png",
    "tagline": "Your trusted commerce partner",
    "description": "We provide the best e-commerce solutions...",
    "theme": 1,
    "createdAt": "2025-12-28T12:00:00.000Z",
    "updatedAt": "2025-12-28T12:00:00.000Z",
    "tenant": {
      "id": "uuid",
      "name": "My Store",
      "domain": "mystore.com"
    }
  }
}
```

**Error Response (404 Not Found):**

```json
{
  "message": "Tenant not found",
  "error": "Not Found",
  "statusCode": 404
}
```

---

### 3. Get Brand Settings by Domain (Public)

Retrieves brand settings using the tenant's domain. Ideal for storefront applications that identify tenants by domain.

**Endpoint:** `GET /api/tenant-brand/domain?domain=<domain>`

**Authentication:** Not required

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `domain` | String | The tenant's domain |

**Example:** `GET /api/tenant-brand/domain?domain=mystore.com`

**Response (200 OK):**

```json
{
  "message": "Brand settings retrieved successfully",
  "data": {
    "id": "uuid",
    "tenantId": "uuid",
    "logoUrl": "/uploads/brands/logo-uuid.png",
    "tagline": "Your trusted commerce partner",
    "description": "We provide the best e-commerce solutions...",
    "theme": 1,
    "tenantName": "My Store",
    "domain": "mystore.com",
    "createdAt": "2025-12-28T12:00:00.000Z",
    "updatedAt": "2025-12-28T12:00:00.000Z"
  }
}
```

**Error Response (404 Not Found):**

```json
{
  "message": "Tenant not found for this domain",
  "error": "Not Found",
  "statusCode": 404
}
```

---

### 4. Create or Update Brand Settings (Upsert)

Creates new brand settings or updates existing ones. This is the recommended endpoint for setting up brand for the first time or making updates.

**Endpoint:** `POST /api/tenant-brand`

**Authentication:** Required (JWT)

**Authorization:** `TENANT_ADMIN` role required

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Request Body (form-data):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `logo` | File | No | Logo image file (jpg, jpeg, png, gif, webp, svg). Max 2MB |
| `tagline` | String | No | Short tagline (max 200 characters) |
| `description` | String | No | Brand description (max 2000 characters) |
| `theme` | Integer | No | Theme number (1-100, default: 1) |

**Example Request (cURL):**

```bash
curl -X POST "http://localhost:3000/api/tenant-brand" \
  -H "Authorization: Bearer <jwt_token>" \
  -F "logo=@/path/to/logo.png" \
  -F "tagline=Your trusted commerce partner" \
  -F "description=We provide the best e-commerce solutions for your business." \
  -F "theme=2"
```

**Response (201 Created / 200 OK):**

```json
{
  "message": "Brand settings created successfully",
  "data": {
    "id": "uuid",
    "tenantId": "uuid",
    "logoUrl": "/uploads/brands/abc123-uuid.png",
    "tagline": "Your trusted commerce partner",
    "description": "We provide the best e-commerce solutions for your business.",
    "theme": 2,
    "createdAt": "2025-12-28T12:00:00.000Z",
    "updatedAt": "2025-12-28T12:00:00.000Z"
  }
}
```

---

### 5. Update Brand Settings

Updates specific fields of existing brand settings.

**Endpoint:** `PATCH /api/tenant-brand`

**Authentication:** Required (JWT)

**Authorization:** `TENANT_ADMIN` role required

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Request Body (form-data):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `logo` | File | No | New logo image file |
| `tagline` | String | No | Updated tagline |
| `description` | String | No | Updated description |
| `theme` | Integer | No | Updated theme number |

**Example Request (cURL):**

```bash
curl -X PATCH "http://localhost:3000/api/tenant-brand" \
  -H "Authorization: Bearer <jwt_token>" \
  -F "theme=5"
```

**Response (200 OK):**

```json
{
  "message": "Brand settings updated successfully",
  "data": {
    "id": "uuid",
    "tenantId": "uuid",
    "logoUrl": "/uploads/brands/abc123-uuid.png",
    "tagline": "Your trusted commerce partner",
    "description": "We provide the best e-commerce solutions for your business.",
    "theme": 5,
    "createdAt": "2025-12-28T12:00:00.000Z",
    "updatedAt": "2025-12-28T12:30:00.000Z"
  }
}
```

**Error Response (404 Not Found):**

```json
{
  "message": "Brand settings not found. Please create brand settings first.",
  "error": "Not Found",
  "statusCode": 404
}
```

---

### 6. Delete Logo Only

Removes the logo while keeping other brand settings.

**Endpoint:** `DELETE /api/tenant-brand/logo`

**Authentication:** Required (JWT)

**Authorization:** `TENANT_ADMIN` role required

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**

```json
{
  "message": "Logo deleted successfully",
  "data": {
    "id": "uuid",
    "tenantId": "uuid",
    "logoUrl": null,
    "tagline": "Your trusted commerce partner",
    "description": "We provide the best e-commerce solutions...",
    "theme": 2,
    "createdAt": "2025-12-28T12:00:00.000Z",
    "updatedAt": "2025-12-28T12:45:00.000Z"
  }
}
```

---

### 7. Delete All Brand Settings

Removes all brand settings including the logo file.

**Endpoint:** `DELETE /api/tenant-brand`

**Authentication:** Required (JWT)

**Authorization:** `TENANT_ADMIN` role required

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**

```json
{
  "message": "Brand settings deleted successfully"
}
```

**Error Response (404 Not Found):**

```json
{
  "message": "Brand settings not found",
  "error": "Not Found",
  "statusCode": 404
}
```

---

## Implementation Details

### File Upload

- **Upload Directory:** `uploads/brands/`
- **Allowed Formats:** jpg, jpeg, png, gif, webp, svg
- **Maximum File Size:** 2MB
- **Filename:** Auto-generated UUID with original extension

### Theme System

The `theme` field is an integer that the frontend should interpret:

| Theme ID | Description                                  |
| -------- | -------------------------------------------- |
| 1        | Default theme                                |
| 2-100    | Custom themes (frontend decides the styling) |

The frontend is responsible for rendering the appropriate theme based on this number.

### Access Control

| Endpoint                                 | Authentication | Authorization                      |
| ---------------------------------------- | -------------- | ---------------------------------- |
| `GET /api/tenant-brand`                  | Required       | Any authenticated user with tenant |
| `GET /api/tenant-brand/tenant/:tenantId` | Not required   | Public                             |
| `GET /api/tenant-brand/domain`           | Not required   | Public                             |
| `POST /api/tenant-brand`                 | Required       | TENANT_ADMIN                       |
| `PATCH /api/tenant-brand`                | Required       | TENANT_ADMIN                       |
| `DELETE /api/tenant-brand/logo`          | Required       | TENANT_ADMIN                       |
| `DELETE /api/tenant-brand`               | Required       | TENANT_ADMIN                       |

### Frontend Implementation Guide

1. **Fetching Brand on Page Load:**

   ```javascript
   // For authenticated users
   const response = await fetch("/api/tenant-brand", {
     headers: { Authorization: `Bearer ${token}` },
   });

   // For public storefront (by domain)
   const response = await fetch(
     `/api/tenant-brand/domain?domain=${window.location.hostname}`
   );
   ```

2. **Applying Theme:**

   ```javascript
   const { theme, logoUrl, tagline } = brandData;

   // Apply CSS class based on theme
   document.body.classList.add(`theme-${theme}`);

   // Set logo
   if (logoUrl) {
     document.querySelector(".logo img").src = logoUrl;
   }
   ```

3. **Uploading Brand Settings:**

   ```javascript
   const formData = new FormData();
   formData.append("logo", logoFile);
   formData.append("tagline", "My Store Tagline");
   formData.append("description", "Store description...");
   formData.append("theme", "3");

   const response = await fetch("/api/tenant-brand", {
     method: "POST",
     headers: { Authorization: `Bearer ${token}` },
     body: formData,
   });
   ```

---

## Error Codes

| Status Code | Description                                           |
| ----------- | ----------------------------------------------------- |
| 200         | Success                                               |
| 201         | Created                                               |
| 400         | Bad Request (validation error)                        |
| 401         | Unauthorized (missing/invalid token)                  |
| 403         | Forbidden (no tenant associated or insufficient role) |
| 404         | Not Found (tenant or brand not found)                 |
| 413         | Payload Too Large (file exceeds 2MB)                  |

---

## Files Structure

```
src/tenant-brand/
├── dto/
│   ├── create-tenant-brand.dto.ts
│   ├── update-tenant-brand.dto.ts
│   └── index.ts
├── tenant-brand.controller.ts
├── tenant-brand.module.ts
└── tenant-brand.service.ts
```

---

## Migration

Migration file: `prisma/migrations/20251228112715_tenant_brand/migration.sql`

```sql
-- CreateTable
CREATE TABLE "TenantBrand" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "logoUrl" TEXT,
    "tagline" TEXT,
    "description" TEXT,
    "theme" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantBrand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TenantBrand_tenantId_key" ON "TenantBrand"("tenantId");

-- AddForeignKey
ALTER TABLE "TenantBrand" ADD CONSTRAINT "TenantBrand_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```
