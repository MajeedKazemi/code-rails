import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const Schema = mongoose.Schema;

const Session = new Schema({
    refreshToken: {
        type: String,
        default: "",
    },
});

export interface IUser extends mongoose.Document {
    username: string;
    firstName: string;
    lastName: string;
    role: string;
    age: number;
    grade: number;
    themes: Array<string>;
    editorType: "copilot" | "intellisense";
    gender: "male" | "female" | "other";
    ethnicity: string;
    codingExperience: Array<string>;
    refreshToken: Array<{ refreshToken: string }>;
}

export const getUserData = (user: IUser) => {
    return {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        age: user.age,
        grade: user.grade,
        themes: user.themes,
        editorType: user.editorType,
        gender: user.gender,
        ethnicity: user.ethnicity,
        codingExperience: user.codingExperience,
    };
};

export const getPrimaryTheme = (user: IUser) => {
    return user.themes && user.themes.length > 0 ? user.themes[0] : undefined;
};

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    firstName: {
        type: String,
        default: "",
    },
    lastName: {
        type: String,
        default: "",
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user",
    },
    age: {
        type: Number,
        default: 0,
    },
    grade: {
        type: Number,
        default: 0,
    },
    themes: {
        type: [String],
        default: [],
    },
    editorType: {
        type: String,
        enum: ["copilot", "intellisense"],
        default: "intellisense",
    },
    gender: {
        type: String,
        enum: ["male", "female", "other"],
    },
    ethnicity: {
        type: String,
        default: "",
    },
    codingExperience: {
        type: [String],
        default: [],
    },
    refreshToken: {
        type: [Session],
    },
});

UserSchema.set("toJSON", {
    transform: (doc, ret, options) => {
        // Remove refreshToken from the response
        delete ret.refreshToken;

        return ret;
    },
});

UserSchema.plugin(passportLocalMongoose);

export const UserModel = mongoose.model<IUser>("User", UserSchema);
