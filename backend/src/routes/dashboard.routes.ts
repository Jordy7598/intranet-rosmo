import { Router } from "express";
import { getDashboard, getSummary} from "../controllers/dashboard.controller";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middlewares";


const router = Router();

router.get("/", verifyToken, getDashboard);
router.get("/summary", verifyToken, authorizeRoles(1, 2, 3, 4, 5), getSummary);

export default router;
