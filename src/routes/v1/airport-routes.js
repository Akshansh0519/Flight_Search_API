const router = require('express').Router();

const { AirportController } = require('../../controllers');

const { AirplaneMiddleware } = require('../../middlewares');

const { AirportMiddleware } = require('../../middlewares');


// /api/v1/airports POST 
router.post('/', AirportMiddleware.validateAirport, AirportController.createAirport);

// /api/v1/airports/:id GET
router.get('/', AirportController.getAirports);
router.get('/:id', AirportController.getAirport);

router.delete('/:id', AirportController.destroyAirport);

router.patch('/:id', AirportController.updateAirport);
router.put('/:id', AirportMiddleware.validateAirport, AirportController.putAirport);

module.exports = router;
