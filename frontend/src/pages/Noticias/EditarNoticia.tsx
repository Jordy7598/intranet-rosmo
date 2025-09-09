import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

const EditarNoticia = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  
  const [form, setForm] = useState({ 
    Titulo: "", 
    Cuerpo: "", 
    Imagen_Principal: "", 
    Areas: "", 
    Estado: "Publicada" 
  });
  
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const fetchNoticia = async () => {
      try {
        const res = await api.get(`/noticias/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setForm(res.data);
      } catch (error) {
        console.error("Error al cargar noticia:", error);
        setMensaje("❌ Error al cargar la noticia");
      }
    };
    fetchNoticia();
  }, [id, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/noticias/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMensaje("✅ Noticia actualizada correctamente");
      setTimeout(() => navigate("/noticias"), 1000);
    } catch (error) {
      console.error("Error al actualizar noticia:", error);
      setMensaje("❌ Error al actualizar la noticia");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "30px auto" }}>
      <h2>Editar Noticia</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "10px" }}>
        <input 
          name="Titulo" 
          value={form.Titulo} 
          onChange={handleChange} 
          placeholder="Título" 
          required 
        />
        <textarea 
          name="Cuerpo" 
          value={form.Cuerpo} 
          onChange={handleChange} 
          placeholder="Contenido" 
          rows={6}
          required 
        />
        <input 
          name="Imagen_Principal" 
          value={form.Imagen_Principal} 
          onChange={handleChange} 
          placeholder="URL Imagen" 
        />
        <input 
          name="Areas" 
          value={form.Areas} 
          onChange={handleChange} 
          placeholder="Áreas (separadas por comas)" 
        />
        <select name="Estado" value={form.Estado} onChange={handleChange}>
          <option value="Publicada">Publicada</option>
          <option value="Archivada">Archivada</option>
        </select>
        <button type="submit">💾 Actualizar</button>
      </form>
      {mensaje && <p>{mensaje}</p>}
    </div>
  );
};

export default EditarNoticia;