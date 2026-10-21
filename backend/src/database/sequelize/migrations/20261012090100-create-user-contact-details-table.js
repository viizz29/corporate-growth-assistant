'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(
        "CREATE TYPE \"enum_user_gender\" AS ENUM ('Male', 'Female', 'Others');",
        { transaction },
      );

      await queryInterface.createTable(
        'user_contact_details',
        {
          user_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: 'users',
              key: 'user_id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
            primaryKey: true,
          },
          email: {
            type: Sequelize.STRING(255),
            allowNull: true,
          },
          phone: {
            type: Sequelize.STRING(20),
            allowNull: true,
          },
          gender: {
            type: 'enum_user_gender',
            allowNull: true,
          },
          github_url: {
            type: Sequelize.STRING(255),
            allowNull: true,
          },
          linkedin_url: {
            type: Sequelize.STRING(255),
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
        },
        { transaction },
      );

      await queryInterface.addIndex('user_contact_details', ['user_id'], {
        transaction,
      });
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable('user_contact_details', { transaction });

      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_user_gender";',
        { transaction },
      );
    });
  },
};
