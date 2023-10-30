import ErrorHander from "../../Utils/errorhander.js";
import catchAsyncErrors from "../../middlewares/catchAsyncErrors.js";
import Customer from "./customerModel.js";
import sendToken from "../../Utils/jwtToken.js";

// 1.Register a Customer
export const registerCustomer = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let findCustomer = await Customer.findOne({ email });
    if (findCustomer) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const customer = await Customer.create({
      name,
      email,
      password,
    });
    sendToken(customer, 201, res);
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
};

// 2.Login Customer
export const loginCustomer = async (req, res, next) => {
  const { email, password } = req.body;
  // checking if user has given password and email both

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Please Enter Email & Password" });
    }

    const customer = await Customer.findOne({ email }).select("+password");

    if (!customer) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    const isPasswordMatched = await customer.comparePassword(password);

    if (!isPasswordMatched) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    sendToken(customer, 200, res);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong!", error: error?.message || "" });
  }
};

// 3.Logout Customer
export const logoutCustomer = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

// 7.Get single customer
export const getSingleCustomer = catchAsyncErrors(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHander(`please send User ID`, 404));
  }
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    return next(
      new ErrorHander(`User does not exist with Id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    customer,
  });
});

// 9.Get all users(admin)
export const getAllCustomer = catchAsyncErrors(async (req, res, next) => {
  const customer = await Customer.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    customer,
  });
});
