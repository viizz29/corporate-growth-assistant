'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'generated_resumes',
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
          resume_template_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: 'resume_templates',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          ats_score: {
            type: Sequelize.DECIMAL(5, 2),
            allowNull: false,
          },
          file_path: {
            type: Sequelize.STRING(512),
            allowNull: false,
          },
          generated_at: {
            type: Sequelize.DATE,
            allowNull: false,
          },
        },
        { transaction },
      );

      await queryInterface.addIndex('generated_resumes', ['user_id'], {
        transaction,
      });

      await queryInterface.addIndex('generated_resumes', ['job_ad_id'], {
        transaction,
      });

      await queryInterface.addIndex('generated_resumes', ['resume_template_id'], {
        transaction,
      });
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('generated_resumes');
  },
};
