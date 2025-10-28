import Joi from 'joi';

// Registration validation schema
export const registerSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(50)
    .pattern(/^[A-Za-z\s]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Name must contain only letters and spaces',
      'string.max': 'Name must be less than 50 characters',
      'any.required': 'Name is required'
    }),
  
  surname: Joi.string()
    .min(1)
    .max(50)
    .pattern(/^[A-Za-z\s]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Surname must contain only letters and spaces',
      'string.max': 'Surname must be less than 50 characters',
      'any.required': 'Surname is required'
    }),
  
  idNumber: Joi.string()
    .length(13)
    .pattern(/^\d{13}$/)
    .required()
    .messages({
      'string.length': 'ID number must be exactly 13 digits',
      'string.pattern.base': 'ID number must contain only digits',
      'any.required': 'ID number is required'
    }),
  
  email: Joi.string()
    .email()
    .max(100)
    .required()
    .messages({
      'string.email': 'Invalid email format',
      'string.max': 'Email must be less than 100 characters',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&#)',
      'string.min': 'Password must be at least 8 characters',
      'string.max': 'Password must be less than 128 characters',
      'any.required': 'Password is required'
    })
});

// Login validation schema
export const loginSchema = Joi.object({
    accountNumber: Joi.string()
      .required()
      .messages({
        'any.required': 'Account number is required'
      }),
    
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      })
  });

// Payment validation schema
export const paymentSchema = Joi.object({
  recipientName: Joi.string()
    .min(1)
    .max(50)
    .pattern(/^[A-Za-z\s]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Recipient name must contain only letters and spaces',
      'string.max': 'Recipient name must be less than 50 characters',
      'any.required': 'Recipient name is required'
    }),
  
  bank: Joi.string()
    .min(1)
    .max(100)
    .pattern(/^[A-Za-z\s]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Bank name must contain only letters and spaces',
      'string.max': 'Bank name must be less than 100 characters',
      'any.required': 'Bank name is required'
    }),
  
  accountNumber: Joi.string()
    .min(6)
    .max(12)
    .pattern(/^\d{6,12}$/)
    .required()
    .messages({
      'string.pattern.base': 'Account number must be 6-12 digits',
      'any.required': 'Account number is required'
    }),
  
  recipientEmail: Joi.string()
    .email()
    .max(100)
    .required()
    .messages({
      'string.email': 'Invalid recipient email format',
      'any.required': 'Recipient email is required'
    }),
  
  currency: Joi.string()
    .valid('USD', 'ZAR', 'EUR', 'GBP', 'JPY')
    .required()
    .messages({
      'any.only': 'Currency must be one of: USD, ZAR, EUR, GBP, JPY',
      'any.required': 'Currency is required'
    }),
  
  amount: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.positive': 'Amount must be a positive number',
      'number.precision': 'Amount can have at most 2 decimal places',
      'any.required': 'Amount is required'
    }),
  
  reference: Joi.string()
    .max(200)
    .pattern(/^[A-Za-z0-9\s\-_.,!?()]*$/)
    .allow('')
    .messages({
      'string.pattern.base': 'Reference contains invalid characters',
      'string.max': 'Reference must be less than 200 characters'
    }),
  
  swiftCode: Joi.string()
    .min(8)
    .max(11)
    .pattern(/^[A-Z0-9]{8,11}$/)
    .allow('')
    .messages({
      'string.pattern.base': 'SWIFT code must be 8-11 alphanumeric characters',
      'string.min': 'SWIFT code must be at least 8 characters',
      'string.max': 'SWIFT code must be less than 11 characters'
    })
});