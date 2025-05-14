// swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Driving Platform APIS',
      version: '1.0.0',
      description: 'API documentation for the E-Driving Platform',
      contact: {
        name: 'Edriving Team',
        email: 'edrivingschoolgc@gmail.com'
      }
    },
    servers: [
      {
        url: `https://driving-backend-stmb.onrender.com/api`,
        description: 'Development server'
      },
      {
        url: 'https://driving-backend-stmb.onrender.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js'], // Make sure this path is correct
};

const specs = swaggerJsdoc(options);

module.exports = (app) => {
  // Serve Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  
  // Serve Swagger JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};