import { model, Schema ,Document} from "mongoose";
import { hasUncaughtExceptionCaptureCallback } from "process";
import { Interface } from "readline";

interface ICategory{
    name:string;
    description?: string;
}

export interface IPlan extends Document{
    user: Schema.Types.ObjectId;
    title: string;
    categories: ICategory[];
    tasks: Schema.Types.ObjectId[];
    isActive:boolean;
    createdAt: Date;
}

const planSchema = new Schema<IPlan>(
    {
        user: {type:Schema.Types.ObjectId, ref:"User", required:true},
        title:{type:String, required:true},
        categories:[
            {
                name:{type:String, required:true},
                description: String,
            },
        ],
        tasks:[{type:Schema.Types.ObjectId, ref:"Task"}],
        isActive:{type:Boolean, default:true}
    },{
        timestamps:true
    }
)

export const plan = model<IPlan>("Plan",planSchema)