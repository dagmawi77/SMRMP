const formatDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString().slice(0, 16).replace('T', ' ');
};

const formatDateOnly = (value) => {
  if (!value) return 'Pending';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString().slice(0, 10);
};

const serializeMaintenanceRequest = (row) => {
  const plain = row?.get ? row.get({ plain: true }) : row;
  if (!plain) return null;

  return {
    id: plain.request_code,
    title: plain.title,
    category: plain.category,
    priority: plain.priority,
    status: plain.status,
    reportedBy: plain.reported_by || 'Unknown',
    reportDate: formatDateTime(plain.report_date),
    lastUpdated: formatDateTime(plain.updated_at),
    building: plain.building || '',
    floor: plain.floor || '',
    room: plain.room || '',
    hall: plain.hall || '',
    artifactId: plain.artifact_id,
    artifactName: plain.artifact_name,
    equipmentId: plain.equipment_id,
    equipmentName: plain.equipment_name,
    description: plain.description || '',
    assignedTo: plain.assigned_to || 'Unassigned',
    assignedUserId: plain.assigned_user_id || null,
    department: plain.department || 'Pending Dispatch',
    estimatedCompletion: formatDateOnly(plain.estimated_completion),
    isEmergency: Boolean(plain.is_emergency),
    attachments: Array.isArray(plain.attachments) ? plain.attachments : [],
    timeline: Array.isArray(plain.timeline) ? plain.timeline : [],
    comments: Array.isArray(plain.comments) ? plain.comments : [],
  };
};

module.exports = {
  serializeMaintenanceRequest,
  formatDateTime,
};
