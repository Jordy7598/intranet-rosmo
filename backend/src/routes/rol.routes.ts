import { Router } from "express";
//import { getRolesHandler } from "../controllers/rol.controller";
import {
  getRoles,
  getRolById,
  createRol,
  updateRol,
  deleteRol,
} from "../controllers/rol.controller";
const router = Router();

//router.get("/roles", getRolesHandler);
router.get("/", getRoles);
router.get("/:id", getRolById);
router.post("/", createRol);
router.put("/:id", updateRol);
router.delete("/:id", deleteRol);
export default router;