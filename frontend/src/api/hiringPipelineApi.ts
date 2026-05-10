import { getApiBaseUrl } from '../config/apiBaseUrl';
import type {
  InterviewFlowResponse,
  PositionCandidateRow,
  UpdateStageResponse,
} from '../types/hiringPipeline';

async function parseJsonOrThrow(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error(`Respuesta no JSON (${res.status})`);
  }
}

export async function fetchInterviewFlowByPosition(
  positionId: number
): Promise<InterviewFlowResponse> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/positions/${positionId}/interviewFlow`);
  const body = await parseJsonOrThrow(res);
  if (!res.ok) {
    const msg =
      body && typeof body === 'object' && 'message' in body
        ? String((body as { message: unknown }).message)
        : `Error ${res.status}`;
    throw new Error(msg);
  }
  return body as InterviewFlowResponse;
}

export async function fetchCandidatesByPosition(
  positionId: number
): Promise<PositionCandidateRow[]> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/positions/${positionId}/candidates`);
  const body = await parseJsonOrThrow(res);
  if (!res.ok) {
    const msg =
      body && typeof body === 'object' && 'message' in body
        ? String((body as { message: unknown }).message)
        : `Error ${res.status}`;
    throw new Error(msg);
  }
  return body as PositionCandidateRow[];
}

export async function updateCandidateInterviewStage(params: {
  candidateId: number;
  applicationId: number;
  interviewStepId: number;
}): Promise<UpdateStageResponse> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/candidates/${params.candidateId}/stage`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      applicationId: String(params.applicationId),
      currentInterviewStep: String(params.interviewStepId),
    }),
  });
  const body = await parseJsonOrThrow(res);
  if (!res.ok) {
    const msg =
      body && typeof body === 'object' && 'error' in body
        ? String((body as { error: unknown }).error)
        : body && typeof body === 'object' && 'message' in body
          ? String((body as { message: unknown }).message)
          : `Error ${res.status}`;
    throw new Error(msg);
  }
  return body as UpdateStageResponse;
}
