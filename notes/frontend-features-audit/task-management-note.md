# Task Management - Quick Note

**Date**: 2026-03-07  
**Status**: Clarification Needed

---

## Discovery

During the New Job Form investigation, discovered that **Job Tasks API already exists** in backend!

### Backend Endpoints (from `backend/app/api/v1/endpoints/jobs.py`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/jobs/{job_id}/tasks` | List tasks for a job |
| POST | `/jobs/{job_id}/tasks` | Create task |
| PATCH | `/jobs/{job_id}/tasks/{task_id}` | Update task |

### Task Schema
```python
class JobTaskCreate(BaseModel):
    title: str
    description: str | None
    due_date: date | None
    priority: str = "medium"  # low, medium, high
    assigned_to_id: UUID | None

class JobTaskResponse(BaseModel):
    id: UUID
    job_id: UUID
    title: str
    description: str | None
    due_date: date | None
    priority: str
    is_completed: bool
    completed_at: datetime | None
    assigned_to: UserResponse | None
    created_at: datetime
```

---

## What "Task Management" Means

From competitor research, tasks are:
- **Per-job to-do items** (e.g., "Order materials", "Schedule inspection")
- Assignable to team members
- Have due dates and priorities
- Trackable (complete/incomplete)

### Dashboard "Task Management Coming Soon"

The dashboard stub likely means:
- Show "My Tasks" across all jobs
- Quick task completion
- Overdue task alerts

### Job Detail Tasks

On a job detail page:
- List tasks for that job
- Add new tasks
- Mark complete
- Assign to team members

---

## Implementation Status

- **Backend**: ✅ Complete (API exists)
- **Frontend**: ❌ Not implemented

### What's Needed

1. **Job Detail Page** - Add tasks section
2. **Dashboard** - Add "My Tasks" widget
3. **Task types** - Add to `frontend/src/types/`
4. **Jobs store** - Add task methods

---

## Recommendation

Tasks are a **quick win** - backend is done, just need frontend.

Could be part of:
- Job detail page enhancement
- Dashboard improvement

**Effort**: ~2 days

---

## Deferred

Per user direction, not a high priority for this audit. But noting that it's mostly ready.
