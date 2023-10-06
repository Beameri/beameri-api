import express from "express";
import { isAuthenticatedUser, authorizeRoles } from "../../middlewares/auth.js";
import {
  CreateCampaign,
  GetAllWhatsappMsg,
  GetCampaign,
  GetMsgStatus,
  MergeVideo,
  SendMsgOnWhatsapp,
  VideoToText,
} from "./campaignController.js";

const router = express.Router();

router
  .route("/create")
  .post(isAuthenticatedUser, authorizeRoles("admin"), CreateCampaign);
router
  .route("/convert")
  .post(isAuthenticatedUser, authorizeRoles("admin"), VideoToText);
router
  .route("/merge")
  .post(isAuthenticatedUser, authorizeRoles("admin"), MergeVideo);

router
  .route("/getAll")
  .get(isAuthenticatedUser, authorizeRoles("admin"), GetCampaign);
router
  .route("/sendOnWhatsapp")
  .post(isAuthenticatedUser, authorizeRoles("admin"), SendMsgOnWhatsapp);
router
  .route("/message-status/:messageSid")
  .get(isAuthenticatedUser, authorizeRoles("admin"), GetMsgStatus);

router
  .route("/getAllWhatsappmsg/:createdBy")
  .get(isAuthenticatedUser, authorizeRoles("admin"), GetAllWhatsappMsg);

export default router;
