// src/middlewares/validate.js
const { body, validationResult } = require('express-validator');

// Nota: exportamos un ARRAY de middlewares.
// Express acepta funciones sueltas o arrays de funciones.
const validateCreateUser = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('username debe tener al menos 3 caracteres'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('password debe tener al menos 6 caracteres'),

  body('role_id')
    .isUUID()
    .withMessage('role_id debe ser un UUID válido'),

  // manejador de errores de validación
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // 400 Bad Request con el detalle de validación
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Exportación **por defecto**: un array
module.exports = validateCreateUser;
