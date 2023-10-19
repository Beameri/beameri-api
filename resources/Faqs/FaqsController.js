import Faqs from "./FaqsModel.js";

export const AddNewFaqs = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });

    const faqs = {
      question: req.body.question,
      answer: req.body.answer,
      added_by: req.user._id,
    };

    const newFaqs = await Faqs.create(faqs);

    res.status(201).json({
      success: true,
      newFaqs,
      message: "Faqs Added",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

export const getAllFaqs = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });

    const faqs = await Faqs.find().sort({ createdAt: -1 });
    if (faqs) {
      return res.status(200).json({
        success: true,
        faqs,
        message: "Fetched All faqs",
      });
    } else {
      return res.status(404).json({
        success: true,
        message: "No faqs till Now",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};
