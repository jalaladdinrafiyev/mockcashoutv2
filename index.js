const express = require('express');
const app = express();
app.use(express.json());

// Use withdrawals routes
const withdrawalsRouter = require('./routes/withdrawals');
app.use('/api/withdrawals', withdrawalsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
