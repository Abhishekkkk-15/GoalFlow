import { Schema, model, Document } from "mongoose";

export interface ITask extends Document{
    plan: Schema.Types.ObjectId,
    title: string;
    description?: string;
    completed: boolean;
    categorie:string;
    dueDate?:Date;
    createdAT: Date;
}

const taskSchema = new Schema<ITask>(
  {
    plan: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
    title: { type: String, required: true },
    description: String,
    completed: { type: Boolean, default: false },
    categorie:{type:String, required:true},
    dueDate: Date,
  },
  { timestamps: true }
)
export const Task = model<ITask>("Task", taskSchema);
