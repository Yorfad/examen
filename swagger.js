import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Usuarios y Clientes",
      version: "1.0.0",
      description: "API genérica para manejar Usuarios y Clientes con Express y Swagger",
    },
  },
  apis: ["./index.js"], // aquí vamos a poner las anotaciones
};

export const swaggerSpec = swaggerJsdoc(options);
export const swaggerUiMiddleware = swaggerUi;
