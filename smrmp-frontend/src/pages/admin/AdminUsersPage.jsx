import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import PrivateLayout from '../../components/layout/PrivateLayout';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Alert from '../../components/ui/Alert';
import { userApi, roleApi } from '../../api/rbacApi';
import useAuthStore from '../../store/authStore';
import {
  MagnifyingGlassIcon,
  ClipboardDocumentIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

function generateTempPassword() {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const special = '!@#$%&*';
  const pick = (chars, n) =>
    Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${pick(upper, 2)}${pick(lower, 4)}${pick(digits, 2)}${pick(special, 2)}Aa1!`;
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { can, user: me } = useAuthStore();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    role_id: '',
    password: '',
  });
  const [createdTempPassword, setCreatedTempPassword] = useState(null);

  const { data: usersData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-users', search, roleFilter, statusFilter],
    queryFn: () =>
      userApi.list({
        limit: 100,
        search: search || undefined,
        role: roleFilter || undefined,
        is_active: statusFilter === '' ? undefined : statusFilter,
      }),
    select: (res) => res.data.data,
  });

  const { data: rolesData } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => roleApi.list(),
    select: (res) => res.data.data.roles,
  });

  const staffRoles = useMemo(
    () => (rolesData || []).filter((r) => r.slug !== 'visitor' && r.is_active),
    [rolesData]
  );

  const allRoleOptions = useMemo(() => {
    const list = [...staffRoles];
    const visitor = (rolesData || []).find((r) => r.slug === 'visitor');
    if (visitor) list.push(visitor);
    return list;
  }, [staffRoles, rolesData]);

  const roleOptions = [
    { value: '', label: 'Select role' },
    ...staffRoles.map((r) => ({ value: r.id, label: r.name })),
  ];

  const filterRoleOptions = [
    { value: '', label: 'All roles' },
    ...(rolesData || []).map((r) => ({ value: r.slug, label: r.name })),
  ];

  const createMutation = useMutation({
    mutationFn: (payload) => userApi.create(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setCreatedTempPassword(res.data.data.temporary_password);
      setShowCreate(false);
      setForm({ name: '', email: '', role_id: '', password: '' });
      toast.success('Staff account created');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Create failed');
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, is_active }) => userApi.updateStatus(id, is_active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User status updated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Update failed');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => userApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setEditingId(null);
      toast.success('User updated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Update failed');
    },
  });

  const users = usersData?.users || [];

  const copyPassword = async () => {
    if (!createdTempPassword) return;
    try {
      await navigator.clipboard.writeText(createdTempPassword);
      toast.success('Password copied');
    } catch {
      toast.error('Could not copy');
    }
  };

  return (
    <PrivateLayout>
      <PageHeader
        title="User accounts"
        description="Create staff (POST /api/users), assign roles, and activate accounts."
        showBack
        backPath="/admin"
        backLabel="Back to Access control"
        action={
          can('users.create') ? (
            <Button variant="primary" onClick={() => setShowCreate((v) => !v)}>
              {showCreate ? 'Cancel' : 'Create staff'}
            </Button>
          ) : null
        }
      />

      {createdTempPassword && (
        <Alert variant="warning" title="Temporary password — copy and share securely" className="mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <code className="rounded-lg bg-[#FFFDF9] px-2 py-1 font-mono text-sm">{createdTempPassword}</code>
            <Button variant="secondary" size="sm" onClick={copyPassword}>
              <ClipboardDocumentIcon className="h-3.5 w-3.5" />
              Copy
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setCreatedTempPassword(null)}>
              Dismiss
            </Button>
          </div>
          <p className="mt-2 text-xs">The user must change this password on first login.</p>
        </Alert>
      )}

      {showCreate && (
        <form
          className="mb-6 grid gap-3 rounded-2xl border border-[#E2D6C5] bg-[#FAF6F0] p-5 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.role_id) {
              toast.error('Select a role');
              return;
            }
            createMutation.mutate(form);
          }}
        >
          <Input
            label="Full name"
            required
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          />
          <Select
            label="Role"
            required
            options={roleOptions}
            value={form.role_id}
            onChange={(e) => setForm((p) => ({ ...p, role_id: e.target.value }))}
          />
          <div className="space-y-2">
            <Input
              label="Temporary password"
              type="text"
              required
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              hint="Min 8 chars with upper, lower, number, special"
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setForm((p) => ({ ...p, password: generateTempPassword() }))}
            >
              Generate strong password
            </Button>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" variant="gold" loading={createMutation.isPending}>
              Create account
            </Button>
          </div>
        </form>
      )}

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] flex-1">
          <Input
            label="Search"
            placeholder="Name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-40">
          <Select
            label="Role"
            options={filterRoleOptions}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          />
        </div>
        <div className="w-36">
          <Select
            label="Status"
            options={[
              { value: '', label: 'All' },
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
        <Button variant="secondary" size="sm" onClick={() => refetch()} loading={isFetching}>
          <ArrowPathIcon className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#E2D6C5] bg-[#FFFDF9]">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-[#FAF6F0] text-[#5C4233]">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-[#6E5445]">
                  Loading…
                </td>
              </tr>
            )}
            {!isLoading && users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-[#6E5445]">
                  <MagnifyingGlassIcon className="mx-auto mb-2 h-5 w-5 opacity-40" />
                  No users found
                </td>
              </tr>
            )}
            {!isLoading &&
              users.map((u) => (
                <tr key={u.id} className="border-t border-[#E2D6C5]">
                  <td className="px-4 py-3 font-medium text-[#2B1B12]">
                    {editingId === u.id ? (
                      <div className="flex gap-2">
                        <input
                          className="w-full rounded-lg border border-[#E2D6C5] px-2 py-1"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() =>
                            updateMutation.mutate({ id: u.id, payload: { name: editName } })
                          }
                        >
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      u.name
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#5C4233]">{u.email}</td>
                  <td className="px-4 py-3">
                    {can('users.assign_role') ? (
                      <select
                        className="rounded-lg border border-[#E2D6C5] bg-white px-2 py-1"
                        value={u.role_id || ''}
                        onChange={(e) =>
                          updateMutation.mutate({
                            id: u.id,
                            payload: { role_id: e.target.value },
                          })
                        }
                      >
                        {allRoleOptions.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="capitalize">{u.role_name || u.role}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        u.is_active !== false
                          ? 'font-semibold text-[#374B07]'
                          : 'font-semibold text-[#8B1E1E]'
                      }
                    >
                      {u.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                    {u.must_change_password ? (
                      <span className="ml-2 text-[10px] text-[#7C4A2D]">Must change PW</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {can('users.update') && editingId !== u.id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(u.id);
                            setEditName(u.name);
                          }}
                        >
                          Edit name
                        </Button>
                      )}
                      {can('users.deactivate') && u.id !== me?.id && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            statusMutation.mutate({
                              id: u.id,
                              is_active: u.is_active === false,
                            })
                          }
                        >
                          {u.is_active === false ? 'Activate' : 'Deactivate'}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[11px] text-[#887060]">
        Also see <Link to="/admin/roles" className="font-semibold text-[#374B07] hover:underline">Roles</Link>
        {' '}and{' '}
        <Link to="/admin/permissions" className="font-semibold text-[#374B07] hover:underline">
          Permissions
        </Link>
        .
      </p>
    </PrivateLayout>
  );
}
