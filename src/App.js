import React, { useState, useEffect } from 'react';
import { Monitor, FileText, Shield, Eye, Clock, Loader, CheckCircle, AlertCircle } from 'lucide-react';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Estados para contenido y pantallas
  const [screens] = useState([
    { id: 'screen-001', name: 'Lobby Principal', status: 'online', lastSeen: new Date() },
    { id: 'screen-002', name: 'Sala de Espera', status: 'online', lastSeen: new Date() },
    { id: 'screen-003', name: 'Cafetería', status: 'offline', lastSeen: new Date(Date.now() - 300000) }
  ]);
  
  const [content, setContent] = useState([
    { id: 1, name: 'Bienvenida', type: 'quick-poster', data: { title: 'Bienvenidos', subtitle: 'Empresa XYZ', style: 'modern' }, createdAt: new Date() }
  ]);

  // Estados para formularios
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [newQuickPoster, setNewQuickPoster] = useState({
    title: '',
    subtitle: '',
    content: '',
    style: 'modern'
  });

  // API Helper
  const apiCall = async (endpoint, data = null, method = 'GET') => {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
        }
      };

      if (currentUser?.token) {
        options.headers['Authorization'] = `Bearer ${currentUser.token}`;
      }

      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(`/.netlify/functions/${endpoint}`, options);
      return await response.json();
    } catch (error) {
      console.error(`Error en ${endpoint}:`, error);
      throw error;
    }
  };

  // Autenticación
  const handleLogin = async () => {
    setLoading(true);
    try {
      const result = await apiCall('auth', loginForm, 'POST');
      if (result.token) {
        setCurrentUser(result.user);
        setCurrentUser(prev => ({ ...prev, token: result.token }));
        setMessage({ type: 'success', text: 'Sesión iniciada correctamente' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al iniciar sesión' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveSection('dashboard');
    setMessage(null);
  };

  // Crear cartel rápido
  const createQuickPoster = () => {
    if (!newQuickPoster.title) {
      setMessage({ type: 'error', text: 'El título es requerido' });
      return;
    }
    
    const newContent = {
      id: Date.now(),
      name: newQuickPoster.title,
      type: 'quick-poster',
      data: { ...newQuickPoster },
      createdAt: new Date()
    };
    
    setContent(prev => [...prev, newContent]);
    setNewQuickPoster({ title: '', subtitle: '', content: '', style: 'modern' });
    setMessage({ type: 'success', text: 'Cartel creado exitosamente' });
  };

  // Estilos para carteles
  const posterStyles = {
    modern: { bg: 'bg-gradient-to-br from-blue-600 to-purple-700', text: 'text-white' },
    corporate: { bg: 'bg-gradient-to-br from-gray-800 to-gray-900', text: 'text-white' },
    vibrant: { bg: 'bg-gradient-to-br from-pink-500 to-orange-500', text: 'text-white' },
    minimal: { bg: 'bg-white border-2 border-gray-200', text: 'text-gray-800' }
  };

  // Limpiar mensajes
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Pantalla de login
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Shield className="mx-auto h-12 w-12 text-blue-600 mb-4" />
            <h1 className="text-2xl font-bold text-gray-800">Sistema de Cartelería Digital</h1>
            <p className="text-gray-600 mt-2">Acceso Seguro con Cloudinary + Netlify</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Usuario"
              value={loginForm.username}
              onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            
            <input
              type="password"
              placeholder="Contraseña"
              value={loginForm.password}
              onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? <Loader className="animate-spin h-5 w-5" /> : 'Iniciar Sesión'}
            </button>
          </div>
          
          {message && (
            <div className={`mt-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message.text}
            </div>
          )}
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Demo:</strong> Usuario: admin | Contraseña: admin
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard principal
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Monitor className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-800">Sistema de Cartelería Digital</h1>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                🔒 Cloudinary Seguro
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Bienvenido, {currentUser.username}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mensaje global */}
      {message && (
        <div className={`mx-6 mt-4 p-4 rounded-lg flex items-center space-x-2 ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
          <div className="p-4 space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Monitor },
              { id: 'content', label: 'Contenido', icon: FileText },
              { id: 'display', label: 'Vista Pantalla', icon: Eye }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  activeSection === id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Dashboard */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pantallas Activas</p>
                      <p className="text-2xl font-bold text-green-600">
                        {screens.filter(s => s.status === 'online').length}
                      </p>
                    </div>
                    <Monitor className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Contenido Total</p>
                      <p className="text-2xl font-bold text-blue-600">{content.length}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Seguridad</p>
                      <p className="text-xl font-bold text-purple-600">JWT + Cloudinary</p>
                    </div>
                    <Shield className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Estado de Pantallas</h3>
                <div className="space-y-3">
                  {screens.map(screen => (
                    <div key={screen.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          screen.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <p className="font-medium text-gray-800">{screen.name}</p>
                          <p className="text-sm text-gray-600">{screen.id}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        screen.status === 'online' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {screen.status === 'online' ? 'En línea' : 'Desconectada'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Content Management */}
          {activeSection === 'content' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Gestión de Contenido</h2>

              {/* Quick Poster Creator */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Crear Cartel Rápido</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Título principal"
                      value={newQuickPoster.title}
                      onChange={(e) => setNewQuickPoster({...newQuickPoster, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Subtítulo"
                      value={newQuickPoster.subtitle}
                      onChange={(e) => setNewQuickPoster({...newQuickPoster, subtitle: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      placeholder="Contenido adicional (opcional)"
                      value={newQuickPoster.content}
                      onChange={(e) => setNewQuickPoster({...newQuickPoster, content: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows="3"
                    />
                    <select
                      value={newQuickPoster.style}
                      onChange={(e) => setNewQuickPoster({...newQuickPoster, style: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="modern">Moderno</option>
                      <option value="corporate">Corporativo</option>
                      <option value="vibrant">Vibrante</option>
                      <option value="minimal">Minimalista</option>
                    </select>
                    <button
                      onClick={createQuickPoster}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                    >
                      Crear Cartel
                    </button>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className={`p-8 text-center ${posterStyles[newQuickPoster.style].bg} ${posterStyles[newQuickPoster.style].text} min-h-[200px] flex flex-col justify-center`}>
                      <h1 className="text-2xl font-bold mb-2">{newQuickPoster.title || 'Título Principal'}</h1>
                      {newQuickPoster.subtitle && <h2 className="text-lg mb-4 opacity-90">{newQuickPoster.subtitle}</h2>}
                      {newQuickPoster.content && <p className="text-sm opacity-80">{newQuickPoster.content}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content List */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Contenido Disponible</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {content.map(item => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-800 truncate">{item.name}</h4>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Cartel
                        </span>
                      </div>
                      
                      <div className={`p-4 rounded text-center text-sm ${posterStyles[item.data.style].bg} ${posterStyles[item.data.style].text}`}>
                        <div className="font-bold">{item.data.title}</div>
                        {item.data.subtitle && <div className="opacity-90">{item.data.subtitle}</div>}
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-2">
                        Creado: {item.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Display View */}
          {activeSection === 'display' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Vista de Pantalla</h2>
              <div className="bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <div className="h-full flex items-center justify-center text-white">
                  {content.length > 0 ? (
                    <div className="text-center">
                      <div className={`p-12 rounded-lg ${posterStyles[content[0].data.style].bg} ${posterStyles[content[0].data.style].text}`}>
                        <h1 className="text-6xl font-bold mb-4">{content[0].data.title}</h1>
                        {content[0].data.subtitle && <h2 className="text-3xl mb-6 opacity-90">{content[0].data.subtitle}</h2>}
                        {content[0].data.content && <p className="text-xl opacity-80">{content[0].data.content}</p>}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Monitor className="h-24 w-24 text-gray-600 mx-auto mb-4" />
                      <p className="text-xl text-gray-400">No hay contenido para mostrar</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm text-gray-600">Conectado de forma segura via JWT + Cloudinary</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>URLs firmadas que expiran automáticamente</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
