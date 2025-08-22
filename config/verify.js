const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Token is not valid!" });
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ message: "You are not authenticated" });
  }
};

module.exports = {
  verifyToken: verifyToken,
};
