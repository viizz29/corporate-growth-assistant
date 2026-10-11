'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.sequelize.transaction(async (transaction) => {
      const resumeTemplates = [
        {
          name: 'Classic',
          language: 'en',
          is_active: true,
          created_at: now,
          updated_at: now,
        },
        {
          name: 'Modern',
          language: 'en',
          is_active: true,
          created_at: now,
          updated_at: now,
        },
        {
          name: 'Executive',
          language: 'en',
          is_active: true,
          created_at: now,
          updated_at: now,
        },
        {
          name: 'क्लासिक',
          language: 'hi',
          is_active: true,
          created_at: now,
          updated_at: now,
        },
        {
          name: 'आधुनिक',
          language: 'hi',
          is_active: true,
          created_at: now,
          updated_at: now,
        },
      ];

      for (const template of resumeTemplates) {
        await queryInterface.sequelize.query(
          `
            INSERT INTO resume_templates (name, language, is_active, created_at, updated_at)
            VALUES (:name, :language, :is_active, :created_at, :updated_at)
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              language = EXCLUDED.language,
              is_active = EXCLUDED.is_active,
              updated_at = EXCLUDED.updated_at
          `,
          {
            replacements: template,
            type: Sequelize.QueryTypes.INSERT,
            transaction,
          },
        );
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {});
  },
};
