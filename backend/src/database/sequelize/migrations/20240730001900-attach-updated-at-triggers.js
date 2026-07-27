'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = [
      'users',
      'password_reset_tokens',
      'user_otps',
      'user_educations',
      'user_work_experiences',
      'user_skills',
      'user_projects',
      'job_advertisements',
      'ats_scores',
      'resume_templates',
    ];

    for (const table of tables) {
      await queryInterface.sequelize.query(`
        CREATE TRIGGER update_${table}_updated_at
        BEFORE UPDATE ON ${table}
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `);
    }
  },

  async down(queryInterface, Sequelize) {
    const tables = [
      'users',
      'password_reset_tokens',
      'user_otps',
      'user_educations',
      'user_work_experiences',
      'user_skills',
      'user_projects',
      'job_advertisements',
      'ats_scores',
      'resume_templates',
    ];

    for (const table of tables) {
      await queryInterface.sequelize.query(`
        DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
      `);
    }
  },
};
