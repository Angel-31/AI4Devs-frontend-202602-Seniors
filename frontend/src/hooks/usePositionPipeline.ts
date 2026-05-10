import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchCandidatesByPosition,
  fetchInterviewFlowByPosition,
  updateCandidateInterviewStage,
} from '../api/hiringPipelineApi';
import type {
  InterviewStepDto,
  InterviewFlowResponse,
  PositionCandidateRow,
} from '../types/hiringPipeline';

export function sortInterviewSteps(steps: InterviewStepDto[]): InterviewStepDto[] {
  return [...steps].sort((a, b) => {
    const o = a.orderIndex - b.orderIndex;
    if (o !== 0) return o;
    return a.id - b.id;
  });
}

export function resolveCurrentStepId(
  row: PositionCandidateRow,
  stepsSorted: InterviewStepDto[]
): number | undefined {
  const byName = stepsSorted.find((s) => s.name === row.currentInterviewStep);
  return byName?.id;
}

export function usePositionPipeline(positionId: number) {
  const [flow, setFlow] = useState<InterviewFlowResponse | null>(null);
  const [rows, setRows] = useState<PositionCandidateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const stepsSorted = useMemo(
    () => (flow ? sortInterviewSteps(flow.interviewFlow.interviewSteps) : []),
    [flow]
  );

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [f, list] = await Promise.all([
        fetchInterviewFlowByPosition(positionId),
        fetchCandidatesByPosition(positionId),
      ]);
      setFlow(f);
      setRows(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar datos');
      setFlow(null);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [positionId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const updateStage = useCallback(
    async (row: PositionCandidateRow, interviewStepId: number) => {
      const key = `${row.applicationId}:${row.id}`;
      setSavingKey(key);
      setError(null);
      try {
        await updateCandidateInterviewStage({
          candidateId: row.id,
          applicationId: row.applicationId,
          interviewStepId,
        });
        await reload();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al actualizar etapa');
      } finally {
        setSavingKey(null);
      }
    },
    [reload]
  );

  return {
    flow,
    rows,
    loading,
    error,
    setError,
    savingKey,
    stepsSorted,
    reload,
    updateStage,
  };
}
