import jwt from "jsonwebtoken"

export const generateTokenAndSetCookie = (res, userID) => {
    const JWT_SECRET = process.env.JWT_SECRET;
    const payload = {userID};
    const options = { expiresIn: '7d' };

    const token = jwt.sign(payload, JWT_SECRET, options);

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
	});

    return token; 
}