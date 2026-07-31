'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('ats_scores', 'ai_feedback', {
      type: Sequelize.JSONB,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('ats_scores', 'ai_feedback');
  },
};
