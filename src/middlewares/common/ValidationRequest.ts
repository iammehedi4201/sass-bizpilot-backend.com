import CatchAsync from "@/Utils/CatchAsync";
import { ZodObject } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ValidateRequest = (Schema: ZodObject<any>) => {
  return CatchAsync(async (req, res, next) => {
    // Parse and use the parsed result so preprocess transforms persist
    const parsed = await Schema.parseAsync({
      body: req.body,
      cookies: req.cookies,
      query: req.query,
      params: req.params,
    });

    // Assign parsed values back to request (only if present)
    if (parsed.body) req.body = parsed.body as any;
    if (parsed.query) req.query = parsed.query as any;
    if (parsed.params) req.params = parsed.params as any;
    if (parsed.cookies) req.cookies = parsed.cookies as any;

    next();
  });
};

export default ValidateRequest;
