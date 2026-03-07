# Lisa - Wireframes & UI Mockups

**Version:** 1.0  
**Date:** 2026-03-07  
**Status:** Design Specification  
**Author:** DevMate  
**References:**
- [Interface UX Analysis](../../acculynx-research/interface-ux-analysis.md)
- [Product Requirements](../requirements/product-requirements.md)

---

## Design System Overview

### Brand Colors

```
Primary:     #2563EB (Blue 600)      - Primary actions, links
Secondary:   #0F172A (Slate 900)     - Text, headers
Accent:      #10B981 (Emerald 500)   - Success, positive actions
Warning:     #F59E0B (Amber 500)     - Warnings, attention
Danger:      #EF4444 (Red 500)       - Errors, destructive actions
Background:  #F8FAFC (Slate 50)      - Page background
Surface:     #FFFFFF (White)         - Cards, panels
Border:      #E2E8F0 (Slate 200)     - Borders, dividers
```

### Typography

```
Font Family: Inter (Primary), System UI (Fallback)

Headings:
  H1: 32px / 40px line-height / 700 weight
  H2: 24px / 32px line-height / 600 weight
  H3: 20px / 28px line-height / 600 weight
  H4: 16px / 24px line-height / 600 weight

Body:
  Large:  16px / 24px line-height / 400 weight
  Normal: 14px / 20px line-height / 400 weight
  Small:  12px / 16px line-height / 400 weight

Labels:
  Default: 12px / 16px / 500 weight / uppercase
```

### Spacing Scale

```
Base unit: 4px

xs:  4px   (1 unit)
sm:  8px   (2 units)
md:  16px  (4 units)
lg:  24px  (6 units)
xl:  32px  (8 units)
2xl: 48px  (12 units)
3xl: 64px  (16 units)
```

### Border Radius

```
sm:   4px   - Buttons, inputs
md:   8px   - Cards, panels
lg:   12px  - Modals, large cards
full: 9999px - Pills, avatars
```

### Shadows

```
sm:   0 1px 2px rgba(0,0,0,0.05)
md:   0 4px 6px rgba(0,0,0,0.07)
lg:   0 10px 15px rgba(0,0,0,0.10)
xl:   0 20px 25px rgba(0,0,0,0.15)
```

---

## Component Library

### Buttons

```
┌─────────────────────────────────────────────────────────────────┐
│  BUTTON VARIANTS                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  Primary (filled)                            │
│  │  + New Job   │  bg: #2563EB, text: white                    │
│  └──────────────┘  hover: #1D4ED8                              │
│                                                                 │
│  ┌──────────────┐  Secondary (outline)                         │
│  │   Export     │  border: #2563EB, text: #2563EB              │
│  └──────────────┘  hover: bg #EFF6FF                           │
│                                                                 │
│  ┌──────────────┐  Ghost (text only)                           │
│  │   Cancel     │  text: #64748B                               │
│  └──────────────┘  hover: bg #F1F5F9                           │
│                                                                 │
│  ┌──────────────┐  Danger                                      │
│  │   Delete     │  bg: #EF4444, text: white                    │
│  └──────────────┘  hover: #DC2626                              │
│                                                                 │
│  ┌──────────────┐  Success                                     │
│  │  ✓ Approve   │  bg: #10B981, text: white                    │
│  └──────────────┘  hover: #059669                              │
│                                                                 │
│  Sizes: sm (32px), md (40px), lg (48px)                        │
│  Icons: Left icon, right icon, or icon-only                    │
└─────────────────────────────────────────────────────────────────┘
```

### Input Fields

```
┌─────────────────────────────────────────────────────────────────┐
│  INPUT STATES                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Customer Name                    ← Label (12px, 500, slate-600)│
│  ┌─────────────────────────────┐                               │
│  │ John Smith              │   │  ← Default state              │
│  └─────────────────────────────┘    border: #E2E8F0            │
│                                                                 │
│  Email Address                                                  │
│  ┌─────────────────────────────┐                               │
│  │ john@example.com        │   │  ← Focus state                │
│  └─────────────────────────────┘    border: #2563EB, ring      │
│                                                                 │
│  Phone Number                                                   │
│  ┌─────────────────────────────┐                               │
│  │ Invalid phone format    │ ⚠ │  ← Error state                │
│  └─────────────────────────────┘    border: #EF4444            │
│  Please enter a valid phone number  ← Error message            │
│                                                                 │
│  Address                           [📋] [📍] ← Action icons     │
│  ┌─────────────────────────────┐                               │
│  │ 123 Main St, Denver, CO │ ✏ │  ← With inline edit          │
│  └─────────────────────────────┘                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Cards

```
┌─────────────────────────────────────────────────────────────────┐
│  CARD VARIANTS                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────┐  Standard Card           │
│  │                                   │  bg: white               │
│  │   Card Title                      │  border: #E2E8F0         │
│  │   Card content goes here...       │  radius: 8px             │
│  │                                   │  shadow: sm              │
│  │   [Action]                        │                          │
│  └───────────────────────────────────┘                          │
│                                                                 │
│  ┌───────────────────────────────────┐  Interactive Card        │
│  │ ○                           •••   │  (hover: shadow-md)      │
│  │   Johnson Residence               │  (click: open drawer)    │
│  │   🏠 123 Oak Street               │                          │
│  │   ┌────────┐ 14 days              │  ← Status badge          │
│  │   │APPROVED│ in stage             │    + duration            │
│  │   └────────┘                      │                          │
│  │   $12,500      Due: Mar 15        │                          │
│  └───────────────────────────────────┘                          │
│                                                                 │
│  ┌───────────────────────────────────┐  Stat Card               │
│  │   📈                              │  (dashboard metrics)     │
│  │   $125,000                        │                          │
│  │   Revenue This Month              │                          │
│  │   ▲ 12% vs last month             │                          │
│  └───────────────────────────────────┘                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Status Badges

