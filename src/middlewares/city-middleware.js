const { StatusCodes } = require('http-status-codes');

function validateCity(req, res, next) {
    const { name, code } = req.body;

    if (!name || typeof name !== 'string') {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'City name is required and must be a string.' });
    }

    if (!code || typeof code !== 'string') {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'City code is required and must be a string.' });
    }

    next();
}


module.exports = {
    validateCity
};
