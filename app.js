require('dotenv').config();
const express = require('express');
const { readdirSync } = require('fs');
const colors = require('colors');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');

const errorHandler = require('./middlewares/error');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(mongoSanitize());

readdirSync('./routes').map((r) =>
  app.use('/api/v1', require('./routes/' + r))
);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB'.green);
  })
  .catch((err) => {
    console.log('Error connecting to MongoDB'.red);
    console.log(err);
  });

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  );
});

// Handle unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // close sever and exit process
  server.close(() => {
    process.exit(1);
  });
});
