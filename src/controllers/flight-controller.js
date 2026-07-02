const  { FlightService }  = require('../services');
const { StatusCodes, AppError } = require('../utils');
/*
    POST : /flights
    req-body {
        flightNumber: 'AA123',
        aeroplaneId:1, 
        departureAirportId:'DEL', 
        arrivalAirportId:'HYD', 
        departureTime:'2023-10-10T10:00:00Z', 
        arrivalTime:'2023-10-10T12:00:00Z',
        price:200,
        boardingGate:'A1',
        totalSeats:200
    }
*/
async function createFlight(req,res){
    try{
        const flight = await FlightService.createFlight({
            flightNumber : req.body.flightNumber,
            aeroplaneId : req.body.aeroplaneId,
            departureAirportId : req.body.departureAirportId,
            arrivalAirportId : req.body.arrivalAirportId,
            departureTime : req.body.departureTime,
            arrivalTime : req.body.arrivalTime,
            price : req.body.price,
            boardngGate : req.body.boardingGate || req.body.boardngGate,
            totalSeats : req.body.totalSeats
        });
        return res.status(StatusCodes.CREATED).json({   
            success: true,
            data: flight, 
            message: 'Successfully created a flight',
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
            message: error.message || 'Something went wrong while creating a flight',
            error: error 
        });
    }
}

async function getAllFlights(req, res) {
    try {
        const filter = req.query || {};
        const flights = await FlightService.getAllFlights(filter);
        return res.status(StatusCodes.OK).json({
            success: true,
            data: flights,
            message: 'Successfully fetched all flights',
            error: {}
        });
    }   
    catch (error) {
        let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        if (error instanceof AppError) {
            statusCode = error.statusCode;
        }
        return res.status(statusCode).json({
            success: false,
            data: {},
            message: error.message || 'Something went wrong while fetching flights',
            error: error
        });
    }
}

/*
* POST : /flights/:id
* req-params : id
*/
async function getFlight(req,res){
    try{
        const flight = await FlightService.getFlightById(req.params.id);
        return res.status(StatusCodes.OK).json({
            success: true,
            data: flight,
            message: 'Successfully fetched the flight',
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
            message: error.message || 'Something went wrong while fetching the flight',
            error: error 
        });
    }
}


async function updateRemainingSeats(req, res) {
    try {
        const { flightId } = req.params;
        const { seats, dec } = req.body;
        const normalizedSeats = Number(seats);
        const normalizedDec = dec === undefined ? undefined : dec === true || dec === 'true' || dec === '1' || dec === 'on';
        const flight = await FlightService.updateRemainingSeats({
            flightId,
            seats: normalizedSeats,
            dec: normalizedDec
        });
        return res.status(StatusCodes.OK).json({
            success: true,
            data: flight,
            message: 'Successfully updated remaining seats',
            error: {}
        });
    }
    catch (error) {
        let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        if (error instanceof AppError) {
            statusCode = error.statusCode;
        }
        return res.status(statusCode).json({
            success: false,
            data: {},
            message: error.message || 'Something went wrong while updating remaining seats',
            error: error
        });
    }
}
module.exports = {
    createFlight,
    getAllFlights,
    getFlight,
    updateRemainingSeats
}

