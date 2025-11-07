import User from "../models/User.js";


// Middleware to verify user is authenticated
export const authMiddleware = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized: Please log in first" });
  }
  next();
};


 //Middleware to verify user is an employee
export const employeeAuthMiddleware = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized: Please log in first" });
    }

    const user = await User.findById(req.session.userId);
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!user.isEmployee) {
      return res.status(403).json({ 
        message: "Forbidden: Employee access only",
        code: "NOT_EMPLOYEE"
      });
    }

    // Attach user to request for use in routes
    req.employee = user;
    next();
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};