import { Request, Response } from 'express';
import {
    getCandidatesByPositionService,
    getInterviewFlowByPositionService,
    listPositionsService,
} from '../../application/services/positionService';

export const listPositions = async (_req: Request, res: Response) => {
    try {
        const positions = await listPositionsService();
        res.status(200).json(positions);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error retrieving positions', error: error.message });
        } else {
            res.status(500).json({ message: 'Error retrieving positions', error: String(error) });
        }
    }
};

export const getCandidatesByPosition = async (req: Request, res: Response) => {
    try {
        const positionId = parseInt(req.params.id);
        const candidates = await getCandidatesByPositionService(positionId);
        res.status(200).json(candidates);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error retrieving candidates', error: error.message });
        } else {
            res.status(500).json({ message: 'Error retrieving candidates', error: String(error) });
        }
    }
};

export const getInterviewFlowByPosition = async (req: Request, res: Response) => {
    try {
        const positionId = parseInt(req.params.id);
        const payload = await getInterviewFlowByPositionService(positionId);
        // Servicio ya devuelve { positionName, interviewFlow } — no anidar otra vez.
        res.status(200).json(payload);
    } catch (error) {
        if (error instanceof Error) {
            res.status(404).json({ message: 'Position not found', error: error.message });
        } else {
            res.status(500).json({ message: 'Server error', error: String(error) });
        }
    }
};