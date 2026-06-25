const CrudRepository = require('./crud-repository');
const { Flights , Airplane , Airport } = require('../models');

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
                    required: true
                },
                {
                    model : Airport ,
                    as : 'arrivalAirport' ,
                    required: true
                }
            ]
        });
    }
}

module.exports = FlightsRepository;