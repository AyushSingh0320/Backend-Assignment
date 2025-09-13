import jwt from "jsonwebtoken";
import User from "../collections/User.model.js";


const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
      const tokenverification = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token verification:", tokenverification);

      if (!tokenverification || !tokenverification.userId) {
        return res.status(401).json({ message: 'Invalid token' });
      }
      const user = await User.findOne({ _id: tokenverification.userId });

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      req.token = token;
      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      throw error;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
};


export default auth;    