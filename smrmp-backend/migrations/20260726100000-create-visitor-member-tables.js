'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // 1. membership_tiers
    await queryInterface.createTable('membership_tiers', {
      id: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
      name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      slug: { type: DataTypes.STRING(50), allowNull: false, unique: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      price_etb: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      duration_months: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 12 },
      benefits: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
      max_guests: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      discount_percent: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      display_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      created_at: { type: DataTypes.DATE, allowNull: false },
      updated_at: { type: DataTypes.DATE, allowNull: false },
    });

    // 2. visitors
    await queryInterface.createTable('visitors', {
      id: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
      first_name: { type: DataTypes.STRING(150), allowNull: false },
      last_name: { type: DataTypes.STRING(150), allowNull: true },
      email: { type: DataTypes.STRING(255), allowNull: true },
      phone: { type: DataTypes.STRING(50), allowNull: true },
      gender: { type: DataTypes.STRING(30), allowNull: true },
      date_of_birth: { type: DataTypes.DATEONLY, allowNull: true },
      nationality: { type: DataTypes.STRING(100), allowNull: true },
      national_id: { type: DataTypes.STRING(50), allowNull: true },
      address: { type: DataTypes.STRING(500), allowNull: true },
      visitor_type: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'individual' },
      photo_url: { type: DataTypes.STRING(1000), allowNull: true },
      preferred_language: { type: DataTypes.STRING(20), allowNull: true, defaultValue: 'en' },
      marketing_opt_in: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      is_blacklisted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      total_visits: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      total_spent: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      last_visit_at: { type: DataTypes.DATE, allowNull: true },
      notes: { type: DataTypes.TEXT, allowNull: true },
      registered_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      user_account_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at: { type: DataTypes.DATE, allowNull: false },
      updated_at: { type: DataTypes.DATE, allowNull: false },
      deleted_at: { type: DataTypes.DATE, allowNull: true },
    });

    // 3. memberships
    await queryInterface.createTable('memberships', {
      id: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
      membership_number: { type: DataTypes.STRING(50), allowNull: false, unique: true },
      visitor_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'visitors', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      tier_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'membership_tiers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      status: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'pending' },
      start_date: { type: DataTypes.DATEONLY, allowNull: false },
      end_date: { type: DataTypes.DATEONLY, allowNull: false },
      price_paid: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      payment_method: { type: DataTypes.STRING(50), allowNull: true },
      payment_reference: { type: DataTypes.STRING(100), allowNull: true },
      auto_renew: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      qr_code: { type: DataTypes.STRING(100), allowNull: true, unique: true },
      card_issued: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      renewal_reminder_sent_at: { type: DataTypes.DATE, allowNull: true },
      cancelled_at: { type: DataTypes.DATE, allowNull: true },
      cancellation_reason: { type: DataTypes.TEXT, allowNull: true },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at: { type: DataTypes.DATE, allowNull: false },
      updated_at: { type: DataTypes.DATE, allowNull: false },
    });

    // 4. group_bookings
    await queryInterface.createTable('group_bookings', {
      id: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
      booking_reference: { type: DataTypes.STRING(50), allowNull: false, unique: true },
      group_name: { type: DataTypes.STRING(255), allowNull: false },
      group_type: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'other' },
      contact_name: { type: DataTypes.STRING(255), allowNull: false },
      contact_email: { type: DataTypes.STRING(255), allowNull: true },
      contact_phone: { type: DataTypes.STRING(50), allowNull: false },
      visitor_count: { type: DataTypes.INTEGER, allowNull: false },
      visit_date: { type: DataTypes.DATEONLY, allowNull: false },
      visit_time: { type: DataTypes.STRING(20), allowNull: true },
      guide_required: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      special_requirements: { type: DataTypes.TEXT, allowNull: true },
      price_per_person: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      status: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'pending' },
      payment_status: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'pending' },
      payment_reference: { type: DataTypes.STRING(100), allowNull: true },
      invoice_number: { type: DataTypes.STRING(50), allowNull: true },
      assigned_staff_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      confirmed_at: { type: DataTypes.DATE, allowNull: true },
      completed_at: { type: DataTypes.DATE, allowNull: true },
      cancelled_at: { type: DataTypes.DATE, allowNull: true },
      cancellation_reason: { type: DataTypes.TEXT, allowNull: true },
      notes: { type: DataTypes.TEXT, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false },
      updated_at: { type: DataTypes.DATE, allowNull: false },
    });

    // 5. visit_logs
    await queryInterface.createTable('visit_logs', {
      id: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
      visitor_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'visitors', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      ticket_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'tickets', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      group_booking_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'group_bookings', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      staff_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      entry_method: { type: DataTypes.STRING(50), allowNull: false },
      visitor_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      entry_time: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      exit_time: { type: DataTypes.DATE, allowNull: true },
      purpose: { type: DataTypes.STRING(100), allowNull: true },
      notes: { type: DataTypes.TEXT, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false },
      updated_at: { type: DataTypes.DATE, allowNull: false },
    });

    // 6. visitor_feedback — deferred to 20260726105000 repair migration
    //    (legacy telegram table may already occupy this name)

    // 7. visitor_communications
    await queryInterface.createTable('visitor_communications', {
      id: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
      visitor_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'visitors', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      channel: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'email' },
      type: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'other' },
      subject: { type: DataTypes.STRING(255), allowNull: true },
      message: { type: DataTypes.TEXT, allowNull: false },
      status: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'sent' },
      sent_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    });

    // ─── Indexes (IF NOT EXISTS for safe re-runs) ────────────────
    const indexes = [
      ['visitors', 'visitors_email', ['email']],
      ['visitors', 'visitors_phone', ['phone']],
      ['visitors', 'visitors_visitor_type', ['visitor_type']],
      ['visitors', 'visitors_national_id', ['national_id']],
      ['memberships', 'memberships_visitor_id', ['visitor_id']],
      ['memberships', 'memberships_tier_id', ['tier_id']],
      ['memberships', 'memberships_status', ['status']],
      ['memberships', 'memberships_end_date', ['end_date']],
      ['group_bookings', 'group_bookings_visit_date', ['visit_date']],
      ['group_bookings', 'group_bookings_status', ['status']],
      ['group_bookings', 'group_bookings_group_type', ['group_type']],
      ['visit_logs', 'visit_logs_visitor_id', ['visitor_id']],
      ['visit_logs', 'visit_logs_ticket_id', ['ticket_id']],
      ['visit_logs', 'visit_logs_group_booking_id', ['group_booking_id']],
      ['visit_logs', 'visit_logs_entry_method', ['entry_method']],
      ['visit_logs', 'visit_logs_entry_time', ['entry_time']],
      ['visitor_communications', 'visitor_communications_visitor_id', ['visitor_id']],
      ['visitor_communications', 'visitor_communications_sent_at', ['sent_at']],
    ];

    for (const [table, name, fields] of indexes) {
      await queryInterface.sequelize.query(
        `CREATE INDEX IF NOT EXISTS "${name}" ON "${table}" (${fields.map((f) => `"${f}"`).join(', ')})`
      );
    }
  },

  async down(queryInterface) {
    // Sequelize's Postgres dropTable emits `DROP TABLE IF EXISTS ... CASCADE`.
    await queryInterface.dropTable('visitor_communications', { cascade: true });
    await queryInterface.dropTable('visit_logs', { cascade: true });
    await queryInterface.dropTable('group_bookings', { cascade: true });
    await queryInterface.dropTable('memberships', { cascade: true });
    await queryInterface.dropTable('visitors', { cascade: true });
    await queryInterface.dropTable('membership_tiers', { cascade: true });
  },
};
