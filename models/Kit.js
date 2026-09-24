import mongoose from "mongoose";

const kitSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    companyUrl: { type: String, default: "" },
    jobDescription: { type: String, default: "" },
    days: { type: Number, default: 3 },
    companyBrief: { type: Object, default: {} },
    roleBreakdown: { type: String, default: "" },
    requirements: { type: Array, default: [] },
    questionBank: { type: Array, default: [] },
    flashcards: { type: Array, default: [] },
    schedule: { type: Array, default: [] },
    coverage: { type: Object, default: {} },
  },
  { timestamps: true },
);

export default mongoose.models.Kit || mongoose.model("Kit", kitSchema);
