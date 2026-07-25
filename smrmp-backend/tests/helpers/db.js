/**
 * Shared test bootstrap: sync schema + seed RBAC system roles/permissions.
 */
const { sequelize } = require('../../src/models');
const { seedRbacForTests } = require('../../src/utils/seedRbac');

async function resetDbWithRbac() {
  await sequelize.sync({ force: true });
  return seedRbacForTests();
}

module.exports = { resetDbWithRbac };
