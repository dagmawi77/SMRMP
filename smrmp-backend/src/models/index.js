const sequelize = require('../config/database');

const User = require('./User');
const Role = require('./Role');
const Permission = require('./Permission');
const RolePermission = require('./RolePermission');
const Artifact = require('./Artifact');
const ArtifactImage = require('./ArtifactImage');
const Exhibition = require('./Exhibition');
const ConservationLog = require('./ConservationLog');
const Ticket = require('./Ticket');
const TicketType = require('./TicketType');
const AuditLog = require('./AuditLog');
const VisitorFeedback = require('./VisitorFeedback');

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

module.exports = {
  sequelize,
  User,
  Role,
  Permission,
  RolePermission,
  Artifact,
  ArtifactImage,
  Exhibition,
  ConservationLog,
  Ticket,
  TicketType,
  AuditLog,
  VisitorFeedback,
};
