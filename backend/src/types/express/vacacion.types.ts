// types/vacacion.types.ts
export interface Vacacion {
    ID_Vacacion: number;
    ID_Empleado: number;
    Fecha_Solicitud: string;
    Fecha_Inicio: string;
    Fecha_Fin: string;
    Dias_Solicitados: number;
    Estado: 'Pendiente' | 'PendienteRH' | 'Aprobado' | 'Rechazado';
    Motivo?: string;
    Fecha_Solicitud_Format?: string;
    Fecha_Inicio_Format?: string;
    Fecha_Fin_Format?: string;
    Nombre_Empleado?: string;
  }
  
  export interface AprobacionVacacion {
    ID_Aprobacion: number;
    ID_Vacacion: number;
    ID_Aprobador: number;
    Nivel_Aprobacion: number;
    Fecha_Aprobacion: string;
    Estado: 'Aprobado' | 'Rechazado';
    Fecha_Aprobacion_Format?: string;
  }
  
  export interface VacacionFormData {
    fechaInicio: string;
    fechaFin: string;
    motivo: string;
  }
  
  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
  }