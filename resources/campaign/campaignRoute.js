import express from "express";
import { isAuthenticatedUser, authorizeRoles } from "../../middlewares/auth.js";
import { CreateCampaign } from "./campaignController.js";

const router = express.Router();

router
  .route("/create")
  .post(isAuthenticatedUser, authorizeRoles("admin"), CreateCampaign);

export default router;
