import { useState, useMemo } from 'react';
import {
  UserPlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  PencilSquareIcon,
  TrashIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import PrivateLayout from '../../components/layout/PrivateLayout';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import AddUserModal from '../../components/users/AddUserModal';
import EditUserModal from '../../components/users/EditUserModal';
import { useUsers, useToggleUserStatus, useDeleteUser } from '../../hooks/useUsers';
import { STAFF_ROLE_OPTIONS, ROLE_BADGE_VARIANTS } from '../../utils/constants';
import getApiErrorMessage from '../../utils/apiError';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
  });

  const { data, isLoading, isError, error, refetch } = useUsers(filters);
  const toggleStatusMutation = useToggleUserStatus();
  const deleteUserMutation = useDeleteUser();

  const users = data?.users || [];

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({ search: '', role: '', status: '' });
  };

  const hasActiveFilters = Boolean(filters.search || filters.role || filters.status);

  // Compute staff summary stats
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === 'active').length;
    const adminsAndCurators = users.filter((u) => u.role === 'admin' || u.role === 'curator').length;
    const conservation = users.filter((u) => u.role === 'conservation' || u.role === 'maintenance').length;
    return { total, active, adminsAndCurators, conservation };
  }, [users]);

  const handleToggleStatus = async (user) => {
    try {
      await toggleStatusMutation.mutateAsync(user.id);
      const nextStatus = user.status === 'active' ? 'inactive' : 'active';
      toast.success(`Account for "${user.name}" set to ${nextStatus}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update user status'));
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      await deleteUserMutation.mutateAsync(deletingUser.id);
      toast.success(`User account "${deletingUser.name}" removed successfully`);
      setDeletingUser(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete user'));
    }
  };

  const formatRoleLabel = (role) => {
    const found = STAFF_ROLE_OPTIONS.find((r) => r.value === role);
    if (found) return found.label;
    return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Staff';
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Never';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      return isoString;
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Staff Member',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            {row.avatar ? (
              <img
                src={row.avatar}
                alt={row.name}
                className="h-10 w-10 rounded-full object-cover border border-[#E2D6C5]"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={`h-10 w-10 items-center justify-center rounded-full bg-[#FAF0D8] font-bold text-[#7C4A2D] text-xs border border-[#D4A017]/40 ${
                row.avatar ? 'hidden' : 'flex'
              }`}
            >
              {row.name
                ? row.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()
                : 'U'}
            </div>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-[#2B1B12] text-sm leading-tight truncate">{row.name}</p>
            <p className="text-xs text-[#6E5445] truncate">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (row) => (
        <Badge variant={ROLE_BADGE_VARIANTS[row.role] || 'default'}>
          {formatRoleLabel(row.role)}
        </Badge>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      render: (row) => (
        <span className="text-xs font-semibold text-[#5C4233]">
          {row.department || 'General Staff'}
        </span>
      ),
    },
    {
      key: 'phone',
      label: 'Contact Phone',
      render: (row) => (
        <span className="text-xs font-mono text-[#6E5445]">{row.phone || 'N/A'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleToggleStatus(row);
          }}
          disabled={toggleStatusMutation.isPending}
          className="group inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-bold transition-all hover:scale-105"
          title={`Click to ${row.status === 'active' ? 'deactivate' : 'activate'}`}
        >
          {row.status === 'active' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
              Inactive
            </span>
          )}
        </button>
      ),
    },
    {
      key: 'created_at',
      label: 'Member Since',
      render: (row) => (
        <span className="text-xs text-[#6E5445]">{formatDate(row.created_at)}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setEditingUser(row);
            }}
            className="rounded-lg p-1.5 text-[#7C4A2D] hover:bg-[#FAF0E4] hover:text-[#2B1B12] transition-colors"
            title="Edit User Details"
          >
            <PencilSquareIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDeletingUser(row);
            }}
            className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-800 transition-colors"
            title="Delete User"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <PrivateLayout>
      <PageHeader
        title="User Management"
        description="Manage system personnel, assign staff roles, and maintain user access controls across departments."
        badge="Admin Portal"
        action={
          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            className="shadow-sm"
          >
            <UserPlusIcon className="h-4 w-4" />
            <span>Add New User</span>
          </Button>
        }
      />

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="flex items-center gap-4 bg-gradient-to-br from-[#FFFDF9] to-[#FAF6F0]">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FAF0D8] text-[#7C4A2D] border border-[#D4A017]/40 shadow-2xs">
            <UserGroupIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">Total Personnel</p>
            <p className="font-display text-2xl font-bold text-[#2B1B12]">{stats.total}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 bg-gradient-to-br from-[#FFFDF9] to-[#FAF6F0]">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs">
            <CheckCircleIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">Active Accounts</p>
            <p className="font-display text-2xl font-bold text-[#2B1B12]">{stats.active}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 bg-gradient-to-br from-[#FFFDF9] to-[#FAF6F0]">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FAF0D8] text-[#D4A017] border border-[#D4A017]/40 shadow-2xs">
            <ShieldCheckIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">Admins & Curators</p>
            <p className="font-display text-2xl font-bold text-[#2B1B12]">{stats.adminsAndCurators}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 bg-gradient-to-br from-[#FFFDF9] to-[#FAF6F0]">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-800 border border-sky-200 shadow-2xs">
            <UserPlusIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">Conservation & Tech</p>
            <p className="font-display text-2xl font-bold text-[#2B1B12]">{stats.conservation}</p>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="mb-6 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search Input */}
            <Input
              placeholder="Search by name, email, phone..."
              icon={MagnifyingGlassIcon}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />

            {/* Role Filter */}
            <Select
              icon={FunnelIcon}
              placeholder="All Staff Roles"
              options={[
                { value: '', label: 'All Staff Roles' },
                ...STAFF_ROLE_OPTIONS.map((r) => ({ value: r.value, label: r.label })),
              ]}
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
            />

            {/* Status Filter */}
            <Select
              placeholder="All Statuses"
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'active', label: 'Active Only' },
                { value: 'inactive', label: 'Inactive Only' },
              ]}
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
              >
                Reset Filters
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => refetch()}
              title="Refresh users list"
            >
              <ArrowPathIcon className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Users Table */}
      {isError ? (
        <Card className="p-8 text-center">
          <XCircleIcon className="mx-auto h-12 w-12 text-rose-500 mb-3" />
          <h3 className="font-bold text-[#2B1B12] text-lg">Unable to load staff directory</h3>
          <p className="mt-1 text-sm text-[#6E5445]">{getApiErrorMessage(error, 'An unexpected error occurred')}</p>
          <Button variant="secondary" className="mt-4" onClick={() => refetch()}>
            Try Again
          </Button>
        </Card>
      ) : (
        <Table
          columns={columns}
          data={users}
          loading={isLoading}
          emptyMessage={
            hasActiveFilters
              ? 'No staff members match your filter criteria.'
              : 'No staff users found. Click "Add New User" to register a staff account.'
          }
        />
      )}

      {/* Add New User Modal */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          isOpen={Boolean(editingUser)}
          onClose={() => setEditingUser(null)}
          onSuccess={() => refetch()}
        />
      )}

      {/* Delete User Confirmation Modal */}
      {deletingUser && (
        <Modal
          open={Boolean(deletingUser)}
          onClose={() => setDeletingUser(null)}
          title="Confirm User Account Deletion"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
              <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Permanent Deletion Warning</p>
                <p className="mt-1 leading-relaxed">
                  Are you sure you want to delete staff account{' '}
                  <span className="font-bold">{deletingUser.name}</span> ({deletingUser.email})?
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                variant="secondary"
                onClick={() => setDeletingUser(null)}
                disabled={deleteUserMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteUser}
                loading={deleteUserMutation.isPending}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </PrivateLayout>
  );
}
