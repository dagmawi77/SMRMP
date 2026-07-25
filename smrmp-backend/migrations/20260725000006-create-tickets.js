'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ticket_types', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      type: { type: Sequelize.STRING(50), allowNull: false, unique: true },
      label: { type: Sequelize.STRING(100), allowNull: false },
      price_etb: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
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

    await queryInterface.createTable('tickets', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      qr_ticket_code: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      ticket_type: { type: Sequelize.STRING(50), allowNull: false },
      quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      unit_price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      total_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      visitor_name: { type: Sequelize.STRING(255), allowNull: false },
      visitor_phone: { type: Sequelize.STRING(50), allowNull: false },
      visit_date: { type: Sequelize.DATEONLY, allowNull: false },
      payment_method: {
        type: Sequelize.ENUM('telebirr', 'chapa', 'cash'),
        allowNull: false,
        defaultValue: 'telebirr',
      },
      payment_status: {
        type: Sequelize.ENUM('pending', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
      },
      payment_reference: { type: Sequelize.STRING(100), allowNull: true },
      status: {
        type: Sequelize.ENUM('valid', 'used', 'cancelled'),
        allowNull: false,
        defaultValue: 'valid',
      },
      used_at: { type: Sequelize.DATE, allowNull: true },
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

    await queryInterface.addIndex('tickets', ['qr_ticket_code'], { unique: true });
    await queryInterface.addIndex('tickets', ['payment_status']);
    await queryInterface.addIndex('tickets', ['visit_date']);
    await queryInterface.addIndex('tickets', ['created_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tickets');
    await queryInterface.dropTable('ticket_types');
  },
};
