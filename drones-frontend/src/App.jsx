import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

 const obtenerImagenDron = (nombre) => {
  const nombreLower = (nombre || '').toLowerCase();
  
  if (nombreLower.includes('phantom')) {
    return '/phantom.jpg';
  } else if (nombreLower.includes('mavic')) {
    return '/mavic.jpg';
  } else if (nombreLower.includes('fpv') || nombreLower.includes('racer') || nombreLower.includes('avata')) {
    return '/fpv.jpg';
  } else if (nombreLower === 'dron-d' || nombreLower.includes('dron d')) {
    return '/dron-d.jpg';
  } else {
    return '/dron-default.jpg';
  }
};

function App() {
  const [drones, setDrones] = useState([]);
  const [loading, setLoading] = useState(true);

  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
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

  const manejarLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(`${API_URL}/clientes`);
      const clienteEncontrado = res.data.find(c => c.email === emailInput);
      
      if (clienteEncontrado) {
        setUsuarioLogueado(clienteEncontrado);
      } else {
        alert('Correo no encontrado. Por favor registrate.');
        setModoRegistro(true);
      }
    } catch (error) {
      console.error('Error al iniciar sesion:', error);
    }
  };

  const manejarRegistro = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/clientes`, { nombre: nombreInput, email: emailInput });
      alert('Cuenta creada con exito. Inicia sesion ahora.');
      setModoRegistro(false);
      setNombreInput('');
    } catch (error) {
      console.error('Error al registrar cliente:', error);
      alert('Error al registrar la cuenta');
    }
  };

  const comprarDron = async (dron) => {
    if (!usuarioLogueado) {
      alert('Por favor inicia sesion para poder realizar una compra.');
      return;
    }

    const confirmacion = window.confirm(`Deseas comprar el dron ${dron.nombre} por $${dron.precio}?`);
    if (!confirmacion) return;

    const fechaActual = new Date().toISOString().split('T')[0];

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
    <div className="container">
      
      <header>
        <div>
          <h1>VANT Shop</h1>
          <p>Los mejores drones de ultima generacion con stock exclusivo</p>
        </div>

        <div className="auth-panel">
          {usuarioLogueado ? (
            <div>
              <p style={{ margin: '0 0 10px 0' }}>Sesion activa: <strong>{usuarioLogueado.nombre}</strong></p>
              <button onClick={() => setUsuarioLogueado(null)} className="btn-danger">
                Cerrar Sesion
              </button>
            </div>
          ) : modoRegistro ? (
            <form onSubmit={manejarRegistro}>
              <h4>Crear Cuenta</h4>
              <input type="text" placeholder="Nombre completo" value={nombreInput} onChange={(e) => setNombreInput(e.target.value)} required />
              <input type="email" placeholder="Correo electronico" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} required />
              <button type="submit" className="btn-primary">Registrarse</button>
              <button type="button" onClick={() => setModoRegistro(false)} className="btn-secondary">Ya tengo cuenta</button>
            </form>
          ) : (
            <form onSubmit={manejarLogin}>
              <h4>Iniciar Sesion</h4>
              <input type="email" placeholder="Correo electronico" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} required />
              <button type="submit" className="btn-primary">Entrar</button>
              <button type="button" onClick={() => setModoRegistro(true)} className="btn-secondary">Crear una cuenta</button>
            </form>
          )}
        </div>
      </header>

      <section>
        <h2 className="catalog-title">Catalogo Disponible</h2>
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Cargando inventario...</p>
        ) : drones.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No hay drones disponibles en este momento.</p>
        ) : (
          <div className="grid-drones">
            {drones.map((dron) => (
              <div key={dron.id || dron.id_dron} className="card-dron">
                <div className="dron-image-container">
                  <img src={obtenerImagenDron(dron.nombre)} alt={dron.nombre} />
                </div>
                <div className="dron-info">
                  <h3>{dron.nombre}</h3>
                  <p>Modelo: {dron.modelo || 'Estandar'}</p>
                  <div className="dron-footer">
                    <span className="dron-precio">${dron.precio}</span>
                    <button onClick={() => comprarDron(dron)} className="btn-comprar">
                      Comprar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

export default App;