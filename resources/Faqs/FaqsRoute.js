import express from "express";
import { isAuthenticatedUser, authorizeRoles } from "../../middlewares/auth.js";
import { AddNewFaqs, getAllFaqs } from "./FaqsController.js";

const router = express.Router();

router
  .route("/add")
  .post(isAuthenticatedUser, authorizeRoles("admin"), AddNewFaqs);
router
  .route("/getAll")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAllFaqs);

export default router;