```
┌─────────────────────────────────────────────────────────────────┐
│  STATUS BADGES (Pipeline Stages)                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────┐  Lead        bg: #DBEAFE  text: #1E40AF              │
│  │ LEAD │                                                       │
│  └──────┘                                                       │
│                                                                 │
│  ┌──────────┐  Prospect   bg: #FEF3C7  text: #92400E           │
│  │ PROSPECT │                                                   │
│  └──────────┘                                                   │
│                                                                 │
│  ┌──────────┐  Approved   bg: #D1FAE5  text: #065F46           │
│  │ APPROVED │                                                   │
│  └──────────┘                                                   │
│                                                                 │
│  ┌───────────┐  Scheduled  bg: #E0E7FF  text: #3730A3          │
│  │ SCHEDULED │                                                  │
│  └───────────┘                                                  │
│                                                                 │
│  ┌─────────────┐  In Progress  bg: #FEE2E2  text: #991B1B      │
│  │ IN PROGRESS │                                                │
│  └─────────────┘                                                │
│                                                                 │
│  ┌───────────┐  Completed  bg: #DCFCE7  text: #166534          │
│  │ COMPLETED │                                                  │
│  └───────────┘                                                  │
│                                                                 │
│  ┌──────────┐  Invoiced   bg: #F3E8FF  text: #6B21A8           │
│  │ INVOICED │                                                   │
│  └──────────┘                                                   │
│                                                                 │
│  ┌──────┐  Paid        bg: #10B981  text: #FFFFFF              │
│  │ PAID │                                                       │
│  └──────┘                                                       │
│                                                                 │
│  Duration indicator: "14 days" in muted text next to badge     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Screen Wireframes

### 1. Global Navigation (Desktop)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  ┌──────┐                                                                       │
│  │ LISA │  Dashboard   Jobs   Estimates   Calendar   Contacts   Reports   ⚙️ 👤 │
│  └──────┘                                                                       │
│  ═══════════════════════════════════════════════════════════════════════════════│
│                                                                                 │
│                              [Page Content Area]                                │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

Navigation Details:
• Logo: Left-aligned, links to Dashboard
• Main Nav: Horizontal tabs, active state has blue underline
• Right Side: Settings (gear), User profile (avatar dropdown)
• Sticky header on scroll
• Height: 64px
```

### 2. Global Navigation (Mobile)

```
┌───────────────────────────┐
│  ☰  LISA           🔔 👤  │  ← Header (56px)
├───────────────────────────┤
│                           │
│    [Page Content Area]    │
│                           │
│                           │
│                           │
│                           │
│                           │
├───────────────────────────┤
│  🏠    📋    ➕    📅    👥 │  ← Bottom nav (64px)
│ Home  Jobs  New  Cal  More│
└───────────────────────────┘

Bottom Navigation:
• 5 main actions
• Center "New" button is primary (blue, raised)
• Active state: filled icon + blue color
• Inactive: outline icon + gray
```

---

