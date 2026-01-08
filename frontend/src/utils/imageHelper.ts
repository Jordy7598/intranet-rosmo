// Helper para construir URLs de imágenes de perfil

const API_BASE_URL = import.meta.env.VITE_API_URL_Images || "http://localhost:3000";

/**
 * Construye la URL completa para una foto de perfil
 * @param foto - Ruta de la foto (puede ser URL completa o ruta relativa)
 * @param nombre - Nombre del usuario para generar avatar de fallback
 * @param backgroundColor - Color de fondo para el avatar generado (sin #)
 * @returns URL completa de la imagen o avatar generado
 */
export function getFotoUrl(
  foto: string | null | undefined,
  nombre: string,
  backgroundColor: string = "cc0000"
): string {
  if (!foto) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=${backgroundColor}&color=fff`;
  }

  if (foto.startsWith('http')) {
    return foto;
  }

  return `${API_BASE_URL}${foto}`;
}

/**
 * Props para el evento onError de imágenes que genera un fallback
 * @param nombre - Nombre para el avatar de fallback
 * @param backgroundColor - Color de fondo (sin #)
 */
export function getImageErrorHandler(nombre: string, backgroundColor: string = "cc0000") {
  return (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=${backgroundColor}&color=fff`;
  };
}
