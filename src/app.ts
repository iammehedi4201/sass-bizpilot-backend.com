import {
  globalErrorHandler,
  globalNotFoundHandler,
} from "@/middlewares/common";
import { ENV } from "./config";
import { connectDB } from "./database";
import routes from "./Routes";
import { app } from "./server";

// Connect MongoDB before starting the server
connectDB();

//application routes
app.use("/api", routes);

app.use(globalNotFoundHandler);
app.use(globalErrorHandler);

app.listen(ENV.PORT, () => {
  console.log(`Server running at http://localhost:${ENV.PORT}`);
});

export { app };
