const { CityRepository } = require('../repositories');
const { AppError, StatusCodes } = require('../utils');

const cityRepository = new CityRepository();

async function createCity(data){
    try{
        const response = await cityRepository.create(data);
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
        throw new AppError('Error creating city object: ' + error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getCities(){
    try{
        const response = await cityRepository.getAll();
        return response;
    }
    catch(error){
        throw new AppError('Error fetching city objects: ' + error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getCity(id){
    try{
        const response = await cityRepository.get({id});
        return response;
    }
    catch(error){
        if(error.statusCode == StatusCodes.NOT_FOUND){
            throw new AppError('City not found', StatusCodes.NOT_FOUND);
        }
        throw new AppError('Error fetching city object: ' + error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function destroyCity(id){
    try{
        const response = await cityRepository.destroy({ id });
        if(!response){
            throw new AppError('City not found', StatusCodes.NOT_FOUND);
        }
        return response;
    }
    catch(error){
        if(error.statusCode == StatusCodes.NOT_FOUND){
            throw new AppError('City not found', StatusCodes.NOT_FOUND);
        }
        throw new AppError('Error destroying city object: ' + error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function updateCity(id, data){
    try{
        const city = await cityRepository.get({id});
        if(!city){
            throw new AppError('City not found', StatusCodes.NOT_FOUND);
        }
        const response = await cityRepository.update(id, data);
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
            throw new AppError('City not found', StatusCodes.NOT_FOUND);
        }
        throw new AppError('Error updating city object: ' + error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function putCity(id, data){
    return updateCity(id, data);
}

module.exports = {
    createCity,
    getCities,
    getCity,
    destroyCity,
    updateCity,
    putCity,
    cityRepository
}
