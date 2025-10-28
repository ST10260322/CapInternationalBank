// Joi validation middleware
export const validate = (schema) => {
    return (req, res, next) => {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false, // Return all errors, not just the first one
        stripUnknown: true  // Remove unknown fields
      });
      
      if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: errors 
        });
      }
      
      // Replace req.body with validated and sanitized data
      req.body = value;
      next();
    };
  };