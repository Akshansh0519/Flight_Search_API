module.exports = {
  async up(queryInterface, Sequelize) {
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Flights', 'fk_flights_airplane');
    await queryInterface.removeConstraint('Flights', 'fk_flights_departure_airport');
    await queryInterface.removeConstraint('Flights', 'fk_flights_arrival_airport');
  }
};
