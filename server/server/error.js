// errors.js

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
  }
}

const handleError = (error) => {
  if (error instanceof NotFoundError || error instanceof ValidationError) {
    console.error(`[${error.name}]: ${error.message}`);
  } else {
    console.error("[InternalServerError]:", error);
    error.statusCode = 500; // Ensure statusCode is set for unknown errors
  }
  throw error;
};

module.exports = { NotFoundError, ValidationError, handleError };
