// swagger.js

const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My Node.js API',
      version: '1.0.0',
      description: 'API Documentation for my Node.js project',
    },
    servers: [{ url: 'http://localhost:8080/api' }],
  },
  apis: ['./app/routes/*.js'], // ← make sure this matches your project structure
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
