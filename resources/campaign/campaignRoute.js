import express from "express";
import { isAuthenticatedUser, authorizeRoles } from "../../middlewares/auth.js";
import { CreateCampaign, GetCampaign } from "./campaignController.js";

const router = express.Router();

router
  .route("/create")
  .post(isAuthenticatedUser, authorizeRoles("admin"), CreateCampaign);

router
  .route("/getAll")
  .get(isAuthenticatedUser, authorizeRoles("admin"), GetCampaign);

export default router;
