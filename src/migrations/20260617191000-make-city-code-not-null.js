'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      "UPDATE Cities SET code = CONCAT('CITY-', id) WHERE code IS NULL OR code = ''"
    );

    await queryInterface.changeColumn('Cities', 'code', {
      type: Sequelize.STRING,
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Cities', 'code', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};