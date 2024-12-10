import { Router } from "express";
import UserController from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import verifyToken from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/register")
  .post(upload.single("avatar"), UserController.register);
router.route("/login").post(UserController.login);

router.use(verifyToken);
router.route("/logout").post(UserController.logout);
router.route("/get-allUsers").get(UserController.getAllUsers);
router.route("/search-user").get(UserController.searchUser);
routes.route("/update-user").put(UserController.updateProfile);

export default router;
