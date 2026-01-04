import prisma from "../config/db.js";
import bcrypt from "bcryptjs"
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";

export const signup = async (req, res)=> {
    try{
        const {name, email, password} = req.body;

        if (!name || !email || !password){
            return res.status(400).send("All fields are required")
        }

        const key = String(email).toLowerCase().trim()

        const userAlreadyExists = await prisma.user.findUnique({
            where: {email: key}
        })

        if (userAlreadyExists){
            return res.status(400).json({success: false, message: "User already exists"})
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const createUser = await prisma.user.create({
            data: {
                name: name.trim().charAt(0).toUpperCase() + name.trim().slice(1),
                email: key, 
                password: hashedPassword
            }
        })
        
        // jwt
        generateTokenAndSetCookie(res, createUser.id)

        res.status(201).json({
            success: true,
            message: "user Created Successfully",
            user: {...createUser, password: undefined} // not passing the password
        })
        
    }
    catch(err){
        res.status(400).json({success: false, message: err.message})
    }
}

export const login = async (req, res)=> {

    try{
        const {email, password} = req.body

        if (!email || !password){
            return res.status(400).json({ success: false, message: "All fields are required" })
        }

        const key = String(email).toLowerCase().trim()

        const findUser = await prisma.user.findUnique({
            where: {
                email: key
            }
        })

        if (!findUser){
            return res.status(401).json({ success: false, message: "Invalid credentials" })
        }

        const checkPassword = await bcrypt.compare(password, findUser.password)

        if (!checkPassword) {
        return res.status(401).json({ success: false, message: "Invalid credentials" })
        }

        generateTokenAndSetCookie(res, findUser.id);

        await prisma.user.update({
        where: {email: key},
        data: {
            lastLogin: new Date()}
        })

		res.status(200).json({success: true, message: "Logged in successfully",
			user: {...findUser, password: undefined}})
    }
    catch(err){
        throw new Error(err)
    }
}

export const logout = (req, res)=> {
    res.clearCookie("token")
    res.status(200).json({ success: true, message: "Logged out successfully" })
}


export const checkAuth = async(req, res) => {
    const id = req.userID
    try{
        const findUser = await prisma.user.findUnique({
            where: {id}
        })

        if (!findUser){
            return res.status(400).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, user: {...findUser, password: undefined}})
    }
    catch(err){
        throw new Error(err.message)
    }
}