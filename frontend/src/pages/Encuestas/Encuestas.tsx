import { Routes, Route } from "react-router-dom";
import EncuestasList from "./EncuestasList";
import CrearEncuesta from "./CrearEncuesta";
import EncuestaDetalle from "./EncuestaDetalle";

const Encuestas: React.FC = () => {
  return (
    <Routes>
      <Route index element={<EncuestasList />} />
      <Route path="crear" element={<CrearEncuesta />} />
      <Route path="editar/:id" element={<CrearEncuesta />} />
      <Route path=":id" element={<EncuestaDetalle />} />
    </Routes>
  );
};

export default Encuestas;