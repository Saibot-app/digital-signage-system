const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { username, password } = JSON.parse(event.body);

  // En producción, usa una base de datos real
  if (username === 'admin' && password === 'admin') {
    const token = jwt.sign(
      { 
        username, 
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 horas
      },
      process.env.JWT_SECRET
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ token, user: { username, role: 'admin' } })
    };
  }

  return {
    statusCode: 401,
    body: JSON.stringify({ error: 'Credenciales inválidas' })
  };
};
