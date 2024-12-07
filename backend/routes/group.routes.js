import { Router } from "express";
import GroupController from "../controllers/group.controller.js";
import VerifyToken from "../middlewares/auth.middleware.js";

const router = Router();

router.use(VerifyToken);
router.route("/create-group").post(GroupController.createGroup);

router.route("/add-group/:conversationId").post(GroupController.addMembers);

router.route("/get-groups").get(GroupController.getGroups);

router
  .route("/delete-group/:conversationId")
  .delete(GroupController.deleteGroup);

router
  .route("/remove-group/:conversationId")
  .patch(GroupController.removeMembers);

router.route("/:conversationId").get(GroupController.getGroup);

router.route("/leave-group/:conversationId").patch(GroupController.leaveGroup);

// router.route("/group/:id").patch(GroupController.updateGroup);

export default router;
