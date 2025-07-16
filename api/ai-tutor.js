export default (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Temporary test response
  res.status(200).json({ reply: "AI tutor response" });
}; 