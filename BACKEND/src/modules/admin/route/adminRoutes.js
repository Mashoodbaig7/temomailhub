import { Router } from "express";
import createPkgController from "../controllers/createPkgController.js";
import getAllPackagesController from "../controllers/getAllPackagesController.js";
import updatePackageController from "../controllers/updatePackageController.js";
import deletePackageController from "../controllers/deletePackageController.js";
import getAllUsersController from "../controllers/getAllUsersController.js";
import updateUserController from "../controllers/updateUserController.js";
import deleteUserController from "../controllers/deleteUserController.js";
import getDashboardStatsController from "../controllers/getDashboardStatsController.js";
import getEmailAnalyticsController from "../controllers/getEmailAnalyticsController.js";
import getAllContactsController from "../controllers/getAllContactsController.js";
import updateContactStatusController from "../controllers/updateContactStatusController.js";
import { getAdminProfile, updateAdminEmail, updateAdminPassword } from "../controllers/adminProfileController.js";
import loginUserController from "../controllers/loginUserController.js";
import registerAdminController from "../controllers/registerAdminController.js";
import deleteAdminController from "../controllers/deleteAdminController.js";
import suspendAdminController from "../controllers/suspendAdminController.js";
import { verifyToken } from "../../../middlewares/tokenVerification.js";
import { verifyAdmin } from "../../../middlewares/adminVerification.js";

const router = Router();

// ========== ADMIN AUTHENTICATION ROUTES ==========
router.post("/admin/login", loginUserController);
router.post("/admin/register", verifyToken, verifyAdmin, registerAdminController);

// ========== ADMIN MANAGEMENT ROUTES ==========
router.delete("/admin/delete/:id", verifyToken, verifyAdmin, deleteAdminController);
router.post("/admin/suspend/:id", verifyToken, verifyAdmin, suspendAdminController);

// ========== PACKAGE ROUTES ==========
router.post("/admin/packages", verifyToken, verifyAdmin, createPkgController);
router.get("/admin/packages", verifyToken, verifyAdmin, getAllPackagesController);
router.put("/admin/packages/:id", verifyToken, verifyAdmin, updatePackageController);
router.delete("/admin/packages/:id", verifyToken, verifyAdmin, deletePackageController);

// ========== USER MANAGEMENT ROUTES ==========
router.get("/admin/users", verifyToken, verifyAdmin, getAllUsersController);
router.put("/admin/users/:id", verifyToken, verifyAdmin, updateUserController);
router.delete("/admin/users/:id", verifyToken, verifyAdmin, deleteUserController);

// ========== DASHBOARD STATS ROUTES ==========
router.get("/admin/dashboard/stats", verifyToken, verifyAdmin, getDashboardStatsController);

// ========== EMAIL ANALYTICS ROUTES ==========
router.get("/admin/analytics/emails", verifyToken, verifyAdmin, getEmailAnalyticsController);

// ========== CONTACT SUBMISSIONS ROUTES ==========
router.get("/admin/contacts", verifyToken, verifyAdmin, getAllContactsController);
router.put("/admin/contacts/:id", verifyToken, verifyAdmin, updateContactStatusController);

// ========== ADMIN PROFILE ROUTES ==========
router.get("/admin/profile", verifyToken, verifyAdmin, getAdminProfile);
router.put("/admin/profile/email", verifyToken, verifyAdmin, updateAdminEmail);
router.put("/admin/profile/password", verifyToken, verifyAdmin, updateAdminPassword);

export default router;