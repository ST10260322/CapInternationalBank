// database.js
import mongoose from "mongoose";

const MONGO_URI = "mongodb+srv://st10260322:Birdzone33@customerportalcluster.uniai3q.mongodb.net/CustomerPortalDB?retryWrites=true&w=majority&appName=CustomerPortalCluster";

// Connect to MongoDB Atlas
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch(err => console.error("❌ MongoDB connection error:", err));

export default mongoose;
