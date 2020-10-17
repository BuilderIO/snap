import fastify from 'fastify';

const server = fastify({
  logger: true,
});

export { server };
