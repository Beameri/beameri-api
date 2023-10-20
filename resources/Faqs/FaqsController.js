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

export const getFaqById = async (req, res) => {
  try {
    if (!req?.user) {
      return res.status(400).json({ message: "Please login!" });
    }

    const faqId = req.params.id;

    const faq = await Faqs.findOne({ _id: faqId, added_by: req.user._id });

    if (!faq) {
      return res.status(404).json({
        message: "FAQ not found or you don't have permission to access it",
      });
    }

    res.status(200).json({
      success: true,
      faq,
      message: "FAQ retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went wrong",
    });
  }
};

export const updateFaq = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });
    const faqId = req.params.id;

    const faq = await Faqs.findOne({ _id: faqId, added_by: req.user._id });

    if (!faq) {
      return res
        .status(404)
        .json({ message: "FAQ not found or you don't have permission" });
    }

    faq.question = req.body.question || faq.question;
    faq.answer = req.body.answer || faq.answer;

    await faq.save();

    res.status(200).json({
      success: true,
      faq,
      message: "FAQ updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

export const deleteFaq = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });
    const faqId = req.params.id;

    const faq = await Faqs.findOne({ _id: faqId, userId: req.user.id });

    if (!faq) {
      return res
        .status(404)
        .json({ message: "FAQ not found or you don't have permission" });
    }

    await Faqs.findByIdAndRemove(faqId);

    res.status(200).json({ message: "FAQ deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};
