const express = require('express')
const router = express.Router()
const userController =   require('../controllers/user.controller');

// Create a new employee
router.post('/', userController.create);

// Retrieve a single employee with id
router.get('/self', userController.getUser);

// Update a employee with id
router.put('/self', userController.update);

module.exports = router