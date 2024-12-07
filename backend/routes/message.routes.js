import { Router } from "express";
import MessageController from "../controllers/message.controller.js";
import VerifyToken from "../middlewares/auth.middleware.js";
const router = Router();

router.use(VerifyToken);

// Routes for messages
router.route("/send-message/:receiverId").post(MessageController.createMessage);
router.route("/get-messages/:receiverId").get(MessageController.getMessages);

router
  .route("/send-in-group/:conversationId")
  .post(MessageController.sendMessageInGroup);
router
  .route("/get-group-messages/:conversationId")
  .get(MessageController.getMessagesForGroup);

router
  .route("/delete-chat/:conversationId")
  .delete(MessageController.deleteOnetoOneChat);

export default router;
