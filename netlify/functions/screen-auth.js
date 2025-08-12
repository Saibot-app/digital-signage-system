const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { screen_id, admin_token } = JSON.parse(event.body);

  try {
    // Verificar que el admin token sea válido
    jwt.verify(admin_token, process.env.JWT_SECRET);

    // Generar token específico para la pantalla
    const screenToken = jwt.sign(
      { 
        screen_id,
        type: 'screen',
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 12) // 12 horas
      },
      process.env.JWT_SECRET
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ screen_token: screenToken })
    };
  } catch (error) {
    return { statusCode: 401, body: 'Token de admin inválido' };
  }
};
