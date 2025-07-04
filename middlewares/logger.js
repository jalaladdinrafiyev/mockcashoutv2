const fs = require('fs');
const path = require('path');

const accessLogPath = path.join(__dirname, '../logs/access.log');
const errorLogPath = path.join(__dirname, '../logs/error.log');

function logToFile(filePath, message) {
  fs.appendFile(filePath, message + '\n', err => {
    if (err) console.error('Failed to write log:', err);
  });
}

function getTimestamp() {
  return new Date().toISOString();
}

module.exports = (req, res, next) => {
  const reqId = req.id || '-';
  const infoMsg = `[${getTimestamp()}] [reqId:${reqId}] INFO: ${req.method} ${req.originalUrl} - body: ${JSON.stringify(req.body)}`;
  console.log(infoMsg);
  logToFile(accessLogPath, infoMsg);

  // Capture all responses and log them
  const originalSend = res.send;
  res.send = function (body) {
    const responseMsg = `[${getTimestamp()}] [reqId:${reqId}] RESPONSE: ${req.method} ${req.originalUrl} - status: ${res.statusCode} - body: ${JSON.stringify(req.body)} - response: ${body}`;
    console.log(responseMsg);
    logToFile(accessLogPath, responseMsg);
    if (res.statusCode >= 400) {
      const errorMsg = `[${getTimestamp()}] [reqId:${reqId}] ERROR: ${req.method} ${req.originalUrl} - status: ${res.statusCode} - body: ${JSON.stringify(req.body)} - response: ${body}`;
      console.error(errorMsg);
      logToFile(errorLogPath, errorMsg);
    }
    return originalSend.apply(this, arguments);
  };

  next();
}; 
