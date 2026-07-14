'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      await queryInterface.addConstraint('Airports', {
        type: 'FOREIGN KEY',
        fields: ['cityId'],
        name: 'city-foreign-key-constraint',
        references: {
          table: 'Cities',
          field: 'id'
        },
        onDelete: 'CASCADE'
      });
    } catch (error) {
      if (!error.message.includes('Duplicate constraint') && !error.message.includes('already exists') && !error.message.includes('Duplicate key')) {
        throw error;
      }
    }
  },

  async down (queryInterface, Sequelize) {
    try {
      await queryInterface.removeConstraint('Airports', 'city-foreign-key-constraint');
    } catch (e) {}
  }
};
