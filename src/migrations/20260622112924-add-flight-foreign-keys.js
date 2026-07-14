module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addConstraint('Flights', {
        fields: ['aeroplaneId'],
        type: 'foreign key',
        name: 'fk_flights_airplane',
        references: {
          table: 'Airplanes',
          field: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    } catch (e) {}

    try {
      await queryInterface.addConstraint('Flights', {
        fields: ['departureAirportId'],
        type: 'foreign key',
        name: 'fk_flights_departure_airport',
        references: {
          table: 'Airports',
          field: 'code'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    } catch (e) {}

    try {
      await queryInterface.addConstraint('Flights', {
        fields: ['arrivalAirportId'],
        type: 'foreign key',
        name: 'fk_flights_arrival_airport',
        references: {
          table: 'Airports',
          field: 'code'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    } catch (e) {}
  },

  async down(queryInterface, Sequelize) {
    try { await queryInterface.removeConstraint('Flights', 'fk_flights_airplane'); } catch (e) {}
    try { await queryInterface.removeConstraint('Flights', 'fk_flights_departure_airport'); } catch (e) {}
    try { await queryInterface.removeConstraint('Flights', 'fk_flights_arrival_airport'); } catch (e) {}
  }
};
