import { Link } from 'react-router-dom';
import PrivateLayout from '../../components/layout/PrivateLayout';
import PageHeader from '../../components/layout/PageHeader';
import useAuthStore from '../../store/authStore';
import {
  UsersIcon,
  ShieldCheckIcon,
  KeyIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

const CARDS = [
  {
    title: 'User accounts',
    description: 'Create staff, assign roles, activate or deactivate accounts.',
    path: '/admin/users',
    permission: 'users.read',
    icon: UsersIcon,
    endpoints: ['GET /api/users', 'POST /api/users', 'PATCH /api/users/:id'],
  },
  {
    title: 'Roles & matrix',
    description: 'Create custom roles and map permissions by module.',
    path: '/admin/roles',
    permission: 'roles.read',
    icon: ShieldCheckIcon,
    endpoints: ['GET /api/roles', 'POST /api/roles', 'PUT /api/roles/:id/permissions'],
  },
  {
    title: 'Permission catalog',
    description: 'Browse every permission code available to assign.',
    path: '/admin/permissions',
    permission: 'roles.read',
    icon: KeyIcon,
    endpoints: ['GET /api/roles/permissions'],
  },
];

export default function AdminAccessPage() {
  const { can, user } = useAuthStore();

  const visible = CARDS.filter((c) => can(c.permission));

  return (
    <PrivateLayout>
      <PageHeader
        title="Access control"
        description="Manage accounts, roles, and permissions for museum staff."
        badge={user?.role_name || user?.role}
      />

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-[#E2D6C5] bg-[#FAF6F0] px-5 py-8 text-center text-sm text-[#6E5445]">
          You do not have permission to manage access control.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.path}
                to={card.path}
                className="group flex flex-col rounded-2xl border border-[#E2D6C5] bg-[#FFFDF9] p-5 shadow-2xs transition hover:border-smrmp-gold/50 hover:bg-[#FAF6F0]"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF0D8] text-[#7C4A2D] ring-1 ring-[#D4A017]/30">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="font-display text-lg font-bold text-[#2B1B12] group-hover:text-[#7C4A2D]">
                  {card.title}
                </h2>
                <p className="mt-1 flex-1 text-xs leading-relaxed text-[#6E5445]">
                  {card.description}
                </p>
                <ul className="mt-3 space-y-1 border-t border-[#E2D6C5] pt-3">
                  {card.endpoints.map((ep) => (
                    <li key={ep} className="font-mono text-[10px] text-[#887060]">
                      {ep}
                    </li>
                  ))}
                </ul>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#374B07]">
                  Open
                  <ArrowRightIcon className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </PrivateLayout>
  );
}
