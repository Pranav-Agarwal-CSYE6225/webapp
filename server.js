const express = require('express');
const bodyParser = require('body-parser');
const userController =   require('./src/controllers/user.controller');
const log = require("./logs")
const logger = log.getLogger('logs');
// create express app
const app = express();

// Setup server port
const port = process.env.PORT || 5000;

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse requests of content-type - application/json
app.use(bodyParser.json())

// parse raw buffer requests
app.use(bodyParser.raw({type: '*/*',limit: '50mb'}));

// define a root route
app.get('/', (req, res) => {
  res.send("Hello World");
});

// Require employee routes
const userRoutes = require('./src/routes/user.routes')

// using as middleware
app.use('/v2/user', userRoutes)

// listen for requests
app.listen(port, () => {
  console.log(`Server is listening on Port ${port}`);
});

logger.info("Application running!");