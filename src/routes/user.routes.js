const express = require('express')
const router = express.Router()
const userController =   require('../controllers/user.controller');

// Create a new employee
router.post('/', userController.create);

// Retrieve a single employee with id
router.get('/:id', userController.findById);

// Update a employee with id
router.put('/:id', userController.update);

module.exports = router