import mongoose, { Schema } from "mongoose";

export interface IPost extends mongoose.Document {
  title: string;
  content: string;
  picture?: string;
  tags: Array<string>;
  author: mongoose.Schema.Types.ObjectId;
  upvotes: Array<mongoose.Schema.Types.ObjectId>;
  downvotes: Array<mongoose.Schema.Types.ObjectId>;
  comments: Array<mongoose.Schema.Types.ObjectId>;
  createdAt: Date;
}

const PostSchema: Schema = new Schema<IPost>({
  title: {
    type: String,
    required: [true, "Please add a title"],
  },
  content: {
    type: String,
    required: [true, "Please add a description"],
  },
  picture: {
    type: String,
  },
  tags: {
    type: [String],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
  },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Post", PostSchema);
