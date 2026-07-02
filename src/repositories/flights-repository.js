const CrudRepository = require('./crud-repository');
const db = require('../models');
const { Flights , Airplane , Airport , City} = db;

class FlightsRepository extends CrudRepository {
    constructor(){
        super(Flights);
    }

    getAllFlights(filter,sort) {
        return Flights.findAll({
            where: filter,
            order: sort,
            include: [
                { //through eager loading we can get the airplane details along with the flight details
                    model: Airplane ,
                    as: 'airplane' ,
                    //adding this for inner join, so that we can get the airplane details along with the flight details
                    required: true,
                },
                {
                    model : Airport ,
                    as : 'departureAirport' ,
                    required: true,
                    include: [
                        {
                            model : City,
                            as : 'city' ,
                            required: true
                        }
                    ]
                },
                {
                    model : Airport ,
                    as : 'arrivalAirport' ,
                    required: true,
                    include: [
                        {
                            model : City,
                            as : 'city' ,
                            required: true
                        }
                    ]
                }
            ]
        });
    }

    async updateRemainingSeats(flightId, seats, dec = true) {
        const transaction = await db.sequelize.transaction();
        try {
            const flight = await Flights.findByPk(flightId, {
                transaction: transaction,
                lock: transaction.LOCK.UPDATE
            });
            if (!flight) {
                await transaction.rollback();
                throw new Error('Flight not found');
            }
            const seatCount = Number(seats);
            if (Number.isNaN(seatCount) || seatCount <= 0) {
                await transaction.rollback();
                throw new Error('Seats must be a positive number');
            }
            if (dec) {
                if (flight.totalSeats < seatCount) {
                    await transaction.rollback();
                    throw new Error('Not enough seats available');
                }
                flight.totalSeats -= seatCount;
            } else {
                flight.totalSeats += seatCount;
            }
            await flight.save({ transaction: transaction });
            await transaction.commit();
            return flight;
        } catch (error) {
            if (!transaction.finished) {
                await transaction.rollback();
            }
            throw error;
        }
    }
}



module.exports = FlightsRepository;