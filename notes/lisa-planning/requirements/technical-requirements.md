# Lisa - Technical Requirements Document

**Version:** 1.0  
**Date:** 2026-03-07  
**Status:** Draft

---

## System Architecture Overview

### Architecture Style
- **Pattern:** Microservices with API Gateway
- **Deployment:** Cloud-native (AWS/GCP/Azure)
- **Frontend:** Single Page Application (SPA)
- **Mobile:** Native iOS and Android apps
- **API:** RESTful with GraphQL option

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │  Web App    │  │  iOS App    │  │ Android App │  │  3rd Party  │  │
│  │  (React)    │  │  (Swift)    │  │  (Kotlin)   │  │    APIs     │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API GATEWAY                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │    Auth     │  │ Rate Limit  │  │   Routing   │  │   Logging   │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MICROSERVICES                                  │
│                                                                     │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐  │
│  │   Users   │ │    CRM    │ │ Estimates │ │   Jobs    │ │  Billing  │  │
│  │  Service  │ │  Service  │ │  Service  │ │  Service  │ │  Service  │  │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘  │
│                                                                     │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐  │
│  │ Documents │ │ Reporting │ │Integration│ │Notification│ │    AI     │  │
│  │  Service  │ │  Service  │ │  Service  │ │  Service  │ │  Service  │  │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │ PostgreSQL  │  │    Redis    │  │     S3      │  │Elasticsearch│  │
│  │  (Primary)  │  │   (Cache)   │  │   (Files)   │  │  (Search)   │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Backend
| Component | Technology | Rationale |
|-----------|------------|------------|
| Language | Python 3.11+ | Rapid development, AI/ML ecosystem |
| Framework | FastAPI | Modern, async, auto-docs |
| ORM | SQLAlchemy 2.0 | Mature, flexible |
| Task Queue | Celery + Redis | Async job processing |
| API Docs | OpenAPI/Swagger | Auto-generated |

### Frontend (Web)
| Component | Technology | Rationale |
|-----------|------------|------------|
| Framework | React 18+ | Industry standard, ecosystem |
| State | Zustand/TanStack Query | Simple, performant |
| UI Library | Tailwind + shadcn/ui | Modern, customizable |
| Build | Vite | Fast builds |
| TypeScript | Yes | Type safety |

### Mobile
| Platform | Technology | Rationale |
|----------|------------|------------|
| iOS | Swift/SwiftUI | Native performance |
| Android | Kotlin/Compose | Native performance |
| Shared Logic | Kotlin Multiplatform | Code sharing |

### Database
| Type | Technology | Use Case |
|------|------------|----------|
| Primary | PostgreSQL 15+ | Relational data |
| Cache | Redis | Session, cache |
| Search | Elasticsearch | Full-text search |
| Time Series | TimescaleDB | Analytics |

### Infrastructure
| Component | Technology | Rationale |
|-----------|------------|------------|
| Cloud | AWS (primary) | Market leader |
| Containers | Docker + Kubernetes | Scalability |
| CI/CD | GitHub Actions | Integration |
| CDN | CloudFront | Static assets |
| DNS | Route 53 | Reliability |

### AI/ML
| Component | Technology | Use Case |
|-----------|------------|----------|
| LLM | OpenAI GPT-4 / Claude | Text generation |
| Vision | OpenAI Vision / Custom | Photo analysis |
| Embeddings | OpenAI / Cohere | Search, similarity |
| ML Ops | AWS SageMaker | Model hosting |

---

## Data Model Overview

### Core Entities

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  Organization │◄─────│     User      │     │     Team      │
└───────┬───────┘     └───────────────┘     └───────────────┘
        │
        ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│    Contact    │◄─────│    Property   │     │      Job      │
└───────┬───────┘     └───────┬───────┘     └───────┬───────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│   Estimate    │◄─────│  Measurement  │     │    Invoice    │
└───────┬───────┘     └───────────────┘     └───────┬───────┘
        │                                           │
        ▼                                           ▼
┌───────────────┐                           ┌───────────────┐
│   Proposal    │                           │    Payment    │
└───────────────┘                           └───────────────┘
```

### Key Tables

#### organizations
```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}',
    subscription_tier VARCHAR(50),
    subscription_status VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### contacts
```sql
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    type VARCHAR(50), -- customer, lead, vendor, subcontractor
    status VARCHAR(50),
    source VARCHAR(100),
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### properties
```sql
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    contact_id UUID REFERENCES contacts(id),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(50) DEFAULT 'US',
    property_type VARCHAR(50), -- residential, commercial
    coordinates POINT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### jobs
```sql
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    contact_id UUID REFERENCES contacts(id),
    property_id UUID REFERENCES properties(id),
    job_number VARCHAR(50),
    title VARCHAR(255),
    description TEXT,
    job_type VARCHAR(50), -- residential, commercial, insurance
    status VARCHAR(50),
    stage VARCHAR(100),
    priority VARCHAR(20),
    estimated_value DECIMAL(12,2),
    actual_value DECIMAL(12,2),
    scheduled_start DATE,
    scheduled_end DATE,
    actual_start DATE,
    actual_end DATE,
    assigned_to UUID[],
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### estimates
```sql
CREATE TABLE estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    job_id UUID REFERENCES jobs(id),
    estimate_number VARCHAR(50),
    version INTEGER DEFAULT 1,
    status VARCHAR(50),
    subtotal DECIMAL(12,2),
    tax DECIMAL(12,2),
    total DECIMAL(12,2),
    margin_percent DECIMAL(5,2),
    notes TEXT,
    valid_until DATE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### estimate_line_items
