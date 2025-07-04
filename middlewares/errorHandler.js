module.exports = (err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    // Malformed JSON
    if (!res.headersSent) {
      res.status(400).json({ error: 'Malformed JSON' });
    }
    console.warn('Malformed JSON received:', err.body);
    return;
  }
  console.error('Unhandled error:', err);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal server error' });
  }
}; 