### 3. Dashboard Screen

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  ┌──────┐                                                                       │
│  │ LISA │  Dashboard   Jobs   Estimates   Calendar   Contacts   Reports   ⚙️ 👤 │
│  └──────┘       ▔▔▔▔▔▔▔▔▔                                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Good morning, Mike! 👋                                     March 7, 2026       │
│                                                                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │ 📊              │ │ 💰              │ │ 📋              │ │ ✅              ││
│  │ $125,000        │ │ $45,000         │ │ 12              │ │ 8               ││
│  │ Revenue MTD     │ │ Pipeline Value  │ │ Active Jobs     │ │ Due This Week   ││
│  │ ▲ 12% vs last   │ │ 5 proposals out │ │ 3 need action   │ │ 2 overdue       ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘│
│                                                                                 │
│  ┌─────────────────────────────────────────┐ ┌─────────────────────────────────┐│
│  │ Today's Schedule                    📅  │ │ Recent Activity              🔄 ││
│  │ ─────────────────────────────────────── │ │ ─────────────────────────────── ││
│  │ 9:00 AM  Johnson - Roof Inspection      │ │ • Estimate sent - Williams     ││
│  │          📍 123 Oak St  [Get Directions]│ │   2 minutes ago                ││
│  │ ─────────────────────────────────────── │ │ ─────────────────────────────── ││
│  │ 11:00 AM Martinez - Estimate Appt       │ │ • Payment received - $5,200    ││
│  │          📍 456 Pine Ave [Get Directions│ │   Johnson Residence            ││
│  │ ─────────────────────────────────────── │ │   15 minutes ago               ││
│  │ 2:00 PM  Wilson - Job Start             │ │ ─────────────────────────────── ││
│  │          📍 789 Elm Blvd [Get Directions]│ │ • New lead from website        ││
│  │                                         │ │   Thompson - needs callback    ││
│  │ [+ Add Appointment]                     │ │   1 hour ago                   ││
│  └─────────────────────────────────────────┘ └─────────────────────────────────┘│
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────────┤
│  │ Pipeline Overview                                                    [View All]│
│  │                                                                              ││
│  │   Lead (4)      Prospect (6)    Approved (3)    Scheduled (2)    In Progress││
│  │   $32,000       $78,000         $45,000         $28,000           $52,000   ││
│  │   ████          ██████████      █████           ████              ██████    ││
│  │                                                                              ││
│  └──────────────────────────────────────────────────────────────────────────────┘│
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

### 4. Jobs Board (Kanban View) - WITH DETAILS DRAWER

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  ┌──────┐                                                                       │
│  │ LISA │  Dashboard   Jobs   Estimates   Calendar   Contacts   Reports   ⚙️ 👤 │
│  └──────┘              ▔▔▔▔                                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Jobs                                          🔍 Search    [+ New Job]         │
│  [Board View]  [List View]  [Calendar]         Filter ▾    Sort ▾              │
│                                                                                 │
├───────────────────────────────────────────────────────┬─────────────────────────┤
│                                                       │                         │
│ ┌─────────────┐┌─────────────┐┌─────────────┐┌────────│  ✕  Johnson Residence   │
│ │    LEAD     ││  PROSPECT   ││  APPROVED   ││ SCHEDU │  ───────────────────── │
│ │     (4)     ││     (6)     ││     (3)     ││  (2)   │                         │
│ │ ─────────── ││ ─────────── ││ ─────────── ││ ────── │  ┌────────┐  14 days    │
│ │┌───────────┐││┌───────────┐││┌───────────┐││┌──────┐│  │APPROVED│  in stage   │
│ ││ Thompson  │││├───────────┤│││ ●SELECTED │││├──────┤│  └────────┘             │
│ ││ 📍 123 Oak│││││ Williams ││││ Johnson   │││├──────┤│                         │
│ ││ $8,500    │││││ 📍456 Pine│││ 📍789 Elm │││├──────┤│  📍 789 Elm Boulevard   │
│ │└───────────┘│││└───────────┘││└───────────┘││└──────┘│     Denver, CO 80202   │
│ │┌───────────┐│││             ││             ││       │  [📋 Copy] [📍 Directions]│
│ ││ Garcia    ││││             ││             ││       │  [✏️ Edit]              │
│ ││ 📍 555 Ash│││             ││             ││       │                         │
│ ││ $12,000   │││             ││             ││       │  ─────────────────────  │
│ │└───────────┘│││             ││             ││       │                         │
│ │             ││             ││             ││       │  👤 John Johnson         │
│ │             ││             ││             ││       │  📞 (303) 555-1234       │
│ │             ││             ││             ││       │  ✉️  john@email.com      │
│ │             ││             ││             ││       │                         │
│ │             ││             ││             ││       │  ─────────────────────  │
│ │             ││             ││             ││       │                         │
│ │             ││             ││             ││       │  💰 Job Value            │
│ │             ││             ││             ││       │  $12,500                │
│ │             ││             ││             ││       │  Margin: 42% ($5,250)   │
│ │             ││             ││             ││       │                         │
│ │             ││             ││             ││       │  ─────────────────────  │
│ │             ││             ││             ││       │                         │
│ │             ││             ││             ││       │  📋 Quick Actions        │
│ │             ││             ││             ││       │  ┌───────────────────┐  │
│ │             ││             ││             ││       │  │ 📝 Add Note       │  │
│ │             ││             ││             ││       │  │ 📧 Send Email     │  │
│ │             ││             ││             ││       │  │ 💬 Send Text      │  │
│ │             ││             ││             ││       │  │ ✅ Add Task       │  │
│ │             ││             ││             ││       │  │ 📄 View Estimate  │  │
│ │             ││             ││             ││       │  │ 📑 Documents      │  │
│ │             ││             ││             ││       │  └───────────────────┘  │
│ │             ││             ││             ││       │                         │
│ │             ││             ││             ││       │  ─────────────────────  │
│ │             ││             ││             ││       │                         │
│ │             ││             ││             ││       │  📜 Activity Timeline   │
│ │             ││             ││             ││       │  • Estimate approved    │
│ │             ││             ││             ││       │    Mar 5, 2:30 PM       │
│ │             ││             ││             ││       │  • Proposal sent        │
│ │             ││             ││             ││       │    Mar 3, 10:15 AM      │
│ │             ││             ││             ││       │  • Inspection completed │
│ │             ││             ││             ││       │    Mar 1, 9:00 AM       │
│ │             ││             ││             ││       │                         │
│ └─────────────┘└─────────────┘└─────────────┘└───────│  ┌───────────────────┐  │
│                                                       │  │ Move to Scheduled │  │
│  Drag cards to move between stages                    │  └───────────────────┘  │
│                                                       │  [Open Full Details]    │
└───────────────────────────────────────────────────────┴─────────────────────────┘

KEY UX FEATURES:
✓ Details Drawer - Opens on card click WITHOUT leaving the board
✓ Status + Duration - "14 days in stage" visible at top
✓ Quick Actions - All common actions accessible in drawer
✓ Address Actions - Copy, Directions, Edit buttons
✓ Real-time Margin - Shows profit margin prominently
✓ Activity Timeline - Recent history without navigating
✓ Drag-and-drop - Move cards between columns
```

---

### 5. Jobs Board (Mobile)

```
┌───────────────────────────┐
│  ☰  Jobs            🔍 ➕ │
├───────────────────────────┤
│                           │
│  [Board ▾]  Filter  Sort  │
│                           │
│  ◀ LEAD (4)  $32,000  ▶   │  ← Swipe to change columns
│  ─────────────────────────│
│  ┌───────────────────────┐│
│  │ Thompson              ││
│  │ 📍 123 Oak Street     ││
│  │ ┌────┐                ││
│  │ │LEAD│ 3 days         ││
│  │ └────┘                ││
│  │ $8,500                ││
│  └───────────────────────┘│
│  ┌───────────────────────┐│
│  │ Garcia                ││
│  │ 📍 555 Ash Avenue     ││
│  │ ┌────┐                ││
│  │ │LEAD│ 1 day          ││
│  │ └────┘                ││
│  │ $12,000               ││
│  └───────────────────────┘│
│  ┌───────────────────────┐│
│  │ Martinez              ││
│  │ 📍 789 Pine Road      ││
│  │ ┌────┐                ││
│  │ │LEAD│ 5 days         ││
│  │ └────┘                ││
│  │ $6,200                ││
│  └───────────────────────┘│
│                           │
├───────────────────────────┤
│  🏠    📋    ➕    📅    👥 │
│ Home  Jobs  New  Cal  More│
└───────────────────────────┘

Tap card → Full screen drawer slides up
```

---

### 6. Job Details Drawer (Mobile - Full Screen)

```
┌───────────────────────────┐
│  ✕  Johnson Residence     │
├───────────────────────────┤
│                           │
│  ┌────────┐  14 days      │
│  │APPROVED│  in stage     │
│  └────────┘               │
│                           │
│  📍 789 Elm Boulevard     │
│     Denver, CO 80202      │
│  ┌─────┐ ┌─────┐ ┌─────┐  │
│  │ 📋  │ │ 📍  │ │ ✏️  │  │
│  │Copy │ │ Nav │ │Edit │  │
│  └─────┘ └─────┘ └─────┘  │
│                           │
│  ─────────────────────────│
│                           │
│  👤 John Johnson          │
│  ┌─────┐ ┌─────┐ ┌─────┐  │
│  │ 📞  │ │ ✉️  │ │ 💬  │  │
│  │Call │ │Email│ │Text │  │
│  └─────┘ └─────┘ └─────┘  │
│                           │
│  ─────────────────────────│
│                           │
│  💰 $12,500               │
│  Margin: 42% ($5,250)     │
│  ████████████░░░░ 42%     │
│                           │
│  ─────────────────────────│
│                           │
│  📋 Quick Actions         │
│  ┌───────────────────────┐│
│  │ 📝 Add Note           ││
│  │ 📄 View Estimate      ││
│  │ 📑 Documents (3)      ││
│  │ 📸 Photos (12)        ││
│  │ ✅ Tasks (2 pending)  ││
│  └───────────────────────┘│
│                           │
│  ─────────────────────────│
│                           │
│  📜 Recent Activity       │
│  • Estimate approved      │
│    Mar 5, 2:30 PM         │
│  • Proposal sent          │
│    Mar 3, 10:15 AM        │
│                           │
│  ┌───────────────────────┐│
│  │   Move to Scheduled   ││
│  └───────────────────────┘│
│                           │
└───────────────────────────┘

KEY MOBILE UX:
✓ Full-screen drawer (not cramped side panel)
✓ Large tap targets for actions
✓ One-tap call/text/email
✓ One-tap navigation
✓ All features accessible (full parity)
```

---

### 7. Estimate Builder (Desktop)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  ┌──────┐                                                                       │
│  │ LISA │  Dashboard   Jobs   Estimates   Calendar   Contacts   Reports   ⚙️ 👤 │
│  └──────┘                      ▔▔▔▔▔▔▔▔▔                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  New Estimate - Johnson Residence                    [Save Draft] [Send Proposal]│
│  789 Elm Boulevard, Denver, CO                                                  │
│                                                                                 │
├─────────────────────────────────────────────────────┬───────────────────────────┤
│                                                     │                           │
│  📐 Measurements                           [Import] │  💰 Estimate Summary      │
│  ───────────────────────────────────────────────── │  ─────────────────────────│
│  Roof Area: 2,400 sq ft    Pitch: 6/12             │                           │
│  Waste Factor: 10%         Total: 2,640 sq ft     │  Materials      $6,250    │
│  [Edit Measurements]                               │  Labor          $4,500    │
│                                                     │  Disposal       $450      │
│  ─────────────────────────────────────────────────  │  Permits        $300      │
│                                                     │  ─────────────────────────│
│  📦 Line Items                        [+ Add Item] │  Subtotal      $11,500    │
│  ───────────────────────────────────────────────── │  Tax (8.5%)    $978       │
│                                                     │  ─────────────────────────│
│  ┌─────────────────────────────────────────────┐   │  TOTAL         $12,478    │
│  │ ≡  Shingles - GAF Timberline HDZ           │   │                           │
│  │    Charcoal | 2,640 sq ft                  │   │  ─────────────────────────│
│  │    $85/square × 26.4 squares               │   │                           │
│  │                              $2,244    [×] │   │  💵 Profit Margin         │
│  └─────────────────────────────────────────────┘   │  ─────────────────────────│
│  ┌─────────────────────────────────────────────┐   │  Cost:         $7,250     │
│  │ ≡  Underlayment - Synthetic                │   │  Margin:       $5,228     │
│  │    GAF FeltBuster | 2,640 sq ft            │   │                           │
│  │    $45/roll × 12 rolls                     │   │  ██████████████░░ 42%     │
│  │                              $540      [×] │   │                           │
│  └─────────────────────────────────────────────┘   │  Target: 35-45% ✓         │
│  ┌─────────────────────────────────────────────┐   │                           │
│  │ ≡  Ridge Cap                               │   │  ─────────────────────────│
│  │    GAF Seal-A-Ridge | 45 LF                │   │                           │
│  │    $12/LF                                  │   │  🎨 Presentation Options  │
│  │                              $540      [×] │   │  ─────────────────────────│
│  └─────────────────────────────────────────────┘   │  ○ Single Price           │
│  ┌─────────────────────────────────────────────┐   │  ● Good/Better/Best       │
│  │ ≡  Labor - Installation                    │   │  ○ Itemized               │
│  │    Crew Rate | 2,640 sq ft                 │   │                           │
│  │    $1.70/sq ft                             │   │  ─────────────────────────│
│  │                              $4,488    [×] │   │                           │
│  └─────────────────────────────────────────────┘   │  📄 Financing             │
│  ┌─────────────────────────────────────────────┐   │  ─────────────────────────│
│  │ ≡  Dumpster & Disposal                     │   │  ☑ Include financing      │
│  │    30-yard dumpster + haul                 │   │    $208/mo for 60 months  │
│  │    Flat rate                               │   │    via GreenSky           │
│  │                              $450      [×] │   │                           │
│  └─────────────────────────────────────────────┘   │                           │
│                                                     │                           │
│  ─────────────────────────────────────────────────  │                           │
│                                                     │                           │
│  📋 Templates                                       │                           │
│  [Asphalt Shingle] [Metal Roof] [Flat Roof] [+]    │                           │
│                                                     │                           │
└─────────────────────────────────────────────────────┴───────────────────────────┘

KEY UX FEATURES:
✓ Drag-and-drop line items (≡ handle)
✓ Real-time margin calculation (always visible)
✓ One-click delete items (×)
✓ Template quick-add
✓ Import from EagleView/HOVER
✓ Good/Better/Best presentation option
✓ Financing integration visible
```

---

### 8. Estimate Builder (Mobile) - 5 Minute Goal

```
┌───────────────────────────┐
│  ✕  New Estimate    [Save]│
├───────────────────────────┤
│                           │
│  Johnson Residence        │
│  789 Elm Blvd, Denver     │
│                           │
│  ─────────────────────────│
│                           │
│  📐 Measurements          │
│  ┌───────────────────────┐│
│  │ Roof: 2,400 sq ft     ││
│  │ Pitch: 6/12           ││
│  │ [Import] [Edit]       ││
│  └───────────────────────┘│
│                           │
│  ─────────────────────────│
│                           │
│  📋 Quick Templates       │
│  ┌─────┐┌─────┐┌─────┐   │
│  │Asph-││Metal││ Flat │   │
│  │alt  ││Roof ││ Roof │   │
│  └─────┘└─────┘└─────┘   │
│                           │
│  ─────────────────────────│
│                           │
│  📦 Items (tap to edit)   │
│  ┌───────────────────────┐│
│  │ Shingles - GAF HDZ    ││
│  │ 26.4 sq      $2,244 ✕ ││
│  └───────────────────────┘│
│  ┌───────────────────────┐│
│  │ Underlayment          ││
│  │ 12 rolls      $540  ✕ ││
│  └───────────────────────┘│
│  ┌───────────────────────┐│
│  │ Labor                 ││
│  │ 2,640 sqft  $4,488  ✕ ││
│  └───────────────────────┘│
│  ┌───────────────────────┐│
│  │       + Add Item      ││
│  └───────────────────────┘│
│                           │
│  ─────────────────────────│
│                           │
│  💰 Total: $12,478        │
│  Margin: 42% ██████████░░ │
│                           │
│  ┌───────────────────────┐│
│  │    Send Proposal ✉️   ││
│  └───────────────────────┘│
│  ┌───────────────────────┐│
│  │   Get Signature ✍️    ││
│  └───────────────────────┘│
│                           │
└───────────────────────────┘

5-MINUTE ESTIMATE FLOW:
1. Select customer (or create) - 30 sec
2. Import measurements - 30 sec
3. Apply template - 15 sec
4. Adjust quantities - 1 min
5. Review margin - 30 sec
6. Send/sign - 1 min

Total: ~4 minutes (vs AccuLynx ~1 hour)
```

---

### 9. Proposal View (Customer-Facing)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│                              ┌──────────────────┐                               │
│                              │   ACME ROOFING   │                               │
│                              │  Denver's Best   │                               │
│                              └──────────────────┘                               │
│                                                                                 │
│  ═══════════════════════════════════════════════════════════════════════════════│
│                                                                                 │
│                         ROOFING PROPOSAL                                        │
│                                                                                 │
│  Prepared for: John Johnson                                                     │
│  Property: 789 Elm Boulevard, Denver, CO 80202                                  │
│  Date: March 7, 2026                                                            │
│  Valid Until: March 21, 2026                                                    │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                                                                             ││
│  │  GOOD                    BETTER                   BEST                      ││
│  │  ─────────────────────────────────────────────────────────────────────────  ││
│  │                                                                             ││
│  │  3-Tab Shingles          Architectural            Designer Shingles        ││
│  │  25-Year Warranty        Lifetime Warranty        Lifetime + Enhanced      ││
│  │                                                                             ││
│  │  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐       ││
│  │  │                 │     │    ★ POPULAR    │     │                 │       ││
│  │  │    $9,850       │     │    $12,478      │     │    $15,200      │       ││
│  │  │                 │     │                 │     │                 │       ││
│  │  │  [Select]       │     │  [✓ Selected]   │     │  [Select]       │       ││
│  │  └─────────────────┘     └─────────────────┘     └─────────────────┘       ││
│  │                                                                             ││
│  │  or $164/mo              or $208/mo               or $253/mo               ││
│  │  for 60 months           for 60 months            for 60 months            ││
│  │                                                                             ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  WHAT'S INCLUDED:                                                               │
│                                                                                 │
│  ✓ Complete tear-off of existing roof                                          │
│  ✓ Installation of new underlayment                                            │
│  ✓ GAF Timberline HDZ Shingles (Charcoal)                                      │
│  ✓ New ridge cap and ventilation                                               │
│  ✓ All flashing and drip edge                                                  │
│  ✓ Complete cleanup and haul-away                                              │
│  ✓ Manufacturer's warranty + 5-year workmanship guarantee                      │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                                                                             ││
│  │  Ready to proceed? Sign below to approve this proposal.                     ││
│  │                                                                             ││
│  │  Signature: ________________________________________________                ││
│  │                                                                             ││
│  │  Date: March 7, 2026                                                        ││
│  │                                                                             ││
│  │                    ┌─────────────────────────────┐                          ││
│  │                    │   ✍️  SIGN & APPROVE        │                          ││
│  │                    └─────────────────────────────┘                          ││
│  │                                                                             ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                 │
│  Questions? Call Mike at (303) 555-0100 or reply to this email.                │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

### 10. Calendar View (Desktop)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  ┌──────┐                                                                       │
│  │ LISA │  Dashboard   Jobs   Estimates   Calendar   Contacts   Reports   ⚙️ 👤 │
│  └──────┘                                  ▔▔▔▔▔▔▔▔                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Calendar                                           [+ New Event]  Today  < > │
│  [Day]  [Week]  [Month]          March 2026         Filter: All ▾             │
│                                                                                 │
├───────────────────────────────────────────────────────────────────┬─────────────┤
│                                                                   │             │
│       Mon 4      Tue 5      Wed 6      Thu 7      Fri 8          │  🌤️ Weather │
│  ─────────────────────────────────────────────────────────────── │  ─────────  │
│                                                                   │  Today: 62°F│
│  8AM                                                              │  ☀️ Sunny   │
│  ─────────────────────────────────────────────────────────────── │             │
│  9AM  ┌─────────┐                    ┌─────────┐                 │  Tomorrow:  │
│       │Johnson  │                    │ Johnson │                 │  58°F ⛅    │
│       │Inspect  │                    │Roof Inst│                 │             │
│  ─────└─────────┘──────────────────────────────────────────────  │  Fri: 45°F  │
│  10AM                                │all      │                 │  🌧️ Rain    │
│                                      │day      │                 │  ⚠️ Reschedule?│
│  ─────────────────────────────────────────────────────────────── │             │
│  11AM ┌─────────┐                    │         │                 │  ─────────  │
│       │Martinez │                    │         │                 │             │
│       │Estimate │                    └─────────┘                 │  📋 Today   │
│  ─────└─────────┘──────────────────────────────────────────────  │  ─────────  │
│  12PM                                                             │  3 appointments│
│                                                                   │  2 jobs active│
│  ─────────────────────────────────────────────────────────────── │             │
│  1PM                                                              │  ─────────  │
│                                                                   │             │
│  ─────────────────────────────────────────────────────────────── │  👥 Crews   │
│  2PM  ┌─────────┐                                                │  ─────────  │
│       │Wilson   │                                                │  Crew A: Job│
│       │Job Start│                                                │  Crew B: Free│
│  ─────└─────────┘──────────────────────────────────────────────  │  Crew C: Job│
│  3PM                                                              │             │
│                                                                   │             │
│  ─────────────────────────────────────────────────────────────── │             │
│                                                                   │             │
└───────────────────────────────────────────────────────────────────┴─────────────┘

Calendar events are color-coded by type:
• Blue: Inspections
• Green: Estimates/Sales
• Orange: Job starts
• Purple: Installations
• Gray: Internal meetings

Weather integration warns about rain days.
```

---

### 11. Contact/Customer Profile

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  ┌──────┐                                                                       │
│  │ LISA │  Dashboard   Jobs   Estimates   Calendar   Contacts   Reports   ⚙️ 👤 │
│  └──────┘                                            ▔▔▔▔▔▔▔▔                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ← Back to Contacts                                                             │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │  ┌─────┐                                                                  │  │
│  │  │ JJ  │  John Johnson                                    [Edit] [•••]   │  │
│  │  └─────┘  Homeowner                                                       │  │
│  │           Added: Jan 15, 2026  •  Last contact: Mar 5, 2026               │  │
│  │                                                                           │  │
│  │  📞 (303) 555-1234    ✉️ john@email.com    📍 789 Elm Blvd, Denver        │  │
│  │  [Call]  [Text]       [Email]              [Directions] [Copy]            │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────────────┐  │
│  │ 📋 Jobs (2)             [+ New] │  │ 📜 Communication Log          [All] │  │
│  │ ───────────────────────────────  │  │ ─────────────────────────────────── │  │
│  │ ┌─────────────────────────────┐ │  │ Mar 5  📧 Proposal sent            │  │
│  │ │ Roof Replacement            │ │  │        Estimate #1234 - $12,478    │  │
│  │ │ ┌────────┐ 14 days          │ │  │ ─────────────────────────────────── │  │
│  │ │ │APPROVED│                  │ │  │ Mar 3  📞 Outbound call (4 min)    │  │
│  │ │ └────────┘                  │ │  │        Discussed timeline          │  │
│  │ │ $12,500                     │ │  │ ─────────────────────────────────── │  │
│  │ └─────────────────────────────┘ │  │ Mar 1  📝 Note added               │  │
│  │ ┌─────────────────────────────┐ │  │        Inspection completed        │  │
│  │ │ Gutter Cleaning (2024)      │ │  │ ─────────────────────────────────── │  │
│  │ │ ┌────┐                      │ │  │ Feb 28 💬 Text sent                │  │
│  │ │ │PAID│ Completed            │ │  │        Appointment confirmation    │  │
│  │ │ └────┘                      │ │  │                                     │  │
│  │ │ $350                        │ │  │ [+ Add Note]  [+ Log Call]          │  │
│  │ └─────────────────────────────┘ │  │                                     │  │
│  └─────────────────────────────────┘  └─────────────────────────────────────┘  │
│                                                                                 │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────────────┐  │
│  │ 📄 Documents (5)        [+ Add] │  │ 📸 Photos (12)              [+ Add] │  │
│  │ ───────────────────────────────  │  │ ─────────────────────────────────── │  │
│  │ 📄 Signed Contract.pdf          │  │ ┌─────┐┌─────┐┌─────┐┌─────┐       │  │
│  │ 📄 Estimate_1234.pdf            │  │ │     ││     ││     ││     │       │  │
│  │ 📄 EagleView_Report.pdf         │  │ │ IMG ││ IMG ││ IMG ││ IMG │       │  │
│  │ 📄 Insurance_Info.pdf           │  │ │     ││     ││     ││     │       │  │
│  │ 📄 Warranty.pdf                 │  │ └─────┘└─────┘└─────┘└─────┘       │  │
│  │                                 │  │ [View All Photos]                   │  │
│  └─────────────────────────────────┘  └─────────────────────────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

### 12. Invoice Screen

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  ┌──────┐                                                                       │
│  │ LISA │  Dashboard   Jobs   Estimates   Calendar   Contacts   Reports   ⚙️ 👤 │
│  └──────┘                                                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Invoice #INV-2026-0042                              [Edit] [Send] [Record Pmt] │
│  Johnson Residence                                                              │
│                                                                                 │
├─────────────────────────────────────────────────────┬───────────────────────────┤
│                                                     │                           │
│  ┌─────────────────────────────────────────────┐   │  💰 Payment Status        │
│  │                                             │   │  ─────────────────────────│
│  │  INVOICE                                    │   │                           │
│  │  ─────────────────────────────────────────  │   │  Total:      $12,478.00   │
│  │                                             │   │  Paid:       $6,239.00    │
│  │  Bill To:           Invoice #: INV-2026-42  │   │  Balance:    $6,239.00    │
│  │  John Johnson       Date: Mar 7, 2026       │   │                           │
│  │  789 Elm Boulevard  Due: Mar 21, 2026       │   │  ████████░░░░░░░░ 50%     │
│  │  Denver, CO 80202                           │   │                           │
│  │                                             │   │  ─────────────────────────│
│  │  ─────────────────────────────────────────  │   │                           │
│  │                                             │   │  📜 Payment History       │
│  │  Description              Qty    Amount     │   │  ─────────────────────────│
│  │  ─────────────────────────────────────────  │   │                           │
│  │  Roof Replacement -       1     $11,500.00  │   │  Mar 7 - Deposit          │
│  │  GAF Timberline HDZ                         │   │  $6,239.00 (Card)         │
│  │                                             │   │  ✓ Processed              │
│  │  Permit Fee               1     $300.00     │   │                           │
│  │                                             │   │  ─────────────────────────│
│  │  ─────────────────────────────────────────  │   │                           │
│  │  Subtotal                       $11,800.00  │   │  📤 Send Options          │
│  │  Tax (8.5%)                     $678.00     │   │  ─────────────────────────│
│  │  ─────────────────────────────────────────  │   │  ┌─────────────────────┐  │
│  │  TOTAL                          $12,478.00  │   │  │ 📧 Email Invoice    │  │
│  │  Amount Paid                    -$6,239.00  │   │  │ 💬 Text Pay Link    │  │
│  │  ─────────────────────────────────────────  │   │  │ 📄 Download PDF     │  │
│  │  BALANCE DUE                    $6,239.00   │   │  └─────────────────────┘  │
│  │                                             │   │                           │
│  │  ─────────────────────────────────────────  │   │  ─────────────────────────│
│  │                                             │   │                           │
│  │  Payment Options:                           │   │  ┌─────────────────────┐  │
│  │  💳 Pay by Card  🏦 Pay by Bank  📅 Payment │   │  │ + Record Payment    │  │
│  │                              Plan           │   │  └─────────────────────┘  │
│  │                                             │   │                           │
│  └─────────────────────────────────────────────┘   │                           │
│                                                     │                           │
└─────────────────────────────────────────────────────┴───────────────────────────┘
```

---

## Mobile-Specific Screens

### 13. Mobile Home/Dashboard

```
┌───────────────────────────┐
│  ☰  Good morning, Mike! 👋│
├───────────────────────────┤
│                           │
│  ┌─────────┐ ┌─────────┐  │
│  │ $125K   │ │ 12      │  │
│  │ Revenue │ │ Active  │  │
│  │ MTD     │ │ Jobs    │  │
│  └─────────┘ └─────────┘  │
│                           │
│  ─────────────────────────│
│                           │
│  📅 Today's Schedule      │
│  ─────────────────────────│
│  ┌───────────────────────┐│
│  │ 9:00 AM               ││
│  │ Johnson - Inspection  ││
│  │ 📍 123 Oak St         ││
│  │ [📍 Nav] [📞 Call]    ││
│  └───────────────────────┘│
│  ┌───────────────────────┐│
│  │ 11:00 AM              ││
│  │ Martinez - Estimate   ││
│  │ 📍 456 Pine Ave       ││
│  │ [📍 Nav] [📞 Call]    ││
│  └───────────────────────┘│
│  ┌───────────────────────┐│
│  │ 2:00 PM               ││
│  │ Wilson - Job Start    ││
│  │ 📍 789 Elm Blvd       ││
│  │ [📍 Nav] [📞 Call]    ││
│  └───────────────────────┘│
│                           │
│  ─────────────────────────│
│                           │
│  🔔 Needs Attention (3)   │
│  • New lead - Thompson    │
│  • Payment due - Garcia   │
│  • Sign needed - Williams │
│                           │
├───────────────────────────┤
│  🏠    📋    ➕    📅    👥 │
│ Home  Jobs  New  Cal  More│
└───────────────────────────┘
```

---

### 14. Mobile Quick Actions (+ Button)

```
┌───────────────────────────┐
│                           │
│                           │
│   What would you like     │
│   to create?              │
│                           │
│  ┌───────────────────────┐│
│  │ 📋  New Job           ││
│  │     Create a new job  ││
│  └───────────────────────┘│
│  ┌───────────────────────┐│
│  │ 💰  New Estimate      ││
│  │     Build an estimate ││
│  └───────────────────────┘│
│  ┌───────────────────────┐│
│  │ 👤  New Contact       ││
│  │     Add a customer    ││
│  └───────────────────────┘│
│  ┌───────────────────────┐│
│  │ 📅  New Appointment   ││
│  │     Schedule a visit  ││
│  └───────────────────────┘│
│  ┌───────────────────────┐│
│  │ 📸  Take Photos       ││
│  │     Document a job    ││
│  └───────────────────────┘│
│  ┌───────────────────────┐│
│  │ 📝  Quick Note        ││
│  │     Add a note        ││
│  └───────────────────────┘│
│                           │
│  ┌───────────────────────┐│
│  │       Cancel          ││
│  └───────────────────────┘│
│                           │
└───────────────────────────┘
```

---

### 15. Mobile Photo Capture

```
┌───────────────────────────┐
│  ✕  Job Photos     [Done] │
├───────────────────────────┤
│                           │
│  Johnson Residence        │
│  789 Elm Blvd             │
│                           │
│  ─────────────────────────│
│                           │
│  📂 Categories            │
│  [Before] [During] [After]│
│  [Damage] [Materials]     │
│                           │
│  ─────────────────────────│
│                           │
│  📸 Photos (12)           │
│  ┌─────┐┌─────┐┌─────┐   │
│  │     ││     ││     │   │
│  │ IMG ││ IMG ││ IMG │   │
│  │     ││     ││     │   │
│  └─────┘└─────┘└─────┘   │
│  ┌─────┐┌─────┐┌─────┐   │
│  │     ││     ││     │   │
│  │ IMG ││ IMG ││ IMG │   │
│  │     ││     ││     │   │
│  └─────┘└─────┘└─────┘   │
│  ┌─────┐┌─────┐┌─────┐   │
│  │     ││     ││     │   │
│  │ IMG ││ IMG ││ IMG │   │
│  │     ││     ││     │   │
│  └─────┘└─────┘└─────┘   │
│                           │
│                           │
│  ┌───────────────────────┐│
│  │                       ││
│  │    📷 Take Photo      ││
│  │                       ││
│  └───────────────────────┘│
│                           │
└───────────────────────────┘

Photo features:
• Auto-categorize (AI)
• Add annotations
• Voice notes
• GPS/timestamp
• Offline sync
```

---

### 16. E-Signature Screen (Mobile)

```
┌───────────────────────────┐
│  ✕  Sign Proposal         │
├───────────────────────────┤
│                           │
│  Johnson Residence        │
│  Roof Replacement         │
│                           │
│  ─────────────────────────│
│                           │
│  Selected Option:         │
│  ┌───────────────────────┐│
│  │ BETTER - $12,478      ││
│  │ GAF Timberline HDZ    ││
│  │ Lifetime Warranty     ││
│  └───────────────────────┘│
│                           │
│  ─────────────────────────│
│                           │
│  By signing below, I      │
│  agree to the terms and   │
│  authorize the work.      │
│                           │
│  ┌───────────────────────┐│
│  │                       ││
│  │                       ││
│  │   Sign here ✍️        ││
│  │                       ││
│  │                       ││
│  └───────────────────────┘│
│  [Clear]                  │
│                           │
│  Print Name:              │
│  ┌───────────────────────┐│
│  │ John Johnson          ││
│  └───────────────────────┘│
│                           │
│  ─────────────────────────│
│                           │
│  ☑ Email me a copy        │
│  ☑ Text me a copy         │
│                           │
│  ┌───────────────────────┐│
│  │  ✓ Submit Signature   ││
│  └───────────────────────┘│
│                           │
└───────────────────────────┘

ON-SITE SIGNING:
• Customer signs on contractor's phone/tablet
• Instant confirmation email/text
• PDF generated immediately
• No office trip required
```

---

## Interaction Patterns

### Drawer Behavior

```
DESKTOP:
┌────────────────────────────────────┬──────────────────┐
│                                    │                  │
│    Main Content (shrinks)          │  Drawer (400px)  │
│                                    │                  │
│    • Clicking item opens drawer    │  • Slides in     │
│    • Content remains visible       │  • Pushes content│
│    • Can interact with both        │  • Has close (×) │
│                                    │                  │
└────────────────────────────────────┴──────────────────┘

MOBILE:
┌───────────────────────────┐
│                           │
│  Drawer slides up from    │
│  bottom as full-screen    │
│  modal (sheet)            │
│                           │
│  • Swipe down to close    │
│  • Or tap × button        │
│                           │
└───────────────────────────┘
```

### Drag and Drop

```
KANBAN BOARD:
• Grab card by holding/dragging
• Visual feedback: card lifts, shadow increases
• Drop zones highlight as valid targets
• Animation: smooth transition to new position
• Status auto-updates on drop

ESTIMATE BUILDER:
• Drag line items to reorder (≡ handle)
• Visual feedback: item lifts
• Drop indicator shows insertion point
• Smooth animation on release
```

### Loading States

```
SKELETON LOADING:
┌───────────────────────────┐
│ ░░░░░░░░░░░░░░░          │
│ ░░░░░░░░░░░░░░░░░░░░░    │
│ ░░░░░░░░░░                │
└───────────────────────────┘

BUTTON LOADING:
┌───────────────────────────┐
│   ◌ Saving...             │
└───────────────────────────┘

PROGRESS:
████████░░░░░░░░░░ 45%
```

### Toast Notifications

```
SUCCESS:
┌───────────────────────────────────────┐
│ ✓  Estimate saved successfully        │
└───────────────────────────────────────┘

ERROR:
┌───────────────────────────────────────┐
│ ✕  Failed to send. Check connection.  │
└───────────────────────────────────────┘

INFO:
┌───────────────────────────────────────┐
│ ℹ  New lead assigned to you           │
└───────────────────────────────────────┘

Position: Top-right (desktop), Top-center (mobile)
Duration: 4 seconds, auto-dismiss
Action: Optional "Undo" or "View" button
```

---

## Responsive Breakpoints

```
Mobile:     320px - 639px    (single column, bottom nav)
Tablet:     640px - 1023px   (2 columns, side nav option)
Desktop:    1024px - 1279px  (full layout, top nav)
Large:      1280px+          (expanded layout, more columns)

Key Adaptations:
• Navigation: Bottom (mobile) → Top (desktop)
• Drawer: Full-screen (mobile) → Side panel (desktop)
• Grid: 1 col (mobile) → 2-4 cols (desktop)
• Cards: Stack (mobile) → Grid (desktop)
```

---

## Implementation Notes for Developers

### Technology Recommendations

```
Framework:     React 18+ with TypeScript
Styling:       Tailwind CSS + shadcn/ui components
State:         React Query (server) + Zustand (client)
Forms:         React Hook Form + Zod validation
Drag & Drop:   @dnd-kit/core
Charts:        Recharts or Tremor
Calendar:      react-big-calendar
Signature:     react-signature-canvas
```

### Component Priority

```
P0 (MVP):
• Navigation (top + bottom)
• Job Card
• Details Drawer
• Estimate Line Item
• Status Badge
• Button variants
• Input fields
• Toast notifications

P1 (Soon after):
• Calendar view
• Photo gallery
• Signature pad
• Invoice template
• Dashboard widgets

P2 (Later):
• Custom dashboards
• Advanced charts
• AI components
```

### Accessibility Requirements

```
• WCAG 2.1 AA compliance
• Keyboard navigation for all interactions
• Screen reader support (ARIA labels)
• Color contrast ratios ≥ 4.5:1
• Focus indicators visible
• Touch targets ≥ 44px
```

---

## Summary: Key UX Wins

| Feature | AccuLynx | Lisa |
|---------|----------|------|
| Estimate creation | ~1 hour | < 5 minutes |
| Mobile estimates | Extra fee | Full parity |
| Mobile invoices | Limited | Full access |
| Details drawer | ✗ | ✓ |
| Status duration | ✗ | ✓ |
| On-site signing | Office required | ✓ |
| Margin visibility | Hidden | Always visible |
| Navigation clicks | 5-7 per task | 1-2 per task |

---

**Next Steps:**
1. Create high-fidelity mockups in Figma
2. Build component library in Storybook
3. Implement navigation shell
4. Build Jobs Board with drawer
5. Build Estimate Builder
