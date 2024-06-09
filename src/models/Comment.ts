import mongoose, { Schema } from "mongoose";
import Post from "./Post";

export interface IComment extends mongoose.Document {
  comment: string;
  author: Schema.Types.ObjectId;
  postId: Schema.Types.ObjectId;
  parentId: Schema.Types.ObjectId;
  commentLayerCount: number;
  comments: Array<Schema.Types.ObjectId>;
  upvotes: Array<Schema.Types.ObjectId>;
  downvotes: Array<Schema.Types.ObjectId>;
  createdAt: Date;
}

const CommentSchema: Schema = new Schema<IComment>({
  comment: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  postId: {
    type: Schema.Types.ObjectId,
    ref: "Post",
  },
  parentId: {
    type: Schema.Types.ObjectId,
  },
  commentLayerCount: {
    type: Number,
    default: 1,
  },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  upvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  downvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Comment", CommentSchema);
