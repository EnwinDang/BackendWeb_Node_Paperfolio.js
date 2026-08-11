require('dotenv').config();
const path = require('path');
const express = require('express');

const assetsRouter = require('./routes/assets');
const alertsRouter = require('./routes/alerts');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/assets', assetsRouter);
app.use('/alerts', alertsRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Price Alerts API listening on http://localhost:${PORT}`);
});
