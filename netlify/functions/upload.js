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

  // Verificar JWT
  const authHeader = event.headers.authorization;
  if (!authHeader) {
    return { statusCode: 401, body: 'Token requerido' };
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return { statusCode: 401, body: 'Token inválido' };
  }

  try {
    const { file, type } = JSON.parse(event.body);
    
    const uploadOptions = {
      folder: 'digital-signage',
      type: 'private',
      access_mode: 'authenticated',
      resource_type: type === 'video' ? 'video' : 'image',
      format: 'auto',
      quality: 'auto:best'
    };

    const result = await cloudinary.uploader.upload(file, uploadOptions);

    return {
      statusCode: 200,
      body: JSON.stringify({
        public_id: result.public_id,
        secure_url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        resource_type: result.resource_type
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error al subir archivo' })
    };
  }
};
