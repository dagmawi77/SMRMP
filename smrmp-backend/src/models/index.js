const sequelize = require('../config/database');

const User = require('./User');
const Role = require('./Role');
const Permission = require('./Permission');
const RolePermission = require('./RolePermission');
const Artifact = require('./Artifact');
const ArtifactImage = require('./ArtifactImage');
const ArtifactNarration = require('./ArtifactNarration');
const Exhibition = require('./Exhibition');
const ConservationLog = require('./ConservationLog');
const Ticket = require('./Ticket');
const TicketType = require('./TicketType');
const AuditLog = require('./AuditLog');
const Visitor = require('./Visitor');
const VisitLog = require('./VisitLog');
const MembershipTier = require('./MembershipTier');
const Membership = require('./Membership');
const GroupBooking = require('./GroupBooking');
const VisitorFeedback = require('./VisitorFeedback');
const VisitorCommunication = require('./VisitorCommunication');
const MaintenanceRequest = require('./MaintenanceRequest');

// ─── RBAC ASSOCIATIONS ───────────────────────────────────────────
Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'role_id',
  otherKey: 'permission_id',
  as: 'permissions',
});

Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permission_id',
  otherKey: 'role_id',
  as: 'roles',
});

RolePermission.belongsTo(Role, { foreignKey: 'role_id' });
RolePermission.belongsTo(Permission, { foreignKey: 'permission_id' });

User.belongsTo(Role, { foreignKey: 'role_id', as: 'rbacRole' });
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });

// ─── USER ASSOCIATIONS ───────────────────────────────────────────
User.hasMany(Artifact, {
  as: 'created_artifacts',
  foreignKey: 'created_by',
});

User.hasMany(ConservationLog, {
  as: 'inspections',
  foreignKey: 'inspector_id',
});

User.hasMany(AuditLog, {
  foreignKey: 'user_id',
});

// ─── ARTIFACT ASSOCIATIONS ───────────────────────────────────────
Artifact.belongsTo(User, {
  as: 'creator',
  foreignKey: 'created_by',
});

Artifact.hasMany(ArtifactImage, {
  as: 'images',
  foreignKey: 'artifact_id',
});

Artifact.hasMany(ConservationLog, {
  as: 'conservation_history',
  foreignKey: 'artifact_id',
});

Artifact.hasMany(ArtifactNarration, {
  as: 'narrations',
  foreignKey: 'artifact_id',
});

Artifact.belongsToMany(Exhibition, {
  through: 'exhibition_artifacts',
  foreignKey: 'artifact_id',
  otherKey: 'exhibition_id',
  as: 'exhibitions',
});

// ─── ARTIFACT IMAGE ASSOCIATIONS ─────────────────────────────────
ArtifactImage.belongsTo(Artifact, {
  foreignKey: 'artifact_id',
});

// ─── ARTIFACT NARRATION ASSOCIATIONS ─────────────────────────────
ArtifactNarration.belongsTo(Artifact, {
  foreignKey: 'artifact_id',
  as: 'artifact',
});

ArtifactNarration.belongsTo(User, {
  foreignKey: 'generated_by',
  as: 'generatedBy',
});

// ─── EXHIBITION ASSOCIATIONS ─────────────────────────────────────
Exhibition.belongsToMany(Artifact, {
  through: 'exhibition_artifacts',
  foreignKey: 'exhibition_id',
  otherKey: 'artifact_id',
  as: 'artifacts',
});

// ─── CONSERVATION LOG ASSOCIATIONS ───────────────────────────────
ConservationLog.belongsTo(Artifact, {
  foreignKey: 'artifact_id',
  as: 'artifact',
});

ConservationLog.belongsTo(User, {
  foreignKey: 'inspector_id',
  as: 'inspector',
});

// ─── AUDIT LOG ASSOCIATIONS ──────────────────────────────────────
AuditLog.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// ─── VISITOR & MEMBER MANAGEMENT ASSOCIATIONS (Module 8) ─────────
Visitor.hasMany(VisitLog, { as: 'visits', foreignKey: 'visitor_id' });
Visitor.hasMany(Membership, { as: 'memberships', foreignKey: 'visitor_id' });
Visitor.hasMany(VisitorFeedback, { as: 'feedback', foreignKey: 'visitor_id' });
Visitor.hasMany(VisitorCommunication, {
  as: 'communications',
  foreignKey: 'visitor_id',
});
Visitor.belongsTo(User, { as: 'registeredBy', foreignKey: 'registered_by' });
Visitor.belongsTo(User, { as: 'userAccount', foreignKey: 'user_account_id' });

Membership.belongsTo(Visitor, { foreignKey: 'visitor_id' });
Membership.belongsTo(MembershipTier, { as: 'tier', foreignKey: 'tier_id' });
Membership.belongsTo(User, { as: 'createdBy', foreignKey: 'created_by' });

MembershipTier.hasMany(Membership, { as: 'memberships', foreignKey: 'tier_id' });

VisitLog.belongsTo(Visitor, { foreignKey: 'visitor_id' });
VisitLog.belongsTo(Ticket, { foreignKey: 'ticket_id' });
VisitLog.belongsTo(GroupBooking, { foreignKey: 'group_booking_id' });
VisitLog.belongsTo(User, { as: 'staff', foreignKey: 'staff_id' });

GroupBooking.hasMany(VisitLog, { foreignKey: 'group_booking_id' });
GroupBooking.belongsTo(User, { as: 'assignedStaff', foreignKey: 'assigned_staff_id' });
GroupBooking.belongsTo(User, { as: 'createdBy', foreignKey: 'created_by' });

VisitorFeedback.belongsTo(Visitor, { foreignKey: 'visitor_id' });
VisitorFeedback.belongsTo(VisitLog, { foreignKey: 'visit_log_id' });
VisitorFeedback.belongsTo(User, { as: 'responder', foreignKey: 'responded_by' });

VisitorCommunication.belongsTo(Visitor, { foreignKey: 'visitor_id' });

module.exports = {
  sequelize,
  User,
  Role,
  Permission,
  RolePermission,
  Artifact,
  ArtifactImage,
  ArtifactNarration,
  Exhibition,
  ConservationLog,
  Ticket,
  TicketType,
  AuditLog,
  Visitor,
  VisitLog,
  MembershipTier,
  Membership,
  GroupBooking,
  VisitorFeedback,
  VisitorCommunication,
  MaintenanceRequest,
};
