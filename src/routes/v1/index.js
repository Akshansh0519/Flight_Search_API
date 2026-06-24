const express = require('express');

const router = express.Router();

const { InfoController } = require('../../controllers');
router.get('/info',InfoController.info); 

const  AirplaneRoutes  = require('./airplane-routes');
router.use('/airplanes', AirplaneRoutes);

const AirportRoutes = require('./airport-routes');
router.use('/airports', AirportRoutes);

const CityRoutes = require('./city-routes');
router.use('/cities', CityRoutes);

const FlightRoutes = require('./flight-routes');
router.use('/flights', FlightRoutes);

module.exports = router;