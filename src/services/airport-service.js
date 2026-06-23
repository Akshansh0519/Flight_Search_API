const { AirportRepository } = require('../repositories');
const { AppError, StatusCodes } = require('../utils');

const airportRepository = new AirportRepository();

async function createAirport(data){
    try{
        const response = await airportRepository.create(data);
        return response;
    }
    catch(error){
        if(error.name === 'SequelizeValidationError'){
            let explanation = [];
            error.errors.forEach((err) => {
                explanation.push(err.message);
            });
            throw new AppError('Validation error: ' + explanation.join(', '), StatusCodes.BAD_REQUEST);
        }
        throw new AppError('Error creating airport object: ' + error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getAirports(){
    try{
        const response = await airportRepository.getAll();
        return response;
    }
    catch(error){
        throw new AppError('Error fetching airport objects: ' + error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getAirport(id){
    try{
        const response = await airportRepository.get({id});
        return response;
    }
    catch(error){
        if(error.statusCode == StatusCodes.NOT_FOUND){
            throw new AppError('Airport not found', StatusCodes.NOT_FOUND);
        }
        throw new AppError('Error fetching airport objects: ' + error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function destroyAirport(id){
    try{
        const response = await airportRepository.destroy({ id });
        if(!response){
            throw new AppError('Airport not found', StatusCodes.NOT_FOUND);
        }
        return response;
    }   
    catch(error){
        if(error.statusCode == StatusCodes.NOT_FOUND){
            throw new AppError('Airport not found', StatusCodes.NOT_FOUND);
        }
        throw new AppError('Error destroying airport object: ' + error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function updateAirport(id, data){
    try{
        const airport = await airportRepository.get({id});    
        if(!airport){
            throw new AppError('Airport not found', StatusCodes.NOT_FOUND);
        }   
        const response = await airportRepository.update(id, data);
        return response;
    }
    catch(error){
        if(error.name === 'SequelizeValidationError'){
            let explanation = [];
            error.errors.forEach((err) => {
                explanation.push(err.message);
            });
            throw new AppError('Validation error: ' + explanation.join(', '), StatusCodes.BAD_REQUEST);
        }
        if(error.statusCode == StatusCodes.NOT_FOUND){
            throw new AppError('Airport not found', StatusCodes.NOT_FOUND);
        }
        throw new AppError('Error updating airport object: ' + error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function putAirport(id, data){
    return updateAirport(id, data);
}

module.exports = {
    createAirport,
    getAirports,
    getAirport,
    destroyAirport,
    updateAirport,
    putAirport
}   
