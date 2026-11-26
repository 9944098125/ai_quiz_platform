import { Router } from "express";
import { getMe, onboard, updateMe } from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  onboardUserSchema,
  updateProfileSchema,
} from "../validators/user.validator.js";

const userRouter = Router();

userRouter.post("/onboard", validate({ body: onboardUserSchema }), onboard);
userRouter.get("/me", requireAuth, getMe);
userRouter.patch(
  "/me",
  requireAuth,
  validate({ body: updateProfileSchema }),
  updateMe,
);

export default userRouter;
