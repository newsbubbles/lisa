# Invoice API CRUD Tests

**Date**: 2026-03-09  
**Base URL**: http://localhost:3002/api/v1  
**Auth**: Bearer token from login

---

## Test Setup

### Authentication
```bash
curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"email": "test@example.com", "password": "testpass123"}' \
  http://localhost:3002/api/v1/auth/login
```
**Result**: ✅ Returns JWT token

---

## Test Results Summary

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| /invoices | GET | ✅ PASS | Returns array with job summary |
| /invoices | POST | ✅ PASS | Auto-generates invoice_number, calculates totals |
| /invoices/{id} | GET | ✅ PASS | Returns invoice with all relationships |
| /invoices/{id} | PATCH | ✅ PASS | Updates fields, recalculates totals |
| /invoices/{id} | DELETE | ✅ PASS | Returns 204 No Content |
| /invoices/{id}/payments | POST | ✅ PASS | Records payment, updates invoice status |
| /invoices/{id}/payments | GET | ✅ PASS | Returns array of payments |
| /invoices/{id}/send | POST | ✅ PASS | Sets status to 'sent', records sent_at |

---

## 1. LIST Invoices (GET /invoices)

```bash
curl -s -H 'Authorization: Bearer <TOKEN>' \
  http://localhost:3002/api/v1/invoices
```

**Result**: ✅ PASS
- Returns array of invoices
- Includes line_items, payments, and job summary
- Job summary includes customer_name, customer_email, property_address

---

## 2. CREATE Invoice (POST /invoices)

```bash
curl -s -X POST -H 'Authorization: Bearer <TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{
    "job_id": "9a2a6d99-8a76-4363-af94-a0099e1eac00",
    "invoice_date": "2026-03-09",
    "due_date": "2026-04-09",
    "tax_rate": 8.25,
    "notes": "Thank you for your business!",
    "terms": "Net 30",
    "line_items": [
      {"description": "Garage Roof Repair - Labor", "quantity": 8, "unit_price": 75.00},
      {"description": "Materials - Shingles and Flashing", "quantity": 1, "unit_price": 450.00}
    ]
  }' \
  http://localhost:3002/api/v1/invoices
```

**Result**: ✅ PASS
- Auto-generates invoice_number (INV-YYYY-XXXX)
- Auto-calculates subtotal, tax_amount, total, balance_due
- Creates line items with auto-calculated totals
- Status defaults to "draft"
- Returns full invoice with job summary

---

## 3. GET Invoice by ID (GET /invoices/{id})

```bash
curl -s -H 'Authorization: Bearer <TOKEN>' \
  http://localhost:3002/api/v1/invoices/9007c267-24ba-48e2-8b8d-0bc8161f392d
```

**Result**: ✅ PASS
- Returns full invoice details
- Includes line_items, payments, job summary

---

## 4. UPDATE Invoice (PATCH /invoices/{id})

```bash
curl -s -X PATCH -H 'Authorization: Bearer <TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{"notes": "Updated notes", "discount_amount": 50.00}' \
  http://localhost:3002/api/v1/invoices/9007c267-24ba-48e2-8b8d-0bc8161f392d
```

**Result**: ✅ PASS
- Updates specified fields only
- Recalculates totals (discount applied)
- Returns updated invoice with job summary

---

## 5. DELETE Invoice (DELETE /invoices/{id})

```bash
curl -s -X DELETE -H 'Authorization: Bearer <TOKEN>' \
  http://localhost:3002/api/v1/invoices/a8fa0e31-c44d-468d-9dc5-bc7d604ec227
```

**Result**: ✅ PASS
- Returns HTTP 204 No Content
- Invoice is actually deleted (subsequent GET returns 404)

---

## 6. Record Payment (POST /invoices/{id}/payments)

```bash
curl -s -X POST -H 'Authorization: Bearer <TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{
    "amount": 500.00,
    "payment_method": "card",
    "reference_number": "CHK-12345",
    "notes": "First partial payment"
  }' \
  http://localhost:3002/api/v1/invoices/9007c267-24ba-48e2-8b8d-0bc8161f392d/payments
```

**Result**: ✅ PASS
- Creates payment record
- Updates invoice amount_paid and balance_due
- Changes invoice status to "partial" for partial payments
- Changes invoice status to "paid" when fully paid

---

## 7. List Payments (GET /invoices/{id}/payments)

```bash
curl -s -H 'Authorization: Bearer <TOKEN>' \
  http://localhost:3002/api/v1/invoices/9007c267-24ba-48e2-8b8d-0bc8161f392d/payments
```

**Result**: ✅ PASS
- Returns array of payments for the invoice

---

## 8. Send Invoice (POST /invoices/{id}/send)

```bash
curl -s -X POST -H 'Authorization: Bearer <TOKEN>' \
  http://localhost:3002/api/v1/invoices/9007c267-24ba-48e2-8b8d-0bc8161f392d/send
```

**Result**: ✅ PASS
- Sets status to "sent"
- Records sent_at timestamp
- Returns updated invoice

---

## Bugs Found & Fixed

### Bug 1: Job.property → Job.job_property
**File**: `backend/app/api/v1/endpoints/invoices.py`  
**Issue**: Code referenced `Job.property` but the relationship was renamed to `Job.job_property`  
**Fix**: Changed all occurrences of `Job.property` to `Job.job_property` (4 occurrences)

### Bug 2: Property.street → Property.address_line1
**File**: `backend/app/api/v1/endpoints/invoices.py`  
**Issue**: `build_job_summary()` used `job.job_property.street` but Property model uses `address_line1`  
**Fix**: Changed to `job.job_property.address_line1` and `zip_code`

### Bug 3: ResponseValidationError on update/send/create
**File**: `backend/app/api/v1/endpoints/invoices.py`  
**Issue**: Endpoints returned `invoice` directly without loading job relationship, causing Pydantic validation to fail  
**Fix**: Added explicit response dict building with job summary for all endpoints that return InvoiceResponse

### Bug 4: MissingGreenlet error on create
**File**: `backend/app/api/v1/endpoints/invoices.py`  
**Issue**: After `db.refresh(invoice)`, lazy loading of `invoice.job` failed in async context  
**Fix**: Replaced `db.refresh()` with a fresh query that includes all eager-loaded relationships

---

## Test Data Created

**Invoice INV-2026-E0CB** (for job "Garage Roof Repair"):
- Subtotal: $1,050.00
- Tax (8.25%): $86.63
- Discount: $50.00
- Total: $1,086.63
- Amount Paid: $500.00 (partial payment)
- Balance Due: $586.63
- Status: sent
- Customer: David Johnson (djohnson@email.com)
- Property: 555 Cedar Lane, Westminster, CO, 80030
