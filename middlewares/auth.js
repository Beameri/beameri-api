import User from "../resources/user/userModel.js";
import jwt from "jsonwebtoken";
import ErrorHander from "../Utils/errorhander.js";
import { Franchisee } from "../resources/Temple/FranchiseeModel.js";
import { Business } from "../resources/Businesses/BusinessModel.js";

export const isAuthenticatedUser = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(400).json({
        success: false,
        message: "Login to Access this resource",
      });
    }
    const getToken = req.headers;

    //remove Bearer from token
    const fronttoken = getToken.authorization.slice(7);

    const frontdecoded = jwt.verify(fronttoken, process.env.JWT_SECRET);
    if (!frontdecoded) {
      return res.status(400).json({
        success: false,
        message: "incorrect token",
      });
    }
    const fuser = await User.findById(frontdecoded.id);
    // console.log(fuser);
    // console.log(frontdecoded.id);
    req.user = fuser;
    // console.log(req.user);
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const isFranchiAuthenticated = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(400).json({
        success: false,
        message: "Login to Access this resource",
      });
    }
    const getToken = req.headers;
    //remove Bearer from token

    const fronttoken = getToken.authorization.slice(7);

    const frontdecoded = jwt.verify(fronttoken, process.env.JWT_SECRET);

    if (!frontdecoded) {
      return res.status(400).json({
        success: false,
        message: "incorrect token",
      });
    }
    // console.log(frontdecoded)
    const fuser = await Franchisee.findById(frontdecoded.id);

    req.franchi = fuser;

    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// isBusinessAuthenticated

export const isBusinessAuthenticated = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(400).json({
        success: false,
        message: "Login to Access this resource",
      });
    }
    const getToken = req.headers;
    //remove Bearer from token

    const fronttoken = getToken.authorization.slice(7);

    const frontdecoded = jwt.verify(fronttoken, process.env.JWT_SECRET);

    if (!frontdecoded) {
      return res.status(400).json({
        success: false,
        message: "incorrect token",
      });
    }
    // console.log(frontdecoded)
    const fuser = await Business.findById(frontdecoded.id);

    req.business = fuser;

    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const authorizeRoles = (...roles) => {
  //pass admin
  return (req, res, next) => {
    // console.log(req.user);
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHander(
          `Role: ${req.user.role} is not allowed to access this resouce `,
          403
        )
      );
    }

    next();
  };
};
