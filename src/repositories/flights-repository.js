const CrudRepository = require('./crud-repository');
const { Flights } = require('../models');

class FlightsRepository extends CrudRepository {
    constructor(){
        super(Flights);
    }

    getAllFlights(filter,sort) {
        return Flights.findAll({
            where: filter,
            order: sort
        });
    }
}

module.exports = FlightsRepository;