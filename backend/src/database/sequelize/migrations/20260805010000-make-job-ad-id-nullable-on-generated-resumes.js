'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(
        'ALTER TABLE "generated_resumes" ALTER COLUMN "job_ad_id" DROP NOT NULL',
        { transaction },
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(
        'ALTER TABLE "generated_resumes" ALTER COLUMN "job_ad_id" SET NOT NULL',
        { transaction },
      );
    });
  },
};