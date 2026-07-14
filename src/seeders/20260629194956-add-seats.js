'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await queryInterface.sequelize.query(`
      INSERT IGNORE INTO Airplanes (id, modelNumber, capacity, createdAt, updatedAt)
      VALUES (1, 'Airbus A320neo', 180, '${now}', '${now}')
    `);

    await queryInterface.sequelize.query(`
      INSERT IGNORE INTO Seats (airplaneId, \`row\`, col, class, createdAt, updatedAt) VALUES
      (1, 1, 'A', 'economy', '${now}', '${now}'),
      (1, 1, 'B', 'economy', '${now}', '${now}'),
      (1, 1, 'C', 'economy', '${now}', '${now}'),
      (1, 1, 'D', 'first', '${now}', '${now}'),
      (1, 1, 'E', 'first', '${now}', '${now}'),
      (1, 2, 'A', 'economy', '${now}', '${now}'),
      (1, 2, 'B', 'economy', '${now}', '${now}'),
      (1, 2, 'C', 'economy', '${now}', '${now}'),
      (1, 2, 'D', 'first', '${now}', '${now}'),
      (1, 2, 'E', 'first', '${now}', '${now}')
    `);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
