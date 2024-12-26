const express = require("express");
const auth = require("../middleware/auth.middleware");
const quoteController = require("./quote.controller");
const router = express.Router();

router.post(
  "/createQuote",
  auth(["Customer", "Member", "SuperAdmin"]),
  quoteController.createQuote
);
router.get(
  "/getAllQuotes",
  auth(["Customer", "Member", "SuperAdmin"]),
  quoteController.getAllQuotes
);
router.get(
  "/getQuoteById/:id",
  auth(["SuperAdmin"]),
  quoteController.getQuoteById
);
router.delete(
  "/deleteQuote/:id",
  auth(["SuperAdmin"]),
  quoteController.deleteQuote
);

module.exports = router;
