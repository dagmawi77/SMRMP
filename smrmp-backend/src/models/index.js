const sequelize = require('../config/database');
const User = require('./User');
const Artifact = require('./Artifact');
const ArtifactImage = require('./ArtifactImage');
const Exhibition = require('./Exhibition');
const ExhibitionArtifact = require('./ExhibitionArtifact');
const ConservationLog = require('./ConservationLog');
const TicketType = require('./TicketType');
const Ticket = require('./Ticket');
const AuditLog = require('./AuditLog');

// User ↔ Artifact
User.hasMany(Artifact, { foreignKey: 'created_by', as: 'createdArtifacts' });
Artifact.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
User.hasMany(Artifact, { foreignKey: 'last_edited_by', as: 'editedArtifacts' });
Artifact.belongsTo(User, { foreignKey: 'last_edited_by', as: 'lastEditor' });

// Artifact ↔ Images
Artifact.hasMany(ArtifactImage, {
  foreignKey: 'artifact_id',
  as: 'images',
  onDelete: 'CASCADE',
});
ArtifactImage.belongsTo(Artifact, { foreignKey: 'artifact_id', as: 'artifact' });

// Exhibition ↔ Artifacts (M2M)
Exhibition.belongsToMany(Artifact, {
  through: ExhibitionArtifact,
  foreignKey: 'exhibition_id',
  otherKey: 'artifact_id',
  as: 'artifacts',
});
Artifact.belongsToMany(Exhibition, {
  through: ExhibitionArtifact,
  foreignKey: 'artifact_id',
  otherKey: 'exhibition_id',
  as: 'exhibitions',
});
Exhibition.hasMany(ExhibitionArtifact, {
  foreignKey: 'exhibition_id',
  as: 'exhibitionArtifacts',
});
ExhibitionArtifact.belongsTo(Exhibition, {
  foreignKey: 'exhibition_id',
  as: 'exhibition',
});
ExhibitionArtifact.belongsTo(Artifact, {
  foreignKey: 'artifact_id',
  as: 'artifact',
});
Exhibition.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Conservation
Artifact.hasMany(ConservationLog, {
  foreignKey: 'artifact_id',
  as: 'conservationLogs',
});
ConservationLog.belongsTo(Artifact, {
  foreignKey: 'artifact_id',
  as: 'artifact',
});
User.hasMany(ConservationLog, {
  foreignKey: 'inspector_id',
  as: 'inspections',
});
ConservationLog.belongsTo(User, {
  foreignKey: 'inspector_id',
  as: 'inspector',
});

// Audit
User.hasMany(AuditLog, { foreignKey: 'user_id', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

const db = {
  sequelize,
  User,
  Artifact,
  ArtifactImage,
  Exhibition,
  ExhibitionArtifact,
  ConservationLog,
  TicketType,
  Ticket,
  AuditLog,
};

module.exports = db;
