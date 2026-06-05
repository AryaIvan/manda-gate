import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || process.env.APP_PORT || 5001;

app.listen(PORT, () => {
  console.log(`MANDA Gate API running on port ${PORT}`);
});