import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import PrivateLayout from '../../components/layout/PrivateLayout';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { roleApi } from '../../api/rbacApi';
import useAuthStore from '../../store/authStore';

export default function AdminRolesPage() {
  const queryClient = useQueryClient();
  const { can } = useAuthStore();
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [checked, setChecked] = useState({});
  const [newRole, setNewRole] = useState({ name: '', description: '' });
  const [editingMeta, setEditingMeta] = useState(false);
  const [metaForm, setMetaForm] = useState({ name: '', description: '' });

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => roleApi.list(),
    select: (res) => res.data.data.roles,
  });

  const { data: permissions = [] } = useQuery({
    queryKey: ['admin-permissions'],
    queryFn: () => roleApi.listPermissions(),
    select: (res) => res.data.data.permissions,
  });

  const selectedRole = useMemo(
    () => roles.find((r) => r.id === selectedRoleId) || null,
    [roles, selectedRoleId]
  );

  const permissionsByModule = useMemo(() => {
    const map = {};
    for (const p of permissions) {
      if (!map[p.module]) map[p.module] = [];
      map[p.module].push(p);
    }
    return map;
  }, [permissions]);

  const selectRole = (role) => {
    setSelectedRoleId(role.id);
    setEditingMeta(false);
    setMetaForm({ name: role.name, description: role.description || '' });
    const next = {};
    for (const p of role.permissions || []) {
      next[p.id] = true;
    }
    setChecked(next);
  };

  const createMutation = useMutation({
    mutationFn: (payload) => roleApi.create(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      setNewRole({ name: '', description: '' });
      toast.success('Role created');
      selectRole(res.data.data.role);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Create failed'),
  });

  const updateMetaMutation = useMutation({
    mutationFn: ({ id, payload }) => roleApi.update(id, payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      setEditingMeta(false);
      selectRole(res.data.data.role);
      toast.success('Role updated');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Update failed'),
  });

  const saveMatrixMutation = useMutation({
    mutationFn: ({ id, permission_ids }) => roleApi.assignPermissions(id, permission_ids),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      selectRole(res.data.data.role);
      toast.success('Permissions saved');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Save failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => roleApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      setSelectedRoleId(null);
      setChecked({});
      toast.success('Role deleted');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Delete failed'),
  });

  const toggleModule = (modulePerms, enable) => {
    setChecked((prev) => {
      const next = { ...prev };
      for (const p of modulePerms) {
        next[p.id] = enable;
      }
      return next;
    });
  };

  const selectedCount = Object.values(checked).filter(Boolean).length;

  return (
    <PrivateLayout>
      <PageHeader
        title="Roles & permissions"
        description="Create roles and edit the permission matrix (PUT /api/roles/:id/permissions)."
        showBack
        backPath="/admin"
        backLabel="Back to Access control"
        action={(
          <Link to="/admin/permissions" className="text-xs font-bold text-[#374B07] hover:underline">
            View permission catalog →
          </Link>
        )}
      />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-3">
          <div className="rounded-2xl border border-[#E2D6C5] bg-[#FFFDF9] p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#5C4233]">
              Roles
            </p>
            {isLoading && <p className="text-xs text-[#6E5445]">Loading…</p>}
            <ul className="max-h-[420px] space-y-1 overflow-y-auto">
              {roles.map((role) => (
                <li key={role.id}>
                  <button
                    type="button"
                    onClick={() => selectRole(role)}
                    className={`w-full rounded-xl px-3 py-2 text-left text-xs font-semibold transition ${
                      selectedRoleId === role.id
                        ? 'bg-[#E4EEDC] text-[#243205]'
                        : 'text-[#2B1B12] hover:bg-[#FAF6F0]'
                    }`}
                  >
                    <span className="block truncate">{role.name}</span>
                    <span className="mt-0.5 block font-mono text-[10px] font-normal text-[#887060]">
                      {role.slug}
                      {role.is_system ? ' · system' : ''}
                      {' · '}
                      {(role.permission_codes || role.permissions || []).length} perms
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {can('roles.create') && (
            <form
              className="space-y-2 rounded-2xl border border-[#E2D6C5] bg-[#FAF6F0] p-3"
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(newRole);
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-[#5C4233]">
                New custom role
              </p>
              <Input
                label="Name"
                required
                value={newRole.name}
                onChange={(e) => setNewRole((p) => ({ ...p, name: e.target.value }))}
              />
              <Input
                label="Description"
                value={newRole.description}
                onChange={(e) => setNewRole((p) => ({ ...p, description: e.target.value }))}
              />
              <Button type="submit" size="sm" variant="primary" loading={createMutation.isPending}>
                Create role
              </Button>
            </form>
          )}
        </div>

        <div className="rounded-2xl border border-[#E2D6C5] bg-[#FFFDF9] p-5">
          {!selectedRole && (
            <p className="text-sm text-[#6E5445]">Select a role to edit its permissions.</p>
          )}
          {selectedRole && (
            <>
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-[#E2D6C5] pb-4">
                <div className="min-w-0 flex-1">
                  {editingMeta ? (
                    <div className="space-y-2">
                      <Input
                        label="Name"
                        value={metaForm.name}
                        onChange={(e) => setMetaForm((p) => ({ ...p, name: e.target.value }))}
                      />
                      <Input
                        label="Description"
                        value={metaForm.description}
                        onChange={(e) =>
                          setMetaForm((p) => ({ ...p, description: e.target.value }))
                        }
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          loading={updateMetaMutation.isPending}
                          onClick={() =>
                            updateMetaMutation.mutate({
                              id: selectedRole.id,
                              payload: metaForm,
                            })
                          }
                        >
                          Save details
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingMeta(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="font-display text-xl font-bold text-[#2B1B12]">
                        {selectedRole.name}
                      </h2>
                      <p className="text-xs text-[#6E5445]">{selectedRole.description}</p>
                      <p className="mt-1 font-mono text-[11px] text-[#7C4A2D]">
                        {selectedRole.slug} · {selectedCount} selected
                      </p>
                    </>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {can('roles.update') && !editingMeta && (
                    <Button size="sm" variant="secondary" onClick={() => setEditingMeta(true)}>
                      Edit details
                    </Button>
                  )}
                  {can('roles.assign_permissions') && (
                    <Button
                      variant="gold"
                      size="sm"
                      loading={saveMatrixMutation.isPending}
                      onClick={() =>
                        saveMatrixMutation.mutate({
                          id: selectedRole.id,
                          permission_ids: Object.keys(checked).filter((id) => checked[id]),
                        })
                      }
                    >
                      Save permissions
                    </Button>
                  )}
                  {can('roles.delete') && !selectedRole.is_system && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        if (window.confirm(`Delete role “${selectedRole.name}”?`)) {
                          deleteMutation.mutate(selectedRole.id);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                {Object.entries(permissionsByModule).map(([module, perms]) => {
                  const allOn = perms.every((p) => checked[p.id]);
                  return (
                    <div key={module}>
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#5C4233]">
                          {module}
                        </p>
                        {can('roles.assign_permissions') && (
                          <button
                            type="button"
                            className="text-[10px] font-bold text-[#374B07] hover:underline"
                            onClick={() => toggleModule(perms, !allOn)}
                          >
                            {allOn ? 'Clear module' : 'Select module'}
                          </button>
                        )}
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {perms.map((p) => (
                          <label
                            key={p.id}
                            className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-xs transition ${
                              checked[p.id]
                                ? 'border-[#B8D4A0] bg-[#E4EEDC]/60'
                                : 'border-[#E2D6C5] bg-[#FAF6F0]'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="mt-0.5"
                              checked={Boolean(checked[p.id])}
                              disabled={!can('roles.assign_permissions')}
                              onChange={(e) =>
                                setChecked((prev) => ({
                                  ...prev,
                                  [p.id]: e.target.checked,
                                }))
                              }
                            />
                            <span>
                              <span className="font-mono font-semibold text-[#2B1B12]">{p.code}</span>
                              <span className="mt-0.5 block text-[#6E5445]">{p.description}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </PrivateLayout>
  );
}
