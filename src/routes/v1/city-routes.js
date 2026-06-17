const router = require('express').Router();
const { CityController } = require('../../controllers');
const { CityMiddleware } = require('../../middlewares');


// /api/v1/city POST 
router.post('/', CityMiddleware.validateCity, CityController.createCity);

router.get('/', CityController.getCities);
router.get('/:id', CityController.getCity);
router.delete('/:id', CityController.destroyCity);
router.put('/:id', CityMiddleware.validateCity, CityController.updateCity);
router.patch('/:id', CityMiddleware.validateCity, CityController.putCity);

module.exports = router;
