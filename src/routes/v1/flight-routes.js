const router = require('express').Router();

const { FlightController } = require('../../controllers');

const { FlightMiddleware } = require('../../middlewares');




// /api/v1/airports POST 
router.post('/', FlightMiddleware.validateFlight, FlightController.createFlight);

module.exports = router;
