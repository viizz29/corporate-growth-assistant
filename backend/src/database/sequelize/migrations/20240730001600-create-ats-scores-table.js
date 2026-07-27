'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'ats_scores',
        {
          id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.literal('gen_random_uuid()'),
            primaryKey: true,
            allowNull: false,
          },
          user_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: 'users',
              key: 'user_id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          job_ad_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: 'job_advertisements',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          ats_score: {
            type: Sequelize.DECIMAL(5, 2),
            allowNull: false,
          },
          recommendations: {
            type: Sequelize.JSONB,
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

      await queryInterface.addIndex(
        'ats_scores',
        ['user_id', 'job_ad_id'],
        {
          unique: true,
          transaction,
        },
      );

      await queryInterface.addIndex('ats_scores', ['user_id'], {
        transaction,
      });

      await queryInterface.addIndex('ats_scores', ['job_ad_id'], {
        transaction,
      });
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ats_scores');
  },
};
