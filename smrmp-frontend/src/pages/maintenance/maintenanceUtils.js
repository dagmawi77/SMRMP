export const ASSIGNED_TASK_STATUSES = ['Assigned', 'In Progress', 'Waiting for Parts'];

export const isAssignedTask = (request) => ASSIGNED_TASK_STATUSES.includes(request.status);

export const getPriorityBadgeVariant = (priority) => {
  if (priority === 'Critical') return 'danger';
  if (priority === 'High') return 'warning';
  if (priority === 'Medium') return 'info';
  return 'neutral';
};

export const getStatusBadgeVariant = (status) => {
  if (status === 'Completed' || status === 'Verified' || status === 'Closed') return 'success';
  if (status === 'In Progress' || status === 'Approved' || status === 'Assigned') return 'gold';
  if (status === 'Rejected') return 'danger';
  return 'warning';
};
