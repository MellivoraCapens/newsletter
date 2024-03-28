import mongoose, { Schema } from "mongoose";

export interface IComment extends mongoose.Document {
  comment: string;
  author: Schema.Types.ObjectId;
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
  parentId: {
    type: Schema.Types.ObjectId,
    ref: "Post",
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
