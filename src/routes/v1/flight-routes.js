const router = require('express').Router();

const { FlightController } = require('../../controllers');

const { FlightMiddleware } = require('../../middlewares');




// /api/v1/airports POST 
router.post('/', FlightMiddleware.validateFlight, FlightController.createFlight);

// /api/v1/flights?trips=DEL-HYD GET
router.get('/', FlightController.getAllFlights);

// /api/v1/flights/:id GET
router.get('/:id', FlightController.getFlight);

module.exports = router;
