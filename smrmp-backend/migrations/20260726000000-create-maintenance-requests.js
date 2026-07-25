'use strict';

const { DataTypes } = require('sequelize');
const { randomUUID } = require('crypto');
const { PERMISSIONS, ROLE_PERMISSION_MAP } = require('../src/config/rbacCatalog');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('maintenance_requests', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      request_code: {
        type: DataTypes.STRING(32),
        allowNull: false,
        unique: true,
      },
      title: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      priority: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'Medium',
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'New',
      },
      reported_by: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      report_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      building: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      floor: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      room: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      hall: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      artifact_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      artifact_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      equipment_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      equipment_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      assigned_to: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      department: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      estimated_completion: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      is_emergency: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      attachments: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      timeline: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      comments: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('maintenance_requests', ['status']);
    await queryInterface.addIndex('maintenance_requests', ['priority']);
    await queryInterface.addIndex('maintenance_requests', ['category']);
    await queryInterface.addIndex('maintenance_requests', ['report_date']);

    const now = new Date();
    const maintenancePerms = PERMISSIONS.filter((p) => p.module === 'maintenance');

    for (const perm of maintenancePerms) {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM permissions WHERE code = :code LIMIT 1`,
        { replacements: { code: perm.code } }
      );

      if (!existing.length) {
        await queryInterface.bulkInsert('permissions', [
          {
            id: randomUUID(),
            code: perm.code,
            module: perm.module,
            description: perm.description,
            created_at: now,
            updated_at: now,
          },
        ]);
      }
    }

    const [roleRows] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM roles WHERE slug = 'maintenance' LIMIT 1`
    );
    if (roleRows.length) {
      const roleId = roleRows[0].id;
      const codes = ROLE_PERMISSION_MAP.maintenance || [];

      for (const code of codes) {
        const [permRows] = await queryInterface.sequelize.query(
          `SELECT id FROM permissions WHERE code = :code LIMIT 1`,
          { replacements: { code } }
        );
        if (!permRows.length) continue;

        const permissionId = permRows[0].id;
        const [existingLink] = await queryInterface.sequelize.query(
          `SELECT role_id FROM role_permissions WHERE role_id = :roleId AND permission_id = :permissionId LIMIT 1`,
          { replacements: { roleId, permissionId } }
        );

        if (!existingLink.length) {
          await queryInterface.bulkInsert('role_permissions', [
            {
              role_id: roleId,
              permission_id: permissionId,
            },
          ]);
        }
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('maintenance_requests');

    const maintenanceCodes = PERMISSIONS.filter((p) => p.module === 'maintenance').map(
      (p) => p.code
    );

    if (maintenanceCodes.length) {
      await queryInterface.sequelize.query(
        `DELETE FROM role_permissions WHERE permission_id IN (
          SELECT id FROM permissions WHERE code IN (:codes)
        )`,
        { replacements: { codes: maintenanceCodes } }
      );
      await queryInterface.sequelize.query(
        `DELETE FROM permissions WHERE code IN (:codes)`,
        { replacements: { codes: maintenanceCodes } }
      );
    }
  },
};
