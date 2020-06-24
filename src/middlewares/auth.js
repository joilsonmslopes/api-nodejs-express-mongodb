const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');

module.exports = (req, res, next) => {
  // buscando headers de autorização
  const authHeader = req.headers.authorization;

  // Verificar se o token foi informado
  if(!authHeader) {
    return res.status(401).send({ error: 'No token provided' });
  }

  // Verificar se o token está no formato correto de JWT
  // Dividir o token em duas partes, para ficar o Bearer de um lado e ou token do outro
  const parts = authHeader.split(' ');
  
  // Verificar se o token realmente está com as duas partes
  if(!parts.length === 2) {
    return res.status(401).send({ error: 'Token error' });
  }

  // Se tiver as duas partes, agora vamos desestruturar
  // Para no primeiro indíce receber o Bearer e no segundo receber o Token
  const [ scheme, token ] = parts;

  // Verificar se no scheme tem a palavra Bearer, nesse caso se começa, usando regex
  // O "i" informa que é case insensitive e está sendo realizado um teste no "scheme"
  if(!/^Bearer$/i.test(scheme)) {
    return res.status(401).send({ error: 'Token malformatted'});
  }

  // Verificar se o token confere com o que o usuario está fazendo a requisição de entrada
  jwt.verify(token, authConfig.secret, (err, decoded) => {
    if(err) return res.status(401).send({ error: 'Token invalid'})

  // Incluir essa infomação do userId nas proximas requisições la pro controller
  req.userId = decoded.id;
  return next();
  });
};