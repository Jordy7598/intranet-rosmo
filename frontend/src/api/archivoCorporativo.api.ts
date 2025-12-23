import axios from "./axios";

export interface ArchivoCorporativo {
  ID_Archivo: number;
  Nombre_Archivo: string;
  Ruta: string;
  Categoria: string;
  Fecha_Creacion: string;
  ID_Creador: number;
  Nombre_Creador: string;
}

export const obtenerArchivos = async (): Promise<ArchivoCorporativo[]> => {
  const response = await axios.get("/archivos-corporativos");
  return response.data;
};

export const subirArchivo = async (archivo: File, categoria: string) => {
  const formData = new FormData();
  formData.append("archivo", archivo);
  formData.append("categoria", categoria);

  const response = await axios.post("/archivos-corporativos", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const eliminarArchivo = async (id: number) => {
  const response = await axios.delete(`/archivos-corporativos/${id}`);
  return response.data;
};
