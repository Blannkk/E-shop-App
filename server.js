const path = require( 'path' );

const express = require( 'express' );
const dotenv = require('dotenv');
const morgan = require( 'morgan' );
const cors = require( 'cors' );
const compression = require('compression' );

dotenv.config({ path: 'config.env' });
const ApiError = require( './utils/apiError' );
const globalError = require( './middlewares/errorMiddleware' );
const dbConnection = require( './config/database' );

// Routes
const mountRoutes = require('./routes'); 
const { webhookCheckout } = require('./services/orderService');


// Connect with db
dbConnection();

// express app
const app = express();

// enable other domains to access your app
app.use( cors() );
app.options( '*', cors() );

// compress all responses
app.use(compression());

// checkout webhook
app.post('/webhook-checkout', express.raw({ type: 'application/json' }), webhookCheckout);

// Middlewares
app.use( express.json() );
app.use( express.static( path.join( __dirname, 'uploads' ) ) );

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// Mount Routes
mountRoutes( app );

// handling all unhandled routes
app.all("*" , (req, res, next) => {
  next(new ApiError(`can't find this route ${req.originalUrl}`, 400))
})

//global error handling middleware
app.use(globalError)

const PORT = process.env.PORT || 8030;

const server = app.listen(PORT, () => {
  console.log(`App running running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error(`unhandledRejection errors: ${err.name} | ${err.message}`);
  
  server.close( () => {
    process.exit(1);
  });
})