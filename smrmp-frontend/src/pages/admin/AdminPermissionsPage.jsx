import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PrivateLayout from '../../components/layout/PrivateLayout';
import PageHeader from '../../components/layout/PageHeader';
import Input from '../../components/ui/Input';
import { roleApi } from '../../api/rbacApi';

export default function AdminPermissionsPage() {
  const [search, setSearch] = useState('');

  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ['admin-permissions'],
    queryFn: () => roleApi.listPermissions(),
    select: (res) => res.data.data.permissions,
  });

  const byModule = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = permissions.filter((p) => {
      if (!q) return true;
      return (
        p.code.toLowerCase().includes(q) ||
        p.module.toLowerCase().includes(q) ||
        String(p.description || '')
          .toLowerCase()
          .includes(q)
      );
    });
    const map = {};
    for (const p of filtered) {
      if (!map[p.module]) map[p.module] = [];
      map[p.module].push(p);
    }
    return map;
  }, [permissions, search]);

  return (
    <PrivateLayout>
      <PageHeader
        title="Permission catalog"
        description="All assignable permission codes (GET /api/roles/permissions)."
        showBack
        backPath="/admin"
        backLabel="Back to Access control"
        action={(
          <Link
            to="/admin/roles"
            className="text-xs font-bold text-[#374B07] hover:underline"
          >
            Edit role matrix →
          </Link>
        )}
      />

      <div className="mb-5 max-w-md">
        <Input
          label="Search permissions"
          placeholder="e.g. artifacts.create"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading && <p className="text-sm text-[#6E5445]">Loading permissions…</p>}

      <div className="space-y-5">
        {Object.entries(byModule).map(([module, perms]) => (
          <section
            key={module}
            className="overflow-hidden rounded-2xl border border-[#E2D6C5] bg-[#FFFDF9]"
          >
            <div className="border-b border-[#E2D6C5] bg-[#FAF6F0] px-4 py-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#5C4233]">
                {module}
                <span className="ml-2 font-normal text-[#887060]">({perms.length})</span>
              </h2>
            </div>
            <ul className="divide-y divide-[#E2D6C5]">
              {perms.map((p) => (
                <li key={p.id} className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <code className="font-mono text-xs font-semibold text-[#2B1B12]">{p.code}</code>
                  <span className="text-xs text-[#6E5445]">{p.description}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {!isLoading && Object.keys(byModule).length === 0 && (
          <p className="text-sm text-[#6E5445]">No permissions match your search.</p>
        )}
      </div>
    </PrivateLayout>
  );
}
