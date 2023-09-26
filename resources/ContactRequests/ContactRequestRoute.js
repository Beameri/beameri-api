import express from "express";
import { isAuthenticatedUser, authorizeRoles } from "../../middlewares/auth.js";
import {
  AddNewContactRequest,
  FindAllContactRequest,
} from "./ContactRequestsController.js";

const router = express.Router();

router
  .route("/new")
  .post(isAuthenticatedUser, authorizeRoles("admin"), AddNewContactRequest);
router
  .route("/getAll")
  .get(isAuthenticatedUser, authorizeRoles("admin"), FindAllContactRequest);

// router.route("/product/getAll/").get(getAllProduct)

export default router;
