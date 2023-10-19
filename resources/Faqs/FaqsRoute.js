import express from "express";
import { isAuthenticatedUser, authorizeRoles } from "../../middlewares/auth.js";
import {
  AddNewFaqs,
  deleteFaq,
  getAllFaqs,
  getFaqById,
  updateFaq,
} from "./FaqsController.js";

const router = express.Router();

router
  .route("/add")
  .post(isAuthenticatedUser, authorizeRoles("admin"), AddNewFaqs);
router
  .route("/getAll")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAllFaqs);
router
  .route("/get/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getFaqById);
router
  .route("/update/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateFaq);
router
  .route("/delete/:id")
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteFaq);

export default router;
