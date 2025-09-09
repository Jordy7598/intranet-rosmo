import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const CrearNoticia = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    Titulo: "",
    Cuerpo: "",
    Imagen_Principal: "",
    Areas: "",
    Estado: "Publicada",
  });

  const [mensaje, setMensaje] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/noticias", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMensaje("✅ Noticia creada correctamente");
      setTimeout(() => navigate("/noticias"), 1000);
    } catch (error) {
      console.error("Error al crear noticia:", error);
      setMensaje("❌ Error al crear noticia");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "30px auto" }}>
      <h2>Crear Noticia</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "10px" }}>
        <input
          name="Titulo"
          placeholder="Título"
          value={form.Titulo}
          onChange={handleChange}
          required
        />
        <textarea
          name="Cuerpo"
          placeholder="Cuerpo"
          value={form.Cuerpo}
          onChange={handleChange}
          rows={6}
          required
        />
        <input
          name="Imagen_Principal"
          placeholder="URL Imagen"
          value={form.Imagen_Principal}
          onChange={handleChange}
        />
        <input
          name="Areas"
          placeholder="Áreas (separadas por comas)"
          value={form.Areas}
          onChange={handleChange}
        />
        <select name="Estado" value={form.Estado} onChange={handleChange}>
          <option value="Publicada">Publicada</option>
          <option value="Archivada">Archivada</option>
        </select>
        <button type="submit">➕ Crear</button>
      </form>
      {mensaje && <p>{mensaje}</p>}
    </div>
  );
};

export default CrearNoticia;
