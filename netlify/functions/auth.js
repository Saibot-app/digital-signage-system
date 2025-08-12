exports.handler = async (event, context) => {
  // Configurar headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { username, password } = JSON.parse(event.body);

    // Validación simple sin JWT (temporalmente)
    if (username === 'admin' && password === 'admin') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          token: 'simple-token-' + Date.now(),
          user: { username: 'admin', role: 'admin' }
        })
      };
    }

    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Credenciales inválidas' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Error interno del servidor' })
    };
  }
};
