const CrudRepository = require('./crud-repository');
const { Flights , Airplane , Airport , City} = require('../models');

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
        const flight = await Flights.findByPk(flightId);
        if (!flight) {
            throw new Error('Flight not found');
        }
        const seatCount = Number(seats);
        if (Number.isNaN(seatCount) || seatCount <= 0) {
            throw new Error('Seats must be a positive number');
        }
        if (dec) {
            if (flight.totalSeats < seatCount) {
                throw new Error('Not enough seats available');
            }
            flight.totalSeats -= seatCount;
        } else {
            flight.totalSeats += seatCount;
        }
        await flight.save();
        return flight;
    }
}



module.exports = FlightsRepository;