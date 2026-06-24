'use strict';

async function removeConstraintIfExists(queryInterface, tableName, constraintName) {
  try {
    await queryInterface.removeConstraint(tableName, constraintName);
  } catch (error) {
    if (
      !error.message.includes("Can't DROP") &&
      !error.message.includes('check that column/key exists') &&
      !error.message.includes('does not exist')
    ) {
      throw error;
    }
  }
}

async function addIndexIfMissing(queryInterface, tableName, fields, indexName) {
  const indexes = await queryInterface.showIndex(tableName);
  const hasIndex = indexes.some((index) => index.name === indexName);

  if (!hasIndex) {
    await queryInterface.addIndex(tableName, fields, {
      name: indexName,
      unique: true
    });
  }
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await removeConstraintIfExists(queryInterface, 'Flights', 'fk_flights_departure_airport');
    await removeConstraintIfExists(queryInterface, 'Flights', 'fk_flights_arrival_airport');

    await queryInterface.changeColumn('Flights', 'departureAirportId', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('Flights', 'arrivalAirportId', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.sequelize.query(`
      UPDATE Flights AS f
      JOIN Airports AS a ON f.departureAirportId = CAST(a.id AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_0900_ai_ci
      SET f.departureAirportId = a.code
    `);

    await queryInterface.sequelize.query(`
      UPDATE Flights AS f
      JOIN Airports AS a ON f.arrivalAirportId = CAST(a.id AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_0900_ai_ci
      SET f.arrivalAirportId = a.code
    `);

    await addIndexIfMissing(queryInterface, 'Airports', ['code'], 'airports_code_unique');

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
    await removeConstraintIfExists(queryInterface, 'Flights', 'fk_flights_departure_airport');
    await removeConstraintIfExists(queryInterface, 'Flights', 'fk_flights_arrival_airport');

    await queryInterface.sequelize.query(`
      UPDATE Flights AS f
      JOIN Airports AS a ON f.departureAirportId = a.code
      SET f.departureAirportId = a.id
    `);

    await queryInterface.sequelize.query(`
      UPDATE Flights AS f
      JOIN Airports AS a ON f.arrivalAirportId = a.code
      SET f.arrivalAirportId = a.id
    `);

    await queryInterface.changeColumn('Flights', 'departureAirportId', {
      type: Sequelize.INTEGER,
      allowNull: false
    });

    await queryInterface.changeColumn('Flights', 'arrivalAirportId', {
      type: Sequelize.INTEGER,
      allowNull: false
    });

    await queryInterface.addConstraint('Flights', {
      fields: ['departureAirportId'],
      type: 'foreign key',
      name: 'fk_flights_departure_airport',
      references: {
        table: 'Airports',
        field: 'id'
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
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  }
};
