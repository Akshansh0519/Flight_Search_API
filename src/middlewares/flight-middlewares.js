const { StatusCodes } = require('http-status-codes');
const { compareTime } = require('../utils');

function validateFlight(req, res, next) {
    const {
        flightNumber,
        aeroplaneId,
        departureAirportId,
        arrivalAirportId,
        departureTime,
        arrivalTime,
        price,
        boardngGate,
        totalSeats
    } = req.body || {};

    if (!req.body) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Request body is required.' });
    }

    if (!flightNumber || typeof flightNumber !== 'string') {
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: 'Flight number is required and must be a string.'
        });
    }

    if (!aeroplaneId || Number.isNaN(Number(aeroplaneId))) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Aeroplane ID is required and must be a number.' });
    }

    if (!departureAirportId || typeof departureAirportId !== 'string') {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Departure Airport ID is required and must be an airport code.' });
    }

    if (!arrivalAirportId || typeof arrivalAirportId !== 'string') {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Arrival Airport ID is required and must be an airport code.' });
    }

    if (!departureTime || typeof departureTime !== 'string') {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Departure Time is required.' });
    }

    if (!arrivalTime || typeof arrivalTime !== 'string') {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Arrival Time is required.' });
    }

    if (!compareTime(arrivalTime, departureTime)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: 'Arrival time must be after departure time.'
        });
    }

    if (!price || Number.isNaN(Number(price))) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Price is required and must be a number.' });
    }

    if (!boardngGate || typeof boardngGate !== 'string') {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Boarding Gate is required and must be a string.' });
    }

    if (!totalSeats || Number.isNaN(Number(totalSeats))) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Total Seats is required and must be a number.' });
    }

    next();
}

module.exports = {
    validateFlight
};
