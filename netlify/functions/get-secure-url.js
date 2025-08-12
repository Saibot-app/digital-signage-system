const cloudinary = require('cloudinary').v2;
const jwt = require('jsonwebtoken');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Verificar JWT (para pantallas autorizadas)
  const authHeader = event.headers.authorization;
  if (!authHeader) {
    return { statusCode: 401, body: 'Token requerido' };
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que sea una pantalla autorizada
    if (!decoded.screen_id && decoded.role !== 'admin') {
      return { statusCode: 403, body: 'No autorizado para pantallas' };
    }
  } catch (error) {
    return { statusCode: 401, body: 'Token inválido' };
  }

  try {
    const { public_id, transformations } = JSON.parse(event.body);
    
    // Generar URL firmada que expira en 1 hora
    const secureUrl = cloudinary.url(public_id, {
      sign_url: true,
      type: 'private',
      auth_token: {
        duration: 3600, // 1 hora
        start_time: Math.floor(Date.now() / 1000)
      },
      quality: 'auto:best',
      fetch_format: 'auto',
      ...transformations
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ secure_url: secureUrl })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error al generar URL segura' })
    };
  }
};
