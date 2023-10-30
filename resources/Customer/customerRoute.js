import express from "express";
import {
  registerCustomer,
  loginCustomer,
  getAllCustomer,
  getSingleCustomer,
  logoutCustomer,
} from "./customerController.js";
import { isAuthenticatedUser, authorizeRoles } from "../../middlewares/auth.js";

const router = express.Router();

router.route("/register").post(registerCustomer);

router.route("/login").post(loginCustomer);

router.route("/logout").get(logoutCustomer);

router.route("/getcustomers").get(getAllCustomer);
router.route("/getcustomer/:id").get(getSingleCustomer);

export default router;
