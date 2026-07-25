'use strict';

const {
  SYSTEM_ROLES,
  PERMISSIONS,
  ROLE_PERMISSION_MAP,
  createIds,
} = require('../src/config/rbacCatalog');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('roles', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      is_system: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('permissions', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      code: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      module: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('role_permissions', {
      role_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: { model: 'roles', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      permission_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: { model: 'permissions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    const { roleIds, permissionIds } = createIds();
    const now = new Date();

    await queryInterface.bulkInsert(
      'roles',
      SYSTEM_ROLES.map((role) => ({
        id: roleIds[role.slug],
        slug: role.slug,
        name: role.name,
        description: role.description,
        is_system: true,
        is_active: true,
        created_at: now,
        updated_at: now,
      }))
    );

    await queryInterface.bulkInsert(
      'permissions',
      PERMISSIONS.map((perm) => ({
        id: permissionIds[perm.code],
        code: perm.code,
        module: perm.module,
        description: perm.description,
        created_at: now,
        updated_at: now,
      }))
    );

    const rolePermissionRows = [];
    for (const [slug, codes] of Object.entries(ROLE_PERMISSION_MAP)) {
      for (const code of codes) {
        rolePermissionRows.push({
          role_id: roleIds[slug],
          permission_id: permissionIds[code],
          created_at: now,
        });
      }
    }
    if (rolePermissionRows.length) {
      await queryInterface.bulkInsert('role_permissions', rolePermissionRows);
    }

    await queryInterface.addColumn('users', 'role_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'roles', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('users', 'must_change_password', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    for (const role of SYSTEM_ROLES) {
      await queryInterface.sequelize.query(
        `UPDATE users SET role_id = :roleId WHERE role = :slug AND role_id IS NULL`,
        { replacements: { roleId: roleIds[role.slug], slug: role.slug } }
      );
    }

    // Any leftover rows default to visitor
    await queryInterface.sequelize.query(
      `UPDATE users SET role_id = :roleId WHERE role_id IS NULL`,
      { replacements: { roleId: roleIds.visitor } }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'must_change_password');
    await queryInterface.removeColumn('users', 'role_id');
    await queryInterface.dropTable('role_permissions');
    await queryInterface.dropTable('permissions');
    await queryInterface.dropTable('roles');
  },
};