```sql
CREATE TABLE estimate_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estimate_id UUID REFERENCES estimates(id),
    line_number INTEGER,
    category VARCHAR(100),
    description TEXT,
    quantity DECIMAL(12,4),
    unit VARCHAR(50),
    unit_cost DECIMAL(12,4),
    markup_percent DECIMAL(5,2),
    total DECIMAL(12,2),
    is_optional BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'
);
```

---

## API Design

### REST API Conventions

```
Base URL: https://api.lisaroofing.com/v1

Resources:
  GET    /contacts           - List contacts
  POST   /contacts           - Create contact
  GET    /contacts/{id}      - Get contact
  PUT    /contacts/{id}      - Update contact
  DELETE /contacts/{id}      - Delete contact
  
  GET    /jobs               - List jobs
  POST   /jobs               - Create job
  GET    /jobs/{id}          - Get job
  PUT    /jobs/{id}          - Update job
  DELETE /jobs/{id}          - Delete job
  
  GET    /estimates          - List estimates
  POST   /estimates          - Create estimate
  GET    /estimates/{id}     - Get estimate
  PUT    /estimates/{id}     - Update estimate
  POST   /estimates/{id}/send - Send estimate
  
Filtering:
  GET /contacts?status=active&source=angi&created_after=2024-01-01
  
Pagination:
  GET /contacts?page=2&per_page=50
  
Sorting:
  GET /contacts?sort=-created_at,last_name
  
Includes:
  GET /jobs/{id}?include=contact,property,estimates
```

### Authentication

```
Authorization: Bearer <jwt_token>

JWT Claims:
{
  "sub": "user_id",
  "org": "organization_id",
  "roles": ["admin", "sales"],
  "exp": 1234567890
}
```

### Webhooks

```json
POST /webhooks
{
  "url": "https://example.com/webhook",
  "events": [
    "job.created",
    "job.updated",
    "estimate.signed",
    "payment.received"
  ],
  "secret": "webhook_secret"
}
```

---

## Security Requirements

### Authentication
- OAuth 2.0 / OpenID Connect
- JWT tokens with short expiry (15 min)
- Refresh tokens with rotation
- Multi-factor authentication (TOTP)
- SSO support (SAML, OIDC)

### Authorization
- Role-based access control (RBAC)
- Organization-level isolation
- Resource-level permissions
- API key management

### Data Protection
- Encryption at rest (AES-256)
- Encryption in transit (TLS 1.3)
- PII encryption with customer keys
- Data retention policies

### Compliance
- SOC 2 Type II
- GDPR compliance
- PCI DSS (for payments)
- Data residency options

---

## Performance Requirements

### Response Times
| Operation | Target | P99 |
|-----------|--------|-----|
| API Read | 100ms | 500ms |
| API Write | 200ms | 1s |
| Search | 200ms | 1s |
| Report Gen | 5s | 30s |
| File Upload | 2s/MB | 5s/MB |

### Throughput
- 10,000 concurrent users
- 1,000 requests/second
- 100 file uploads/minute

### Availability
- 99.9% uptime SLA
- < 4 hours planned maintenance/month
- < 1 hour unplanned downtime/month

---

## Integration Requirements

### Priority 1 Integrations (MVP)

#### QuickBooks Online
- **Type:** Two-way sync
- **Data:** Customers, invoices, payments
- **Auth:** OAuth 2.0
- **Frequency:** Real-time webhooks + daily sync

#### EagleView
- **Type:** Order + Import
- **Data:** Measurement reports
- **Auth:** API key
- **Flow:** Order from Lisa → Receive report → Auto-import

#### Stripe
- **Type:** Payment processing
- **Features:** Cards, ACH, invoicing
- **Auth:** API key
- **PCI:** SAQ-A compliance

### Priority 2 Integrations (6 months)

#### HOVER
- **Type:** Measurement integration
- **Data:** 3D models, measurements
- **Auth:** OAuth 2.0

#### CompanyCam
- **Type:** Photo sync
- **Data:** Photos, projects
- **Auth:** OAuth 2.0

#### Beacon PRO+
- **Type:** Material ordering
- **Data:** Pricing, orders
- **Auth:** API key

---

## Development Phases

### Phase 1: Foundation (Weeks 1-8)
- Core infrastructure setup
- Authentication system
- Organization/user management
- Basic CRM (contacts, properties)
- Database schema

### Phase 2: Core Features (Weeks 9-16)
- Job management
- Estimating engine
- Proposal generation
- Document storage
- Mobile app foundation

### Phase 3: Integrations (Weeks 17-24)
- QuickBooks integration
- EagleView integration
- Payment processing
- Email integration

### Phase 4: Advanced (Weeks 25-32)
- Reporting/analytics
- Automation engine
- AI features
- Additional integrations

---

## Testing Strategy

### Unit Tests
- Coverage target: 80%+
- Framework: pytest (Python), Jest (JS)
- Mocking: pytest-mock, MSW

### Integration Tests
- API contract testing
- Database integration tests
- Third-party API mocks

### E2E Tests
- Framework: Playwright
- Critical user flows
- Cross-browser testing

### Performance Tests
- Load testing: k6
- Stress testing
- Soak testing

---

## Monitoring & Observability

### Logging
- Structured JSON logs
- Centralized logging (ELK/CloudWatch)
- Log levels: DEBUG, INFO, WARN, ERROR
- Correlation IDs

### Metrics
- Application metrics (Prometheus)
- Business metrics (custom)
- Infrastructure metrics (CloudWatch)

### Tracing
- Distributed tracing (OpenTelemetry)
- Request tracing across services
- Performance profiling

### Alerting
- PagerDuty integration
- Slack notifications
- Escalation policies
