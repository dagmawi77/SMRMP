# RBAC (Roles & Permissions)

SMRMP uses full role-based access control on top of Supabase Auth.

## Concepts

- **User** (`public.users`) → one **Role** (`roles`) via `role_id`
- **Role** ↔ **Permissions** via `role_permissions`
- Permission codes look like `artifacts.create`, `users.read`, `dashboard.read`

## System roles (seeded)

`admin`, `curator`, `conservation`, `maintenance`, `researcher`, `visitor`

System roles cannot be deleted. The `admin` role cannot lose protected permissions (`users.*` create/read/assign, `roles.read`, `roles.assign_permissions`).

## Account creation

| Path | Who | Role |
|------|-----|------|
| `POST /api/auth/register` | Public visitor signup | Always `visitor` |
| `POST /api/users` | Admin UI / API (`users.create`) | Staff role + temp password (`must_change_password=true`) |

Staff created by admin must change password on first login (`POST /api/auth/change-password`).

## Admin UI

- `/admin/users` — create staff, change role, activate/deactivate
- `/admin/roles` — custom roles + permission matrix

## Middleware

Routes use `requirePermission('artifacts.read')` instead of hardcoded role lists.

Login / `/auth/me` return `permissions[]` for the frontend `can()` checks.

## Migrate / seed

```bash
cd smrmp-backend
npx sequelize-cli db:migrate
# optional re-seed demo users (assigns role_id when roles table exists)
npx sequelize-cli db:seed:all
npm run auth:sync
```
