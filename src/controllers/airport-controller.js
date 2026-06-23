const  { AirportService }  = require('../services');
const { StatusCodes, AppError } = require('../utils');
/*
    POST : /airports
    req-body {name:'Indira Gandhi International Airport', location:'New Delhi'}
*/
async function createAirport(req,res){
    try{
        const airport = await AirportService.createAirport({
            name : req.body.name,
            code : req.body.code,
            address : req.body.address,
            cityId : req.body.cityId
        });
        return res.status(StatusCodes.CREATED).json({   
            success: true,
            data: airport, 
            message: 'Successfully created an airport',
            error: {}
        });
    }
    catch(error){
        let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        if(error instanceof AppError) {
            statusCode = error.statusCode;
        }
        return res.status(statusCode).json({
            success: false,
            data: {},
            message: error.message || 'Something went wrong while creating an airport',
            error: error 
        });
    }
}

async function getAirports(req,res){
    try{
        const airport = await AirportService.getAirports();
        return res.status(StatusCodes.OK).json({
            success: true,
            data: airport,
            message: 'Successfully fetched airports',
            error: {}
        });
    }
    catch(error){
        let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        if(error instanceof AppError) {
            statusCode = error.statusCode;
        }
        return res.status(statusCode).json({
            success: false,
            data: {},
            message: error.message || 'Something went wrong while fetching airports',
            error: error 
        });
    }
}

async function getAirport(req,res){
    try{
        const airport = await AirportService.getAirport(req.params.id);
        if(!airport){
            throw new AppError('Airport not found', StatusCodes.NOT_FOUND);
        }
        else{
            return res.status(StatusCodes.OK).json({
                success: true,
                data: airport,
                message: 'Successfully fetched the airport',
                error: {}
            });
        }
    }
    catch(error){
        let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        if(error instanceof AppError) {
            statusCode = error.statusCode;
        }
        return res.status(statusCode).json({
            success: false,
            data: {},
            message: error.message || 'Something went wrong while fetching the airport',
            error: error 
        });
    }
}

async function destroyAirport(req,res){
    try{
        const response = await AirportService.destroyAirport(req.params.id);
        return res.status(StatusCodes.OK).json({
            success: true,
            data: response,
            message: 'Successfully destroyed the airport',
            error: {}
        });
    }
    catch(error){
        let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        if(error instanceof AppError) {
            statusCode = error.statusCode;
        }
        return res.status(statusCode).json({
            success: false,
            data: {},
            message: error.message || 'Something went wrong while destroying the airport',
            error: error 
        });
    }
}

async function updateAirport(req,res){
    try{
        const response = await AirportService.updateAirport(req.params.id, req.body);
        return res.status(StatusCodes.OK).json({
            success: true,
            data: response,
            message: 'Successfully updated the airport',
            error: {}
        });
    }
    catch(error){
        let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        if(error instanceof AppError) {
            statusCode = error.statusCode;
        }
        return res.status(statusCode).json({
            success: false,
            data: {},
            message: error.message || 'Something went wrong while updating the airport',
            error: error 
        });
    }
}

async function putAirport(req,res){
    try{
        const response = await AirportService.putAirport(req.params.id, req.body);
        return res.status(StatusCodes.OK).json({
            success: true,
            data: response,
            message: 'Successfully updated the airport',
            error: {}
        });
    }
    catch(error){
        let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        if(error instanceof AppError) {
            statusCode = error.statusCode;
        }
        return res.status(statusCode).json({
            success: false,
            data: {},
            message: error.message || 'Something went wrong while updating the airport',
            error: error
        });
    }
}

module.exports = {
    createAirport,
    getAirports,
    getAirport,
    destroyAirport,
    updateAirport,
    putAirport
}
