const express = require('express');

const router = express.Router();

const { InfoController } = require('../../controllers');

const  AirplaneRoutes  = require('./airplane-routes');

const CityRoutes = require('./city-routes');

router.use('/cities', CityRoutes);

router.use('/airplanes', AirplaneRoutes);

router.get('/info',InfoController.info); 

module.exports = router;