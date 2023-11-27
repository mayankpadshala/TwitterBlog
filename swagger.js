const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My MERN Application API',
      version: '1.0.0',
      description: 'This is a REST API for a MERN stack application',
    },
    components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{
        BearerAuth: [],
      }],
    servers: [
      {
        url: 'http://localhost:5000/api', // Adjust the port and base URL as necessary
      },
    ],
  },
  apis: ['./routes/api/*.js'], // Path to the API routes
};

const openapiSpecification = swaggerJsdoc(options);

module.exports = openapiSpecification;
