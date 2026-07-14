'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Cities', 'code', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addIndex('Cities', ['code'], {
      unique: true,
      name: 'cities_code_unique_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Cities', 'cities_code_unique_idx');
    await queryInterface.removeColumn('Cities', 'code');
  }
};