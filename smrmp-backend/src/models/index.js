const User = require('./User');
const Artifact = require('./Artifact');
const ArtifactImage = require('./ArtifactImage');
const Exhibition = require('./Exhibition');
const ExhibitionArtifact = require('./ExhibitionArtifact');
const ConservationLog = require('./ConservationLog');
const Ticket = require('./Ticket');
const AuditLog = require('./AuditLog');
const sequelize = require('../config/database');

// TODO: define model associations

const db = {
  sequelize,
  User,
  Artifact,
  ArtifactImage,
  Exhibition,
  ExhibitionArtifact,
  ConservationLog,
  Ticket,
  AuditLog,
};

module.exports = db;
