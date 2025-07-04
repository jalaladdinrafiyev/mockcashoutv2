const express = require('express');
const requestId = require('./middlewares/requestId');
const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');
const withdrawalsRouter = require('./routes/withdrawals');

const app = express();
app.use(express.json());
app.use(requestId);
app.use(logger);
app.use('/api/withdrawals', withdrawalsRouter);
app.use(errorHandler);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = app; 
