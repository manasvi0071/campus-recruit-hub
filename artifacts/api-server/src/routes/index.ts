import { Router, type IRouter } from "express";
import healthRouter from "./health";
import studentsRouter from "./students";
import companiesRouter from "./companies";
import jobsRouter from "./jobs";
import applicationsRouter from "./applications";
import dashboardRouter from "./dashboard";
import seedRouter from "./seed";

const router: IRouter = Router();

router.use(healthRouter);
router.use(studentsRouter);
router.use(companiesRouter);
router.use(jobsRouter);
router.use(applicationsRouter);
router.use(dashboardRouter);
router.use(seedRouter);

export default router;
