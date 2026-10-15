const swaggerJsDoc = require('swagger-jsdoc');
const env = require('../config/env');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Room Rento REST API',
      version: '1.0.0',
      description:
        'Production-grade RESTful API for Room Finder for Rent web platform (rooms, PGs, flats, hostels, and studios). Matching React frontend workflows with search filters, dynamic comparisons, visits, reviews, and dashboards.',
      contact: {
        name: 'Room Rento Engineering Team',
        email: 'dev@roomrento.in'
      }
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api/v1`,
        description: 'Local Development Server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token'
        },
        CookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken',
          description: 'HTTP-only secure cookie'
        }
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation completed successfully' },
            data: { type: 'object' },
            meta: { type: 'object' }
          }
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', example: 'Arjun Mehta' },
            email: { type: 'string', example: 'arjun@roomrento.in' },
            phone: { type: 'string', example: '+91 98123 45678' },
            role: { type: 'string', enum: ['tenant', 'owner', 'admin'], example: 'tenant' },
            avatar: { type: 'string' },
            city: { type: 'string', example: 'Bengaluru' },
            verifiedOwner: { type: 'boolean', example: false }
          }
        },
        Listing: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string', example: 'Urban Luxe Private Studio' },
            slug: { type: 'string', example: 'urban-luxe-private-studio-a1b2' },
            propertyType: { type: 'string', example: 'studio' },
            roomType: { type: 'string', example: 'studio' },
            status: { type: 'string', example: 'published' },
            pricing: {
              type: 'object',
              properties: {
                monthlyRent: { type: 'number', example: 16500 },
                securityDeposit: { type: 'number', example: 16500 },
                brokerage: { type: 'number', example: 0 }
              }
            },
            location: {
              type: 'object',
              properties: {
                area: { type: 'string', example: 'Koramangala' },
                city: { type: 'string', example: 'Bengaluru' }
              }
            },
            ratingAvg: { type: 'number', example: 4.9 },
            ratingCount: { type: 'number', example: 128 }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

module.exports = swaggerSpec;
