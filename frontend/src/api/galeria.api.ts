import axios from "./axios";

export interface Galeria {
  ID_Galeria: number;
  Titulo: string;
  Descripcion: string;
  Fecha_Creacion: string;
  ID_Creador: number;
  Nombre_Creador: string;
  Total_Likes: number;
  Total_Comentarios: number;
  Total_Archivos: number;
  Usuario_Dio_Like: number;
  Imagen_Portada?: string;
}

export interface ArchivoGaleria {
  ID_Archivo: number;
  Nombre_Archivo: string;
  Ruta: string;
  Tipo: "Imagen" | "Video";
}

export interface ComentarioGaleria {
  ID_Comentario: number;
  Comentario: string;
  Fecha_Comentario: string;
  ID_Usuario: number;
  Nombre_Usuario: string;
  Foto_Perfil: string;
}

export interface GaleriaDetalle {
  galeria: Galeria;
  archivos: ArchivoGaleria[];
  comentarios: ComentarioGaleria[];
}

export const obtenerGalerias = async (): Promise<Galeria[]> => {
  const response = await axios.get("/galeria");
  return response.data;
};

export const obtenerGaleria = async (id: number): Promise<GaleriaDetalle> => {
  const response = await axios.get(`/galeria/${id}`);
  return response.data;
};

export const crearGaleria = async (
  titulo: string,
  descripcion: string,
  archivos: File[]
) => {
  const formData = new FormData();
  formData.append("titulo", titulo);
  formData.append("descripcion", descripcion);

  archivos.forEach((archivo) => {
    formData.append("archivos", archivo);
  });

  const response = await axios.post("/galeria", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const eliminarGaleria = async (id: number) => {
  const response = await axios.delete(`/galeria/${id}`);
  return response.data;
};

export const toggleLikeGaleria = async (id: number) => {
  const response = await axios.post(`/galeria/${id}/like`);
  return response.data;
};

export const agregarComentario = async (id: number, comentario: string) => {
  const response = await axios.post(`/galeria/${id}/comentarios`, { comentario });
  return response.data;
};

export const eliminarComentario = async (galeriaId: number, comentarioId: number) => {
  const response = await axios.delete(`/galeria/${galeriaId}/comentarios/${comentarioId}`);
  return response.data;
};
