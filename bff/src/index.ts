import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { FRONTEND_URL, SESSION_SECRET, PORT } from "./config";
import loginRoute from "./routes/login";
import meRoute from "./routes/me";
import logoutRoute from "./routes/logout";
import changePasswordRoute from "./routes/changePassword";
import forgotPasswordRoute from "./routes/forgotPassword";
import resetPasswordRoute from "./routes/resetPassword";
import notificationsRoute from "./routes/notifications";

const app = express();

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(cookieParser(SESSION_SECRET));
app.use(express.json());

app.use("/auth", loginRoute);
app.use("/auth", meRoute);
app.use("/auth", logoutRoute);
app.use("/auth", changePasswordRoute);
app.use("/auth", forgotPasswordRoute);
app.use("/auth", resetPasswordRoute);
app.use("/auth", notificationsRoute);

app.listen(Number(PORT), () => console.log(`BFF running on http://localhost:${PORT}`));
