'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'users',
        'language_preference',
        {
          type: Sequelize.STRING(2),
          allowNull: false,
          defaultValue: 'en',
        },
        { transaction },
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE users ADD CONSTRAINT users_language_preference_check CHECK (language_preference IN ('en', 'hi'))`,
        { transaction },
      );

      await queryInterface.addColumn(
        'users',
        'theme_preference',
        {
          type: Sequelize.STRING(5),
          allowNull: false,
          defaultValue: 'light',
        },
        { transaction },
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE users ADD CONSTRAINT users_theme_preference_check CHECK (theme_preference IN ('light', 'dark'))`,
        { transaction },
      );
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(
        `ALTER TABLE users DROP CONSTRAINT IF EXISTS users_theme_preference_check`,
        { transaction },
      );
      await queryInterface.removeColumn('users', 'theme_preference', {
        transaction,
      });

      await queryInterface.sequelize.query(
        `ALTER TABLE users DROP CONSTRAINT IF EXISTS users_language_preference_check`,
        { transaction },
      );
      await queryInterface.removeColumn('users', 'language_preference', {
        transaction,
      });
    });
  },
};
