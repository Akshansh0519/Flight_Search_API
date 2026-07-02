const { FlightsRepository } = require('../repositories');
const { AppError, StatusCodes } = require('../utils');
const { Op } = require('sequelize');

const flightsRepository = new FlightsRepository();

async function createFlight(data){
    try{
        const response = await flightsRepository.create(data);
        return response;
    }
    catch(error){
        if(error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError'){
            let explanation = [];
            error.errors.forEach((err) => {
                explanation.push(err.message);
            });
            throw new AppError('Validation error: ' + explanation.join(', '), StatusCodes.BAD_REQUEST);
        }
        if(error.name === 'SequelizeForeignKeyConstraintError'){
            throw new AppError('Validation error: Invalid airplane id or airport code', StatusCodes.BAD_REQUEST);
        }
        throw new AppError('Error creating flight object: ' + error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getAllFlights(filter){
    try{
        let customFilter = {};
        let sortFilter = [];
        if(filter.trips){
            const [departureAirportId, arrivalAirportId] = filter.trips.split('-');

            if (!departureAirportId || !arrivalAirportId) {
                throw new AppError('Invalid trips format. Use DEP-ARR airport codes', StatusCodes.BAD_REQUEST);
            }

            if(departureAirportId === arrivalAirportId){
                throw new AppError('Departure and arrival airports cannot be the same', StatusCodes.BAD_REQUEST);
            }

            customFilter.departureAirportId = departureAirportId;
            customFilter.arrivalAirportId = arrivalAirportId;
        }

        if(filter.price){
            const [minPrice, maxPrice] = filter.price.split('-').map(Number);
            if (isNaN(minPrice) || (maxPrice !== undefined && isNaN(maxPrice))) {
                throw new AppError('Invalid price format. Use min-max', StatusCodes.BAD_REQUEST);
            }
            customFilter.price = { [Op.between]: [minPrice, (maxPrice === undefined ? 100000 : maxPrice)] };
        }

        if(filter.travellers){
            const travellers = Number(filter.travellers);
            if (isNaN(travellers) || travellers <= 0) {
                throw new AppError('Invalid travellers format. Must be a positive number', StatusCodes.BAD_REQUEST);
            }
            customFilter.totalSeats = { [Op.gte]: travellers };
        }


        if(filter.departureDate){
            const startDate = new Date(`${filter.departureDate}T00:00:00.000Z`);
            const endDate = new Date(`${filter.departureDate}T23:59:59.999Z`);

            customFilter.departureTime = {
                [Op.between]: [startDate, endDate]
            };
        }

        if(filter.sort){
            const params = filter.sort.split(',');
            const sortFilters = params.map(param => param.split('_'));
            sortFilter = sortFilters
        }

        const flights = await flightsRepository.getAllFlights(customFilter,sortFilter);

        if (flights.length === 0) {
            throw new AppError('No flights left with the required filter that is provided', StatusCodes.NOT_FOUND);
        }

        return flights;
    }
    catch(error){
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError('Error fetching flights: ' + error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getFlightById(flightId){
    try{
        const flight = await flightsRepository.get({ id: flightId });
        if(!flight){
            throw new AppError('Flight not found', StatusCodes.NOT_FOUND);
        }
        return flight;
    }
    catch(error){
        if(error.statusCode === StatusCodes.NOT_FOUND){
            throw new AppError('Flight not found', StatusCodes.NOT_FOUND);
        }
        throw new AppError('Error fetching flight: ' + error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function updateRemainingSeats(data) {
    try{
        const { flightId, seats, dec } = data;
        const flight = await flightsRepository.updateRemainingSeats(flightId, seats, dec);
        return flight;
    }
    catch(error){
        throw new AppError('Error updating remaining seats: ' + error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

module.exports = {
    createFlight,
    getAllFlights,
    getFlightById,
    updateRemainingSeats
}   
