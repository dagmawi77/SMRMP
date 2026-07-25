'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // 1. users
    await queryInterface.createTable('users', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM(
          'admin',
          'curator',
          'conservation',
          'maintenance',
          'researcher',
          'visitor'
        ),
        allowNull: false,
        defaultValue: 'visitor',
      },
      museum_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      last_login: {
        type: DataTypes.DATE,
        allowNull: true,
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

    // 2. artifacts
    await queryInterface.createTable('artifacts', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      category: {
        type: DataTypes.ENUM(
          'weapon',
          'textile',
          'document',
          'ceramic',
          'jewelry',
          'ceremonial',
          'photograph',
          'coin',
          'other'
        ),
        allowNull: false,
      },
      historical_period: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      origin: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      materials: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      ai_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      description_source: {
        type: DataTypes.ENUM('manual', 'ai_approved', 'ai_draft'),
        allowNull: true,
        defaultValue: 'manual',
      },
      location: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      condition_status: {
        type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor', 'critical'),
        allowNull: true,
        defaultValue: 'good',
      },
      qr_code: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      keywords: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: true,
        defaultValue: [],
      },
      is_on_loan: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      last_edited_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    });

    // 3. artifact_images
    await queryInterface.createTable('artifact_images', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      artifact_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'artifacts', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      file_path: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      file_url: {
        type: DataTypes.STRING(1000),
        allowNull: false,
      },
      is_primary: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      uploaded_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
    });

    // 4. exhibitions
    await queryInterface.createTable('exhibitions', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      theme: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      gallery: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('planning', 'active', 'closed', 'cancelled'),
        allowNull: true,
        defaultValue: 'planning',
      },
      expected_visitors: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      actual_visitors: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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

    // 5. exhibition_artifacts (join)
    await queryInterface.createTable('exhibition_artifacts', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      exhibition_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'exhibitions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      artifact_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'artifacts', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      display_order: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      added_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.addConstraint('exhibition_artifacts', {
      fields: ['exhibition_id', 'artifact_id'],
      type: 'unique',
      name: 'exhibition_artifacts_exhibition_id_artifact_id_unique',
    });

    // 6. conservation_logs
    await queryInterface.createTable('conservation_logs', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      artifact_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'artifacts', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      inspector_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      condition_before: {
        type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor', 'critical'),
        allowNull: true,
      },
      condition_after: {
        type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor', 'critical'),
        allowNull: true,
      },
      observations: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      action_taken: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      next_inspection_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      requires_restoration: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      restoration_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      inspected_at: {
        type: DataTypes.DATE,
        allowNull: false,
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

    // 7. tickets
    await queryInterface.createTable('tickets', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      ticket_type: {
        type: DataTypes.ENUM('adult', 'student', 'child', 'group', 'vip'),
        allowNull: false,
      },
      visitor_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      visitor_email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      visitor_phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      payment_method: {
        type: DataTypes.ENUM('telebirr', 'bank', 'cash'),
        allowNull: true,
      },
      payment_status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
        allowNull: true,
        defaultValue: 'pending',
      },
      payment_reference: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      qr_ticket_code: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      status: {
        type: DataTypes.ENUM('valid', 'used', 'cancelled', 'expired'),
        allowNull: true,
        defaultValue: 'valid',
      },
      visit_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      used_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      is_sandbox: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
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

    // 8. audit_logs
    await queryInterface.createTable('audit_logs', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      action: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      table_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      record_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      old_values: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      new_values: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      user_agent: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('audit_logs');
    await queryInterface.dropTable('tickets');
    await queryInterface.dropTable('conservation_logs');
    await queryInterface.dropTable('exhibition_artifacts');
    await queryInterface.dropTable('exhibitions');
    await queryInterface.dropTable('artifact_images');
    await queryInterface.dropTable('artifacts');
    await queryInterface.dropTable('users');

    // Clean up ENUM types created by Sequelize
    const enums = [
      'enum_users_role',
      'enum_artifacts_category',
      'enum_artifacts_description_source',
      'enum_artifacts_condition_status',
      'enum_exhibitions_status',
      'enum_conservation_logs_condition_before',
      'enum_conservation_logs_condition_after',
      'enum_tickets_ticket_type',
      'enum_tickets_payment_method',
      'enum_tickets_payment_status',
      'enum_tickets_status',
    ];

    for (const enumName of enums) {
      await queryInterface.sequelize.query(
        `DROP TYPE IF EXISTS "public"."${enumName}";`
      );
    }
  },
};
