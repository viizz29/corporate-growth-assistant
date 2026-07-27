'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'resume_templates',
        {
          id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.literal('gen_random_uuid()'),
            primaryKey: true,
            allowNull: false,
          },
          name: {
            type: Sequelize.STRING(255),
            allowNull: false,
          },
          language: {
            type: Sequelize.STRING(2),
            allowNull: false,
          },
          is_active: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
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
        },
        { transaction },
      );

      await queryInterface.sequelize.query(
        `ALTER TABLE resume_templates ADD CONSTRAINT resume_templates_language_check CHECK (language IN ('en', 'hi'))`,
        { transaction },
      );

      await queryInterface.addIndex('resume_templates', ['language'], {
        transaction,
      });

      await queryInterface.addIndex('resume_templates', ['is_active'], {
        transaction,
      });
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(
        `ALTER TABLE resume_templates DROP CONSTRAINT IF EXISTS resume_templates_language_check`,
        { transaction },
      );
      await queryInterface.dropTable('resume_templates', { transaction });
    });
  },
};
