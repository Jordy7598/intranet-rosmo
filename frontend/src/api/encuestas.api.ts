import axios from "./axios";

export interface Encuesta {
  ID_Encuesta: number;
  Titulo: string;
  Descripcion: string;
  Link_Externo: string;
  Fecha_Publicacion: string;
  Fecha_Cierre: string;
  ID_Creador: number;
  Nombre_Creador: string;
  Estado: "Activa" | "Cerrada" | "Programada";
}

export interface CrearEncuestaData {
  titulo: string;
  descripcion?: string;
  link_externo: string;
  fecha_publicacion: string;
  fecha_cierre: string;
}

// Obtener todas las encuestas
export const obtenerEncuestas = async (): Promise<Encuesta[]> => {
  const response = await axios.get("/encuestas");
  return response.data;
};

// Obtener una encuesta específica
export const obtenerEncuesta = async (id: number): Promise<Encuesta> => {
  const response = await axios.get(`/encuestas/${id}`);
  return response.data;
};

// Crear una encuesta
export const crearEncuesta = async (data: CrearEncuestaData) => {
  const response = await axios.post("/encuestas", data);
  return response.data;
};

// Actualizar una encuesta
export const actualizarEncuesta = async (id: number, data: CrearEncuestaData) => {
  const response = await axios.put(`/encuestas/${id}`, data);
  return response.data;
};

// Eliminar una encuesta
export const eliminarEncuesta = async (id: number) => {
  const response = await axios.delete(`/encuestas/${id}`);
  return response.data;
};
