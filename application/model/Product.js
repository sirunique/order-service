const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String },
    description: { type: String },
    price: { type: Number },
  },
  {
    timestamps: true,
  }
);

const ProductModel = mongoose.model("Product", productSchema);

module.exports = {
  ProductModel,
};
