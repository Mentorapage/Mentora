module.exports = (req, res) => {
  res.status(200).json({
    message: "API index endpoint working",
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
  });
}; 