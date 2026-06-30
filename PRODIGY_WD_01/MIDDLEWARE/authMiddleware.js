const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) return res.status(401).json({ msg: "No token, access denied" });

  try {
    const verified = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ msg: "Invalid token" });
  }
};

// Role-based access control
const authorizeRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role)
      return res.status(403).json({ msg: "Access denied" });
    next();
  };
};

module.exports = { verifyToken, authorizeRole };
