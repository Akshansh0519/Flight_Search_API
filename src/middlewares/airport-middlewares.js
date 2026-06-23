const { StatusCodes } = require('http-status-codes');

function validateAirport(req, res, next) {
    const { name, code, address, cityId } = req.body || {};

    if (!req.body) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Request body is required.' });
    }

    if (!name || typeof name !== 'string') {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Name is required and must be a string.' });
    }

    if (!code || typeof code !== 'string') {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Code is required and must be a string.' });
    }

    if (!address || typeof address !== 'string') {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Address is required and must be a string.' });
    }

    if (!cityId || Number.isNaN(Number(cityId))) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'City ID is required and must be a number.' });
    }

    next();
}

module.exports = {
    validateAirport
};
