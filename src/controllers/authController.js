const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// importação da hash única para criação do Token
const authConfig = require('../config/auth');

const User = require('../models/User');

const router = express.Router();

// Gerando Token jwt.sign(1º Params: {id: user.id}, 2º Params: hash única, 3º Params: Tempo de expiração do token)
function generateToken(params = {}) {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: 86400,
  });
}

router.post('/register', async (req, res) => {
  const { email } = req.body;

  try {
    // verificar se o e-mail já existe e retornar mensagem de erro.
    if (await User.findOne({ email })) {
      return res.status(400).send({ error: 'User already exists'})
    }

    const user = await User.create(req.body);

    // Para quando buscar uma lista de usuários, o campo password não venha junto
    user.password = undefined;

    return res.send({
      user,
      token: generateToken({ id: user.id }),
    });
  } catch (err) {
    return res.status(400).send({ error: 'Registration failed' });
  }
});

router.post('/authenticate', async (req, res) => {
  const { email, password } = req.body;

  // findOne({ email }) procurar por um usuário pelo email para ver se ele existe
  // .select('+passaword') é para verificar se o password informado realmente é o password cadastrado no banco de dados
  const user = await (await User.findOne({ email }).select('+password'));

  // Verificar se usuário existe
  if(!user) {
    return res.status(400).send({ error: 'User not found' });
  }

  // Verificar se a senha, é a senha cadastrada
  // bcrypt.compare(1º parâmetro: password usado para fazer o login, 2º parâmetro: password cadastrado)
  if(!await bcrypt.compare(password, user.password)) {
    return res.status(400).send({ error: 'Invalid password' });
  }

  user.password = undefined;


  return res.send({ 
    user,
    token: generateToken({ id: user.id }),
  });
});

module.exports = app => app.use('/auth', router);