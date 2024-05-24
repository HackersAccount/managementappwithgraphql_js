// auth.js
const jwt = require("jsonwebtoken");

// Middleware to authenticate the user
const authenticate = (context) => {
  const token = context.headers.authorization;
  if (!token) throw new Error("Unauthorized");
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    context.user = user;
  } catch (error) {
    throw new Error("Unauthorized");
  }
};

// Middleware to authorize based on user role
const authorize = (context, requiredRole) => {
  if (!context.user || context.user.role !== requiredRole) {
    throw new Error("Forbidden");
  }
};

module.exports = { authenticate, authorize };
