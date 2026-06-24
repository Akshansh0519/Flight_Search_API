const { FlightsRepository } = require('../repositories');
const { AppError, StatusCodes } = require('../utils');

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



module.exports = {
    createFlight
}   
