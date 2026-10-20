import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [drones, setDrones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para autenticación del cliente
  const [usuarioLogueado, setUsuarioLogueado] = useState(null); // Guarda el objeto del cliente actual
  const [emailInput, setEmailInput] = useState('');
  const [nombreInput, setNombreInput] = useState('');
  const [modoRegistro, setModoRegistro] = useState(false);

  useEffect(() => {
    cargarDrones();
  }, []);

  const cargarDrones = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/drones`);
      setDrones(res.data);
    } catch (error) {
      console.error('Error al cargar drones:', error);
    } finally {
      setLoading(false);
    }
  };

  // Manejar Inicio de Sesion buscando el email en la BD
  const manejarLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(`${API_URL}/clientes`);
      const clienteEncontrado = res.data.find(c => c.email === emailInput);
      
      if (clienteEncontrado) {
        setUsuarioLogueado(clienteEncontrado);
        alert(`Bienvenido de nuevo, ${clienteEncontrado.nombre}`);
      } else {
        alert('Correo no encontrado. Por favor registrate.');
        setModoRegistro(true);
      }
    } catch (error) {
      console.error('Error al iniciar sesion:', error);
    }
  };

  // Manejar Registro de Nuevo Cliente
  const manejarRegistro = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/clientes`, { nombre: nombreInput, email: emailInput });
      // Suponiendo que el backend devuelve el cliente o su ID, o volvemos a consultar
      alert('Cuenta creada con exito. Inicia sesion ahora.');
      setModoRegistro(false);
      setNombreInput('');
    } catch (error) {
      console.error('Error al registrar cliente:', error);
      alert('Error al registrar la cuenta');
    }
  };

  // Funcion de Compra vinculada a la tabla ventas
  const comprarDron = async (dron) => {
    if (!usuarioLogueado) {
      alert('Por favor inicia sesion arriba para poder realizar una compra.');
      return;
    }

    const confirmacion = window.confirm(`Deseas comprar el dron ${dron.nombre} por $${dron.precio}?`);
    if (!confirmacion) return;

    const fechaActual = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD

    try {
      await axios.post(`${API_URL}/ventas`, {
        cliente_id: usuarioLogueado.id || usuarioLogueado.id_cliente,
        dron_id: dron.id || dron.id_dron,
        cantidad: 1,
        fecha: fechaActual
      });
      alert(`¡Compra realizada con exito! Pedido registrado para ${usuarioLogueado.nombre}`);
    } catch (error) {
      console.error('Error al registrar la venta:', error);
      alert('Hubo un error al procesar tu compra.');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* Header y Barra de Usuario */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: '20px', marginBottom: '30px' }}>
        <div>
          <h1>Tienda de Drones 🛸</h1>
          <p>Stock exclusivo y predeterminado</p>
        </div>

        {/* Zona de Login / Usuario */}
        <div style={{ background: '#f4f4f9', padding: '15px', borderRadius: '8px' }}>
          {usuarioLogueado ? (
            <div>
              <p>Hola, <strong>{usuarioLogueado.nombre}</strong></p>
              <button onClick={() => setUsuarioLogueado(null)} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                Cerrar Sesion
              </button>
            </div>
          ) : modoRegistro ? (
            <form onSubmit={manejarRegistro} style={{ display: 'grid', gap: '5px' }}>
              <h4>Crear Cuenta</h4>
              <input type="text" placeholder="Tu Nombre" value={nombreInput} onChange={(e) => setNombreInput(e.target.value)} required style={{ padding: '5px' }} />
              <input type="email" placeholder="Tu Correo" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} required style={{ padding: '5px' }} />
              <button type="submit" style={{ background: '#28a745', color: '#fff', border: 'none', padding: '5px', cursor: 'pointer' }}>Registrarse</button>
              <button type="button" onClick={() => setModoRegistro(false)} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '12px' }}>Ya tengo cuenta</button>
            </form>
          ) : (
            <form onSubmit={manejarLogin} style={{ display: 'grid', gap: '5px' }}>
              <h4>Iniciar Sesion</h4>
              <input type="email" placeholder="Ingresa tu correo" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} required style={{ padding: '5px' }} />
              <button type="submit" style={{ background: '#007bff', color: '#fff', border: 'none', padding: '5px', cursor: 'pointer' }}>Entrar</button>
              <button type="button" onClick={() => setModoRegistro(true)} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '12px' }}>Crear una cuenta</button>
            </form>
          )}
        </div>
      </header>

      {/* Catálogo de Drones con Stock Fijo */}
      <section>
        <h2>Catalogo Disponible</h2>
        {loading ? (
          <p>Cargando drones...</p>
        ) : drones.length === 0 ? (
          <p>No hay drones disponibles en este momento.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {drones.map((dron) => (
              <div key={dron.id || dron.id_dron} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', background: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <h3>{dron.nombre}</h3>
                <p><strong>Modelo:</strong> {dron.modelo || 'N/A'}</p>
                <p style={{ fontSize: '18px', color: '#28a745', fontWeight: 'bold' }}>${dron.precio}</p>
                <button 
                  onClick={() => comprarDron(dron)} 
                  style={{ width: '100%', padding: '10px', background: '#ffc107', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}>
                  Comprar Dron
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

export default App;