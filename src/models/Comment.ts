import mongoose, { Schema } from "mongoose";

export interface IComment extends mongoose.Document {
  comment: string;
  author: mongoose.Schema.Types.ObjectId;
  parentId: mongoose.Schema.Types.ObjectId;
  comments: Array<mongoose.Schema.Types.ObjectId>;
  createdAt: Date;
}

const CommentSchema: Schema = new Schema<IComment>({
  comment: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Comment", CommentSchema);
