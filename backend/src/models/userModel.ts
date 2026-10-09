import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    isAdmin: boolean;
}


const userSchema = new Schema<IUser>({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true},
    email: { type: String, required: true},
    password: { type: String, required: true},
    isAdmin: { type: Boolean, required: true, default: false},
})

const userModel = mongoose.model<IUser>('User', userSchema);

export default userModel;
