module.exports = function validationError(message = 'Não tem acesso ao recurso solicitado') {
  this.name = 'forbiddenError';
  this.message = message;
};
