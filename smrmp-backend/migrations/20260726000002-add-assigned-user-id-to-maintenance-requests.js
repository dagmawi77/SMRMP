'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn('maintenance_requests', 'assigned_user_id', {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addIndex('maintenance_requests', ['assigned_user_id']);

    await queryInterface.sequelize.query(`
      UPDATE maintenance_requests mr
      SET assigned_user_id = u.id
      FROM users u
      WHERE mr.assigned_user_id IS NULL
        AND mr.assigned_to IS NOT NULL
        AND mr.assigned_to <> 'Unassigned'
        AND mr.assigned_to ILIKE u.name || '%'
    `);

    const [maintenanceUsers] = await queryInterface.sequelize.query(`
      SELECT id, name FROM users WHERE role = 'maintenance' ORDER BY created_at ASC
    `);

    if (!maintenanceUsers.length) return;

    const [unlinkedTasks] = await queryInterface.sequelize.query(`
      SELECT id, assigned_to
      FROM maintenance_requests
      WHERE assigned_user_id IS NULL
        AND status IN ('Assigned', 'In Progress', 'Waiting for Parts')
        AND assigned_to IS NOT NULL
        AND assigned_to <> 'Unassigned'
      ORDER BY report_date DESC
    `);

    for (let i = 0; i < unlinkedTasks.length; i += 1) {
      const task = unlinkedTasks[i];
      const user = maintenanceUsers[i % maintenanceUsers.length];
      await queryInterface.sequelize.query(
        `
          UPDATE maintenance_requests
          SET assigned_user_id = :userId,
              assigned_to = :assignedTo,
              updated_at = NOW()
          WHERE id = :taskId
        `,
        {
          replacements: {
            userId: user.id,
            assignedTo: `${user.name} (Maintenance)`,
            taskId: task.id,
          },
        }
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('maintenance_requests', ['assigned_user_id']);
    await queryInterface.removeColumn('maintenance_requests', 'assigned_user_id');
  },
};
