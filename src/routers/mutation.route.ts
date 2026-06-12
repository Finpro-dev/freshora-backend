import { Router } from "express";
import { mutationController } from "../controllers/mutation.controller";
import { authentication, authorization } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import {
  mutationListSchema,
  createMutationSchema,
  updateMutationSchema,
  mutationDetailSchema,
} from "../schemas/mutation.schema";

const router = Router();

// All routes require authentication
router.use(authentication);

// Get mutation statistics (dashboard)
router.get(
  "/stats",
  authorization("SUPER_ADMIN", "STORE_ADMIN"),
  mutationController.getMutationStats
);

// Get all mutations with pagination, filtering, sorting
router.get(
  "/",
  authorization("SUPER_ADMIN", "STORE_ADMIN"),
  validate(mutationListSchema),
  mutationController.getAllMutations
);

// Get single mutation detail
router.get(
  "/:mutationId",
  authorization("SUPER_ADMIN", "STORE_ADMIN"),
  validate(mutationDetailSchema),
  mutationController.getMutationDetail
);

// Create new mutation (Super Admin only)
router.post(
  "/",
  authorization("SUPER_ADMIN"),
  validate(createMutationSchema),
  mutationController.createMutation
);

// Update mutation status
router.patch(
  "/:mutationId/status",
  authorization("SUPER_ADMIN", "STORE_ADMIN"),
  validate(updateMutationSchema),
  mutationController.updateMutationStatus
);

export default router;