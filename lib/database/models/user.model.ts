import mongoose, { model, models, Schema , Document } from "mongoose"
import { unique } from "next/dist/build/utils";


export interface IUser extends Document {
    _id: string;      // Add _id field
    clerkId: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    photo: string;
  }
const UserSchema = new Schema({
    clerkId: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    username: { type: String , required: true , unique: true },
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    photo: {type: String, required: true},
})

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
