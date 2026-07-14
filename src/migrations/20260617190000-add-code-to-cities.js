'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('Cities');
    if (!tableDesc.code) {
      await queryInterface.addColumn('Cities', 'code', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }

    const indexes = await queryInterface.showIndex('Cities');
    const hasIndex = indexes.some(idx => idx.name === 'cities_code_unique_idx' || (idx.fields && idx.fields.some(f => f.attribute === 'code')));
    if (!hasIndex) {
      try {
        await queryInterface.addIndex('Cities', ['code'], {
          unique: true,
          name: 'cities_code_unique_idx'
        });
      } catch (err) {
        if (!err.message.includes('Duplicate') && !err.message.includes('already exists')) {
          throw err;
        }
      }
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeIndex('Cities', 'cities_code_unique_idx');
    } catch (e) {}
    try {
      await queryInterface.removeColumn('Cities', 'code');
    } catch (e) {}
  }
};