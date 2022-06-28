 
const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
 


//........................**********------------ BLOG SCHEMA ------*******............ 



const blogsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required:true,
      trim:true
    },
    body: {
      type: String,
      required: true,
      trim :true
    },
    authorId: {
      type: ObjectId,
      ref: "Author",
      required: true,
      trim:true
    },
    tags: {
      type:[String],
    },
    category: {
      type:String,
      required: true,
    },
    subcategory: {
      type: [String],
    },
    deletedAt: {
      type: Date,
    //   timestamps:true
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
 



module.exports = mongoose.model("Blog", blogsSchema)
