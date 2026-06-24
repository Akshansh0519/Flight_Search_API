const CrudRepository = require('./crud-repository');
const { Flights } = require('../models');

class FlightsRepository extends CrudRepository {
    constructor(){
        super(Flights);
    }
}

module.exports = FlightsRepository;