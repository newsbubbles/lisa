# Stakeholder Answers - Lisa Gibson

**Date**: 2026-03-08  
**Source**: Text conversation with Lisa Gibson (roofing company manager)

---

## Payment Terms (Question 1)

**Answer**: Multiple options needed, not just Net 30.

### Payment Terms from AccuLynx (from screenshot):
- 1% 10 Net 30
- 1% 10th Net 25th *(Lisa says: "We don't need net 25th anymore")*
- 1% 10th Net EOM
- 2% 10th Net 30
- 2% 10th Net EOM
- Consignment
- Due on receipt

### Implementation Note:
- Should be a **configurable list** (not hardcoded)
- Default to "Due on receipt" or "Net 30"
- Allow org-level customization
- Future: Let orgs add custom payment terms

---

## Online Payments (Question 4)

**Answer**: "Online payments usually go through QuickBooks Online - almost every transaction goes through there, both AP and AR. No Stripe."

### Implementation Note:
- **No Stripe integration for MVP**
- QuickBooks Online is the payment hub
- Lisa's invoices will sync to QBO, payments recorded there
- Lisa app just records payments (cash, check, card, etc.) manually
- Future: QBO payment status sync

### Banking Note:
"Both Capital One and Bank of America feed through QBO - sometimes slowly"
- This is org-specific (their bank accounts)
- Not relevant to Lisa app directly
- Just means QBO is the source of truth

---

## PDF Generation (Question 5)

**Answer**: "Almost all docs are received as PDFs and all docs we create and store with AccuLynx are PDFs"

### Implementation Note:
- **PDF export is essential**
- Invoices, estimates, proposals all need PDF export
- Documents stored in system should be PDFs
- Priority: HIGH

---

## New Job Form Required Fields (Question 5 - original)

**From Job Model Analysis:**

Only truly required fields in database:
- `title` (NOT NULL)
- `job_number` (auto-generated)
- `organization_id` (from auth)

Everything else is nullable:
- `description` - nullable
- `contact_id` - nullable
- `property_id` - nullable
- `job_type` - has default (full_replacement)
- `status` - has default (lead)
- `stage_id` - nullable (auto-assigns)
- `assigned_to_id` - nullable
- `scheduled_date` - nullable
- `estimated_value` - default 0.0
- All insurance fields - nullable
- `crew_name` - nullable
- `tags` - nullable
- `custom_fields` - nullable

### Implementation Note:
- Form only requires **Title**
- All other fields optional
- Consider "quick add" with just title
- Full form for detailed entry

---

## Email Verification (Question 6)

**Answer**: "We can skip for the demo"

### Implementation Note:
- Skip email verification for MVP/demo
- Take notes for future implementation
- See: [auth-email/deferred-email-verification.md](auth-email/deferred-email-verification.md)

---

## SendGrid API Key (Question 7)

**Answer**: "We don't have an API key yet, we will get that after we get this demo working so like when we're ready to launch"

### Implementation Note:
- **Defer all SendGrid functionality**
- No password reset emails for demo
- No welcome emails for demo
- Document what needs to be done for launch
- See: [auth-email/deferred-sendgrid.md](auth-email/deferred-sendgrid.md)

---

## Reports (Question 8)

**Answer**: "What are the reports that places like AccuLynx have?"

### From PRD and Competitor Research:

#### Sales Analytics
- Pipeline Reports - Stage analysis, velocity
- Lead Source ROI - Marketing effectiveness
- Sales Rep Performance - Individual metrics
- Close Rate Analysis - Win/loss tracking
- Revenue Forecasting - Predictive analytics

#### Production Analytics
- Job Profitability - Margin analysis
- Crew Productivity - Performance metrics
- Material Usage - Waste analysis
- Schedule Adherence - On-time completion
- Quality Metrics - Issue frequency

#### Financial Analytics
- Revenue Trends - Historical analysis
- Cash Flow - Payment timing
- Profitability by Type - Job type analysis
- Expense Tracking - Cost analysis
- Accounts Receivable - Aging reports
- Commission Tracking - Sales rep commissions
- Tax Reports - Sales tax summaries

#### Custom Dashboards
- Drag-and-Drop Builder
- Widget Library
- Real-Time Data
- Role-Based Views
- Export/Share (PDF, email)

### MVP Recommendation:
1. **Revenue Report** - Total revenue, by period, by job type
2. **Pipeline Report** - Jobs by stage, conversion rates
3. **AR Aging Report** - Outstanding invoices by age
4. **Jobs Summary** - Completed, in progress, by status

---

## Export Formats (Question 9)

**Answer**: "Yeah, definitely" (both PDF and CSV)

### Implementation Note:
- PDF export for visual reports
- CSV export for data analysis
- Both are required

---

## Calendar (Question 10)

**Answer**: "Not sure on this one... Maybe we just need to be able to interact with Google Calendar API?... not with OAuth, but like... Maybe we just stay open on this and make it so that we can import data from Google Calendar and export events to Google Calendar format or something? Not sure for demo/MVP yet, will have to ask best use case for this."

### Implementation Note:
- **Defer calendar for MVP**
- Keep placeholder
- Future options:
  - Import from Google Calendar
  - Export to Google Calendar format (iCal/ICS)
  - Embed Google Calendar? (needs OAuth)
  - Build native calendar with GCal sync
- Need more stakeholder input on use case

---

## HR/Timesheets Note (Unsolicited)

**Lisa said**: "HR and timesheets also go through QBO but it's not pretty and needs to be adjusted every time we have to do commissions especially with Pablo's time because out of the 3 techs he is the project manager and salaried."

### Implementation Note:
- Time tracking is a pain point
- Commission calculation is manual/painful
- Salaried vs hourly distinction matters
- **Future opportunity**: Better time/commission tracking
- Not for MVP

---

## Summary of Decisions

| Topic | Decision |
|-------|----------|
| Payment Terms | Configurable list, not hardcoded |
| Online Payments | No Stripe, record payments manually, QBO is source of truth |
| PDF Export | Required - HIGH priority |
| Job Form Required | Only title required |
| Email Verification | Skip for demo |
| SendGrid | Defer until launch |
| Reports | MVP: Revenue, Pipeline, AR Aging, Jobs Summary |
| Export Formats | Both PDF and CSV |
| Calendar | Defer for MVP, need more input |
