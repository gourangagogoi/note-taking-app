import mongoose, {Schema} from "mongoose";

export interface UserDocument extends mongoose.Document {
    email: string;
    password: string;
}

const userSchema = new Schema<UserDocument>({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
},
    {timestamps: true}
);
export const User = mongoose.model<UserDocument>("User", userSchema);