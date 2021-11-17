
const { verify } = require('jsonwebtoken');

const isAuth = req => {
  const authorization = req.headers['authorization'];
  if (!authorization) throw new Error('You need to login.');
  const token = authorization.split(' ')[1];
  
  const user = verify(token, 'this is very secret phrase');
  return user;
};

module.exports = {
  isAuth,
};