# Phase 0: Payload-First Security TDD

## 1. Data Invariants
- `employees`: Must contain role information (`orgLevel1`, `orgLevel2`, `orgLevel3`). Users cannot alter their own `role` or `active` status. Only sysadmins can hard-delete.
- `committees`: Read by anyone authenticated. Modifiable by orgLevel1/orgLevel2, and orgLevel3 if they are assigned to it.
- `tasks` / `recommendations`: Read by anyone. Assigned users or creators can update status/progress. Only orgLevel1/orgLevel2 can delete.
- `events`: Same as committees.
- `system_logs`: Append-only (create). No updates, no deletes. Read only by orgLevel1.
- `approved_emails` / `join_requests`: Admin management of access.

## 2. Dirty Dozen Payloads
(Tested conceptually via ESLint & Rule strictness)
1. Identity spoof: User sets their role to `orgLevel1`.
2. Unauthorized delete: User tries to delete a committee.
3. System log tamper: User tries to update a log.
4. Data scraping: Unauthenticated read.
5. Path poisoning: Very large document IDs.
