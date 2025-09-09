// src/types/express/index.d.ts
import "express";

declare module "express" {
  export interface Request {
    user?: {
      id: number;
      rol: number;
      empleado: number;
    };
  }
}
 