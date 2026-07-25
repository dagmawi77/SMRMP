'use strict';

/**
 * Some users have legacy users.role set (e.g. 'curator') but role_id NULL.
 * RBAC permissions load only via role_id → rbacRole → permissions, so those
 * accounts get an empty permission set and receive 403 on every gated API.
 */

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      UPDATE users AS u
      SET role_id = r.id,
          updated_at = NOW()
      FROM roles AS r
      WHERE u.role_id IS NULL
        AND u.role IS NOT NULL
        AND r.slug = u.role::text
        AND r.is_active = true
    `);
  },

  async down() {
    // Non-destructive: do not null out role_id after backfill.
  },
};
