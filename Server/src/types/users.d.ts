import type { Document, Model, Types } from "mongoose";

export interface IUser  {
    firstName: string;
    lastName: string;
    phone?: string;
    profilePicture?: string;
    auth0Id: string;
    email: string;
    role: 'admin' | 'user' | 'staff' | 'student';
    enrolledCourses?: Types.ObjectId[];
}

export interface IUserDoc extends IUser, Document {
    createdAt: Date;
    updatedAt: Date;
}

// Extend the Model interface to include custom static methods
declare module "mongoose" {
    interface Model<IUserDoc> {
        findByAuth0Id(auth0Id: string): Promise<IUserDoc | null>;
    }
}