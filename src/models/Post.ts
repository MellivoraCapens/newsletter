import mongoose, { Schema } from "mongoose";

export interface IPost extends mongoose.Document {
  title: string;
  content: string;
  image: boolean;
  tags: Array<string>;
  author: Schema.Types.ObjectId;
  upvotes: Array<Schema.Types.ObjectId>;
  downvotes: Array<Schema.Types.ObjectId>;
  comments: Array<Schema.Types.ObjectId>;
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
  image: {
    type: Boolean,
    default: false,
  },
  tags: {
    type: [String],
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  upvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  downvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Post", PostSchema);
