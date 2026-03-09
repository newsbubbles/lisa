# Reports Module - Deeper Investigation

**Date**: 2026-03-07  
**Status**: Investigation Complete  
**Priority**: LOW (No Backend, Needs Planning)

---

## Executive Summary

Reports is a **placeholder** with no backend support. This needs full planning - what reports, what data, what formats.

---

## What Competitors Have

From PRD (`notes/lisa-planning/requirements/product-requirements.md`):

### Sales Analytics
- Pipeline Reports - Stage analysis, velocity
- Lead Source ROI - Marketing effectiveness
- Sales Rep Performance - Individual metrics
- Close Rate Analysis - Win/loss tracking
- Revenue Forecasting - Predictive analytics

### Production Analytics
- Job Profitability - Margin analysis
- Crew Productivity - Performance metrics
- Material Usage - Waste analysis
- Schedule Adherence - On-time completion
- Quality Metrics - Issue frequency

### Financial Analytics
- Revenue Trends - Historical analysis
- Cash Flow - Payment timing
- Profitability by Type - Job type analysis
- Expense Tracking - Cost analysis

### Custom Dashboards
- Drag-and-Drop Builder
- Widget Library
- Real-Time Data
- Role-Based Views
- Export/Share (PDF, email)

---

## MVP Report Recommendations

For MVP, focus on **essential business reports** that can be built from existing data:

### Tier 1: Must Have (MVP)

#### 1. Revenue Report
**Data Source**: Invoices, Jobs
**Metrics**:
- Total revenue (paid invoices)
- Revenue by period (month, quarter, year)
- Revenue by job type
- Average job value
- Outstanding receivables (unpaid invoices)

#### 2. Pipeline Report
**Data Source**: Jobs
**Metrics**:
- Jobs by stage (counts and values)
- Pipeline velocity (avg days per stage)
- Conversion rates (stage to stage)
- Total pipeline value

#### 3. Jobs Summary
**Data Source**: Jobs
**Metrics**:
- Jobs created this period
- Jobs completed this period
- Jobs by status
- Jobs by type
- Avg time to completion

#### 4. Accounts Receivable Aging
**Data Source**: Invoices
**Metrics**:
- Current (0-30 days)
- 31-60 days
- 61-90 days
- 90+ days
- Total outstanding

### Tier 2: Nice to Have

#### 5. Sales Rep Performance
**Data Source**: Jobs (assigned_to)
**Metrics**:
- Jobs per rep
- Revenue per rep
- Close rate per rep
- Avg job value per rep

#### 6. Customer Report
**Data Source**: Contacts, Jobs
**Metrics**:
- New customers this period
- Repeat customers
- Customer lifetime value
- Top customers by revenue

#### 7. Profitability Report
**Data Source**: Jobs (estimated_value, actual_value, cost)
**Metrics**:
- Gross margin per job
- Margin by job type
- Estimated vs actual comparison
- Most/least profitable jobs

### Tier 3: Future

- Lead Source Analysis (needs lead source tracking)
- Crew Productivity (needs time tracking)
- Material Usage (needs inventory)
- Forecasting (needs ML/AI)

---

## Backend Requirements

Reports need **aggregation endpoints**. Options:

### Option A: Dedicated Reports API
```python
# backend/app/api/v1/endpoints/reports.py

@router.get("/revenue")
async def revenue_report(
    start_date: date,
    end_date: date,
    group_by: str = "month",  # day, week, month, quarter, year
):
    # Aggregate invoice data
    ...

@router.get("/pipeline")
async def pipeline_report():
    # Jobs by stage with values
    ...

@router.get("/ar-aging")
async def ar_aging_report():
    # Invoices grouped by age
    ...
```

### Option B: Frontend Aggregation
Fetch raw data (jobs, invoices) and aggregate in frontend.
- Simpler backend
- More flexible
- But: Performance issues with large datasets

**Recommendation**: Option A (dedicated endpoints) for production-ready reports.

---

## PDF Export

User mentioned PDF export. Options:

### Option 1: Frontend PDF Generation
- Use library like `jspdf` or `react-pdf`
- Generate PDF from rendered HTML
- Works for simple reports
- No backend changes needed

### Option 2: Backend PDF Generation
- Use `weasyprint` or `reportlab` in Python
- More control over formatting
- Better for complex layouts
- Endpoint returns PDF file

### Option 3: Third-Party Service
- Use service like `PDFShift` or `DocRaptor`
- Send HTML, get PDF
- Easy but adds dependency/cost

**Recommendation**: Start with Option 1 (frontend) for MVP, upgrade to Option 2 if needed.

---

## Frontend Implementation

### Reports Page Structure

```
/reports
├── Report Selector (dropdown or tabs)
├── Date Range Picker
├── Filters (job type, rep, etc.)
├── Report Display
│   ├── Summary Cards (key metrics)
│   ├── Charts (bar, line, pie)
│   └── Data Table (detailed breakdown)
└── Export Button (PDF, CSV)
```

### Components Needed

- `ReportSelector.tsx` - Choose report type
- `DateRangePicker.tsx` - Select period
- `ReportFilters.tsx` - Additional filters
- `ReportSummary.tsx` - Key metric cards
- `ReportChart.tsx` - Visualizations
- `ReportTable.tsx` - Data table
- `ExportButton.tsx` - PDF/CSV export

### Chart Library

Options:
- **Recharts** - React-native, good for basic charts
- **Chart.js + react-chartjs-2** - Popular, flexible
- **Nivo** - Beautiful, React-native
- **Victory** - Airbnb's charting library

**Recommendation**: Recharts (simple, React-native, good docs)

---

## Questions for Stakeholder

1. **Which reports are essential for MVP?**
   - Revenue?
   - Pipeline?
   - AR Aging?
   - Others?

2. **What date ranges should be supported?**
   - This week/month/quarter/year?
   - Custom date range?
   - Comparison (this month vs last month)?

3. **What export formats?**
   - PDF?
   - CSV/Excel?
   - Both?

4. **Who can access reports?**
   - All users?
   - Managers and above?
   - Admin only?

5. **Real-time or cached?**
   - Should reports be live data?
   - Or is daily refresh acceptable?

6. **Custom reports?**
   - Should users be able to create custom reports?
   - Or just pre-built reports?

---

## Effort Estimate

### MVP Reports (4 reports)

| Component | Effort |
|-----------|--------|
| Backend endpoints | 2 days |
| Report types/store | 1 day |
| ReportsPage UI | 1 day |
| Charts integration | 1 day |
| Individual reports (4 × 0.5) | 2 days |
| PDF export | 1 day |
| CSV export | 0.5 day |
| **Total** | **~8.5 days** |

### Full Reports Module

Add 1-2 days per additional report type.

---

## Confidence Level: LOW

No backend exists. Need stakeholder input on:
- Which reports matter most
- Export requirements
- Access control
- Real-time vs cached
