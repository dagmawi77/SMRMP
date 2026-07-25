import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  ClipboardDocumentCheckIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  UserIcon,
  BuildingOffice2Icon,
} from '@heroicons/react/24/outline';
import PrivateLayout from '../../components/layout/PrivateLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import { MAINTENANCE_TRANSLATIONS } from './maintenanceData';
import {
  ASSIGNED_TASK_STATUSES,
  getPriorityBadgeVariant,
  getStatusBadgeVariant,
} from './maintenanceUtils';
import { useAssignedMaintenanceTasks, useCloseMaintenanceRequest } from '../../hooks/useMaintenance';

export default function AssignedTasksPage() {
  const { data: assignedTasks = [], isLoading, isError, error } = useAssignedMaintenanceTasks();
  const closeMutation = useCloseMaintenanceRequest();

  const t = MAINTENANCE_TRANSLATIONS.en;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  const [selectedTask, setSelectedTask] = useState(null);
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [closeTarget, setCloseTarget] = useState(null);
  const [closeNotes, setCloseNotes] = useState('');

  const departments = useMemo(
    () => ['All', ...new Set(assignedTasks.map((task) => task.department).filter(Boolean))],
    [assignedTasks]
  );

  const filteredTasks = useMemo(() => {
    return assignedTasks.filter((task) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        !query ||
        task.id.toLowerCase().includes(query) ||
        task.title.toLowerCase().includes(query) ||
        task.assignedTo.toLowerCase().includes(query) ||
        task.department.toLowerCase().includes(query) ||
        task.building?.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
      const matchesDepartment = departmentFilter === 'All' || task.department === departmentFilter;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [assignedTasks, searchTerm, statusFilter, departmentFilter]);

  const stats = useMemo(() => ({
    total: assignedTasks.length,
    assigned: assignedTasks.filter((task) => task.status === 'Assigned').length,
    inProgress: assignedTasks.filter((task) => task.status === 'In Progress').length,
    waiting: assignedTasks.filter((task) => task.status === 'Waiting for Parts').length,
  }), [assignedTasks]);

  const handleOpenCloseModal = (task) => {
    setCloseTarget(task);
    setCloseModalOpen(true);
  };

  const handleConfirmClose = async () => {
    if (!closeTarget) return;
    try {
      await closeMutation.mutateAsync({ code: closeTarget.id, closeNotes });
      toast.success(`Task ${closeTarget.id} marked complete and closed.`);
      setCloseModalOpen(false);
      setCloseNotes('');
      setCloseTarget(null);
      if (selectedTask?.id === closeTarget.id) setSelectedTask(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to close task');
    }
  };

  if (isLoading) {
    return (
      <PrivateLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Spinner size="lg" />
        </div>
      </PrivateLayout>
    );
  }

  if (isError) {
    return (
      <PrivateLayout>
        <div className="mx-auto max-w-3xl rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
          <p className="font-display text-lg font-bold text-rose-900">Failed to load assigned tasks</p>
          <p className="mt-2 text-sm text-rose-700">{error?.response?.data?.message || error.message}</p>
        </div>
      </PrivateLayout>
    );
  }

  return (
    <PrivateLayout>
      <div className="min-h-screen bg-smrmp-parchment p-2 text-[#2B1B12] sm:p-4 lg:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <header className="rounded-3xl border border-[#D4A017]/40 bg-[#FAF0D8] p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D4A017] bg-smrmp-gold px-3 py-0.5 text-[11px] font-black uppercase tracking-wider text-black">
                <ClipboardDocumentCheckIcon className="h-3.5 w-3.5" />
                {t.portal}
              </span>
            </div>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-[#2B1B12] sm:text-4xl">
              {t.assignedTasks}
            </h1>
            <p className="mt-1 max-w-3xl text-xs font-semibold leading-relaxed text-[#6E5445]">
              Track dispatched work orders, technician assignments, and repair progress across museum teams.
            </p>
          </header>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card padding={false} className="border-t-2 border-t-indigo-500 bg-[#FFFDF9] p-4">
              <p className="text-[10px] font-bold uppercase text-smrmp-subtle">Total Active</p>
              <p className="mt-1 font-display text-2xl font-black text-indigo-700">{stats.total}</p>
            </Card>
            <Card padding={false} className="border-t-2 border-t-blue-500 bg-[#FFFDF9] p-4">
              <p className="text-[10px] font-bold uppercase text-smrmp-subtle">Assigned</p>
              <p className="mt-1 font-display text-2xl font-black text-blue-700">{stats.assigned}</p>
            </Card>
            <Card padding={false} className="border-t-2 border-t-amber-500 bg-[#FFFDF9] p-4">
              <p className="text-[10px] font-bold uppercase text-smrmp-subtle">{t.inProgress}</p>
              <p className="mt-1 font-display text-2xl font-black text-amber-700">{stats.inProgress}</p>
            </Card>
            <Card padding={false} className="border-t-2 border-t-purple-500 bg-[#FFFDF9] p-4">
              <p className="text-[10px] font-bold uppercase text-smrmp-subtle">Waiting for Parts</p>
              <p className="mt-1 font-display text-2xl font-black text-purple-700">{stats.waiting}</p>
            </Card>
          </div>

          <Card className="bg-[#FFFDF9] p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-[#7C4A2D]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search task ID, title, technician, department, or building..."
                  className="w-full rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] py-2 pl-9 pr-3 text-xs font-semibold text-[#2B1B12] focus:border-smrmp-gold focus:outline-none"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <FunnelIcon className="hidden h-4 w-4 text-[#7C4A2D] sm:block" />
                <Select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  options={[
                    { value: 'All', label: 'All Statuses' },
                    ...ASSIGNED_TASK_STATUSES.map((status) => ({ value: status, label: status })),
                  ]}
                  className="min-w-[160px]"
                />
                <Select
                  value={departmentFilter}
                  onChange={(event) => setDepartmentFilter(event.target.value)}
                  options={departments.map((department) => ({ value: department, label: department }))}
                  className="min-w-[180px]"
                />
              </div>
            </div>
          </Card>

          {filteredTasks.length === 0 ? (
            <Card className="bg-[#FFFDF9] p-10 text-center">
              <ClipboardDocumentCheckIcon className="mx-auto h-12 w-12 text-[#7C4A2D]/40" />
              <p className="mt-4 font-display text-lg font-bold text-[#2B1B12]">No assigned tasks found</p>
              <p className="mt-1 text-sm text-[#6E5445]">
                {assignedTasks.length === 0
                  ? 'Approved maintenance requests will appear here once dispatched to a technician team.'
                  : 'Try adjusting your search or filters.'}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredTasks.map((task) => (
                <Card key={task.id} className="space-y-3 bg-[#FFFDF9] p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#7C4A2D]">{task.id}</span>
                      <h2 className="mt-1 font-display text-sm font-bold text-[#2B1B12]">{task.title}</h2>
                    </div>
                    <Badge variant={getStatusBadgeVariant(task.status)} size="sm">
                      {task.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant={getPriorityBadgeVariant(task.priority)} size="sm">
                      {task.priority}
                    </Badge>
                    <Badge variant="neutral" size="sm">
                      {task.category}
                    </Badge>
                  </div>

                  <div className="space-y-1 rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] p-3 text-xs text-[#5C4233]">
                    <p className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 shrink-0 text-[#7C4A2D]" />
                      <span><strong>Technician:</strong> {task.assignedTo}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <BuildingOffice2Icon className="h-4 w-4 shrink-0 text-[#7C4A2D]" />
                      <span><strong>Department:</strong> {task.department}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <BuildingOffice2Icon className="h-4 w-4 shrink-0 text-[#7C4A2D]" />
                      <span><strong>Location:</strong> {task.building} • {task.room}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 shrink-0 text-[#7C4A2D]" />
                      <span><strong>Est. Completion:</strong> {task.estimatedCompletion}</span>
                    </p>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button variant="secondary" size="xs" className="flex-1" onClick={() => setSelectedTask(task)}>
                      Inspect Task
                    </Button>
                    <Button variant="gold" size="xs" onClick={() => handleOpenCloseModal(task)}>
                      Complete Work
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        title={selectedTask ? `Task Details (${selectedTask.id})` : 'Task Details'}
      >
        {selectedTask && (
          <div className="space-y-4 text-xs">
            <div className="flex flex-wrap gap-2">
              <Badge variant={getPriorityBadgeVariant(selectedTask.priority)}>{selectedTask.priority}</Badge>
              <Badge variant={getStatusBadgeVariant(selectedTask.status)}>{selectedTask.status}</Badge>
              <Badge variant="neutral">{selectedTask.category}</Badge>
            </div>

            <div>
              <p className="font-bold text-[#7C4A2D]">Title</p>
              <p className="mt-1 font-semibold text-[#2B1B12]">{selectedTask.title}</p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="font-bold text-[#7C4A2D]">Technician</p>
                <p className="mt-1 text-[#2B1B12]">{selectedTask.assignedTo}</p>
              </div>
              <div>
                <p className="font-bold text-[#7C4A2D]">Department</p>
                <p className="mt-1 text-[#2B1B12]">{selectedTask.department}</p>
              </div>
              <div>
                <p className="font-bold text-[#7C4A2D]">Building</p>
                <p className="mt-1 text-[#2B1B12]">{selectedTask.building}</p>
              </div>
              <div>
                <p className="font-bold text-[#7C4A2D]">Est. Completion</p>
                <p className="mt-1 text-[#2B1B12]">{selectedTask.estimatedCompletion}</p>
              </div>
            </div>

            <div>
              <p className="font-bold text-[#7C4A2D]">Description</p>
              <p className="mt-1 leading-relaxed text-[#2B1B12]">{selectedTask.description}</p>
            </div>

            {selectedTask.timeline?.length > 0 && (
              <div>
                <p className="mb-2 font-bold text-[#7C4A2D]">Activity Timeline</p>
                <div className="max-h-40 space-y-2 overflow-y-auto">
                  {selectedTask.timeline.map((entry, index) => (
                    <div key={`${entry.date}-${index}`} className="rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] p-2.5">
                      <div className="flex justify-between gap-2 font-bold text-[#7C4A2D]">
                        <span>{entry.action}</span>
                        <span className="text-[10px] text-[#7C6657]">{entry.date}</span>
                      </div>
                      <p className="mt-1 text-[#2B1B12]">{entry.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setSelectedTask(null)}>
                Close
              </Button>
              <Button variant="gold" size="sm" onClick={() => handleOpenCloseModal(selectedTask)}>
                Complete Work
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={closeModalOpen}
        onClose={() => setCloseModalOpen(false)}
        title={closeTarget ? `Complete Task (${closeTarget.id})` : 'Complete Task'}
      >
        <div className="space-y-4 text-xs">
          <p className="font-semibold text-[#6E5445]">
            Verify repair quality and close work order for: <strong>{closeTarget?.title}</strong>
          </p>
          <div>
            <label className="mb-1 block text-xs font-bold text-[#2B1B12]">Verification Notes</label>
            <textarea
              rows={3}
              value={closeNotes}
              onChange={(event) => setCloseNotes(event.target.value)}
              placeholder="Confirm repair test results and safety checks..."
              className="w-full rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] p-2.5 text-xs text-[#2B1B12]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setCloseModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" size="sm" onClick={handleConfirmClose} disabled={closeMutation.isPending}>
              Verify &amp; Close
            </Button>
          </div>
        </div>
      </Modal>
    </PrivateLayout>
  );
}
