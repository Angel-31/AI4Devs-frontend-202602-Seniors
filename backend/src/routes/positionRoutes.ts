import { Router } from 'express';
import { getCandidatesByPosition, getInterviewFlowByPosition } from '../presentation/controllers/positionController';

const router = Router();

router.get('/:id/candidates', getCandidatesByPosition);
router.get('/:id/interviewflow', getInterviewFlowByPosition);
router.get('/:id/interviewFlow', getInterviewFlowByPosition);

export default router;
