import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async(userId) => 
{

    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
       
        const refreshToken = user.generateRefreshToken()
        

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})//save refresh token validateBeforeSave is false because many field required in model so validate fail

        return {accessToken, refreshToken}

    }catch(error){
        console.log("errr",error)
        throw new ApiError(500, "Something went wrong while generating refresh and access token.")
    }

}

const registerUser = asyncHandler( async (req, res) => {
    // res.status(200).json({
    //     message: "ok"
    // })
    //steps to register
    /*
        get user details from frontend
        validation on fields
        check if user already exist
        check for images, check for avatar
        upload them to cloudinary
        create user object - create entry in db
        remove password and refres token field from response
        check for user creation
        return res
    */

        const {fullName, email, username, password} = req.body
        console.log("fullName: ",fullName)
        // single single param check
        // if(fullName === ''){
        //     throw new ApiError(400, "Full Name is required")
        // }

        // all parameter check once empty
        if([fullName, email, username, password].some((field) => 
            field?.trim() === "")
        ){
            throw new ApiError(400, "All fields are required")
        }

        // User.findOne({email})
        // or
        const existedUser = await User.findOne({
            $or: [{ username },{ email }] //check email or username
        })

        if(existedUser){
            throw new ApiError(409, "User with email or username is already exist")
        }
        //get path of image file
        // const avatarLocalPath = req.files?.avatar[0]?.path;
        // // in case cover image not upload comment below line
        // // const coverImageLocalPath = req.files?.coverImage[0]?.path

        // // this case cover image sent or not
        // let coverImageLocalPath;
        // if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        //     coverImageLocalPath = req.files.coverImage[0].path
        // }

        // if(!avatarLocalPath){
        //     throw new ApiError(400, "Avatar is required")
        // }

        // // image upload on cloudinary
        // const avatar = await uploadOnCloudinary(avatarLocalPath)

        
        // const coverImage = await uploadOnCloudinary(coverImageLocalPath)

        // if(!avatar){
        //     throw new ApiError(400, "Avatar is required")
        // }
        //aise b save kar skte hai
        // const user = new User({ username, email, password });
        // await user.save();
        const user = await User.create({
            fullName,
            // avatar:avatar.url,
            // coverImage:coverImage?.url || "",//if cover image exist then fetch url otherwise empty
            email,
            password,
            username: username.toLowerCase()

        })

        const CreatedUsers = await User.findById(user._id).select("-password -refreshToken")

        if(!CreatedUsers){
            throw new ApiError(500, "Something went wrong when reguistering a user")
        }

        return res.status(201).json(
            new ApiResponse(200,CreatedUsers,"User Registered.")
        )

} )


export {registerUser}