import { ContactRequest } from "./ContactRequestsModel.js";
export const AddNewContactRequest = async (req, res) => {
  try {
    const { name, email, mobNumber, message } = req.body;

    const contactRequest = await ContactRequest.create({
      name,
      email,
      mobNumber,
      message,
    });

    res.status(201).json({
      success: true,
      contactRequest,
      message: "ContactRequest Added",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

export const FindAllContactRequest = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });
    // console.log(req?.user)

    const contactRequest = await ContactRequest.find().sort({ createdAt: -1 });
    if (contactRequest) {
      return res.status(200).json({
        success: true,
        contactRequest,
        message: "Fetched All ContactRequest",
      });
    } else {
      return res.status(404).json({
        success: true,

        message: "No ContactRequest till Now",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};
