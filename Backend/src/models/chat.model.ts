import { timeStamp } from "console";
import { Schema, model, Document } from "mongoose";

interface IMessage{
    sender: "user" | "ai",
    message: string;
    timestamp: Date;
}

export interface IChat extends Document{
    user: Schema.Types.ObjectId;
    messages: IMessage[],
}

const chatSchema = new Schema<IChat>(
    {
        user: {type:Schema.Types.ObjectId, ref:"User", required:true},
        messages:[
            {
                sender:{type:String, enum: ["user","ai"], required:true},
                message:{type:String, required:true},
                timestamp:{type:Date, default: Date.now},
            }
        ],
    },
    {timestamps:true}
)
export const Chat = model<IChat>("Chat", chatSchema);
