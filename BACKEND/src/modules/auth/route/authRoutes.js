import { Router } from "express";
import registerUserController from "../controllers/registerUserController.js";
import uploadFile from "../../../middlewares/multer.js"
import deleteImageController from "../controllers/deleteImage.js";
import loginUserController from "../controllers/loginUserController.js";
import googleAuthController from "../controllers/googleAuthController.js";
import logoutUserController from "../controllers/logoutUserController.js";

const router = Router();

router.post("/register", uploadFile, registerUserController);
router.post('/login', loginUserController);
router.post('/google-auth', googleAuthController);
router.post('/logout', logoutUserController);
router.post('/deleteImage', deleteImageController);

export default router;