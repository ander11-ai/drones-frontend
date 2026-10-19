import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Obtiene la URL desplegada en Render o la local si pruebas en tu máquina
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [drones, setDrones] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para formulario de nuevo Dron
  const [nombre, setNombre] = useState('');
  const [modelo, setModelo] = useState('');
  const [precio, setPrecio] = useState('');

  // Cargar datos al iniciar la aplicación
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const resDrones = await axios.get(`${API_URL}/drones`);
      const resClientes = await axios.get(`${API_URL}/clientes`);
      setDrones(resDrones.data);
      setClientes(resClientes.data);
    } catch (error) {
      console.error('Error al cargar datos desde el backend:', error);
    } finally {
      setLoading(false);
    }
  };

  const guardarDron = async (e) => {
    e.preventDefault();
    if (!nombre || !precio) return alert('Por favor llena los campos requeridos');

    try {
      await axios.post(`${API_URL}/drones`, { nombre, modelo, precio: parseFloat(precio) });
      setNombre('');
      setModelo('');
      setPrecio('');
      cargarDatos(); // Recargar la lista
    } catch (error) {
      console.error('Error al guardar dron:', error);
      alert('Error al registrar el dron');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>🚁 Tienda de Drones</h1>
        <p>Sistema de gestión de inventario y clientes</p>
      </header>

      {/* Formulario para agregar Dron */}
      <section style={{ background: '#f4f4f9', padding: '20px', borderRadius: '8px', marginBottom: '30px', color: '#333' }}>
        <h2>Registrar Nuevo Dron</h2>
        <form onSubmit={guardarDron} style={{ display: 'grid', gap: '10px' }}>
          <input
            type="text"
            placeholder="Nombre del dron (ej. Mavic Air 2)"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            required
          />
          <input
            type="text"
            placeholder="Modelo (ej. DJI Pro)"
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input
            type="number"
            step="0.01"
            placeholder="Precio ($)"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            required
          />
          <button type="submit" style={{ padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Guardar Dron
          </button>
        </form>
      </section>

      {/* Lista de Drones */}
      <section style={{ marginBottom: '30px' }}>
        <h2>Catálogo de Drones</h2>
        {loading ? (
          <p>Cargando datos desde la base de datos...</p>
        ) : drones.length === 0 ? (
          <p>No hay drones registrados en la base de datos.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
            {drones.map((dron) => (
              <div key={dron.id || dron.id_dron} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
                <h3>{dron.nombre}</h3>
                <p><strong>Modelo:</strong> {dron.modelo || 'N/A'}</p>
                <p><strong>Precio:</strong> ${dron.precio}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Lista de Clientes */}
      <section>
        <h2>Clientes Registrados</h2>
        {loading ? (
          <p>Cargando clientes...</p>
        ) : clientes.length === 0 ? (
          <p>No hay clientes registrados.</p>
        ) : (
          <ul>
            {clientes.map((cliente) => (
              <li key={cliente.id || cliente.id_cliente}>
                {cliente.nombre} {cliente.apellido} - {cliente.email || cliente.telefono || ''}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default App;