'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.sequelize.query(
        "UPDATE Cities SET code = CONCAT('CITY-', id) WHERE code IS NULL OR code = ''"
      );
    } catch (e) {}

    try {
      await queryInterface.changeColumn('Cities', 'code', {
        type: Sequelize.STRING,
        allowNull: false
      });
    } catch (e) {}
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.changeColumn('Cities', 'code', {
        type: Sequelize.STRING,
        allowNull: true
      });
    } catch (e) {}
  }
};