import { Router } from "express";
import getController from "../controllers/get.js";
import deleteController from "../controllers/delete.js";
import updateController from "../controllers/update.js";
import submitContactController from "../controllers/submitContactController.js";
import tokenVerification from "../../../middlewares/tokenVerification.js";
import { upload } from "../../../middlewares/multer.js";
const router = Router();

router.get("/user", tokenVerification, getController)
router.delete("/user/:id", tokenVerification, deleteController)
router.put("/user/:id", tokenVerification, upload.single('profileImage'), updateController)

// Contact Form Route (Public)
router.post("/contact", submitContactController);

export default router;