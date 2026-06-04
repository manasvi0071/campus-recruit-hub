import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import studentsRouter from "./students";
import companiesRouter from "./companies";
import jobsRouter from "./jobs";
import applicationsRouter from "./applications";
import dashboardRouter from "./dashboard";
import grievancesRouter from "./grievances";
import seedRouter from "./seed";
import aiChatRouter from "./ai-chat";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(studentsRouter);
router.use(companiesRouter);
router.use(jobsRouter);
router.use(applicationsRouter);
router.use(dashboardRouter);
router.use(grievancesRouter);
router.use(seedRouter);
router.use(aiChatRouter);

export default router;
