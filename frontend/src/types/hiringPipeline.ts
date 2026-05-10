/** Respuesta GET /positions/:id/interviewFlow */
export type InterviewStepDto = {
  id: number;
  interviewFlowId: number;
  interviewTypeId: number;
  name: string;
  orderIndex: number;
};

export type InterviewFlowResponse = {
  positionName: string;
  interviewFlow: {
    id: number;
    description: string;
    interviewSteps: InterviewStepDto[];
  };
};

/** Fila devuelta por GET /positions/:id/candidates (incluye ids para el PUT) */
export type PositionCandidateRow = {
  fullName: string;
  currentInterviewStep: string;
  averageScore: number;
  id: number;
  applicationId: number;
};

export type UpdateStageResponse = {
  message: string;
  data: {
    id: number;
    positionId: number;
    candidateId: number;
    applicationDate: string;
    currentInterviewStep: number;
    notes: string | null;
    interviews: unknown[];
  };
};
