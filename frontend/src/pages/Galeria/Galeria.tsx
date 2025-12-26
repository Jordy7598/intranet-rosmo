import { Routes, Route } from "react-router-dom";
import GaleriaList from "./GaleriaList";
import CrearGaleria from "./CrearGaleria";
import GaleriaDetalle from "./GaleriaDetalle";

export default function Galeria() {
  return (
    <Routes>
      <Route index element={<GaleriaList />} />
      <Route path="crear" element={<CrearGaleria />} />
      <Route path=":id" element={<GaleriaDetalle />} />
    </Routes>
  );
}
