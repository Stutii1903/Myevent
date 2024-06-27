import { model, models, Schema } from "mongoose";
import { unique } from "next/dist/build/utils";

const UserSchema = new Schema({
    clerkId: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    username: { type: String , required: true , unique: true },
    firstName: {type: String, reuired: true},
    lastName: {type: String, required: true},
    photo: {type: String, reuired: true},
})

const User = models.User || model('User', UserSchema);

export default User;