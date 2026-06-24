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
        boardngGate:'A1',
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
            boardngGate : req.body.boardngGate,
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
module.exports = {
    createFlight
}
