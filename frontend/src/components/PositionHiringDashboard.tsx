import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Container, Form, Spinner, Table } from 'react-bootstrap';
import {
  fetchCandidatesByPosition,
  fetchInterviewFlowByPosition,
  updateCandidateInterviewStage,
} from '../api/hiringPipelineApi';
import type { InterviewStepDto, InterviewFlowResponse, PositionCandidateRow } from '../types/hiringPipeline';

function sortInterviewSteps(steps: InterviewStepDto[]): InterviewStepDto[] {
  return [...steps].sort((a, b) => {
    const o = a.orderIndex - b.orderIndex;
    if (o !== 0) return o;
    return a.id - b.id;
  });
}

function resolveCurrentStepId(
  row: PositionCandidateRow,
  stepsSorted: InterviewStepDto[]
): number | undefined {
  const byName = stepsSorted.find((s) => s.name === row.currentInterviewStep);
  return byName?.id;
}

type Props = { positionId: number };

export function PositionHiringDashboard({ positionId }: Props) {
  const [flow, setFlow] = useState<InterviewFlowResponse | null>(null);
  const [rows, setRows] = useState<PositionCandidateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const stepsSorted = useMemo(
    () =>
      flow
        ? sortInterviewSteps(flow.interviewFlow.interviewSteps)
        : [],
    [flow]
  );

  const load = useCallback(async () => {
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
    void load();
  }, [load]);

  const onStageChange = async (
    row: PositionCandidateRow,
    nextStepIdStr: string
  ) => {
    const interviewStepId = Number(nextStepIdStr);
    if (Number.isNaN(interviewStepId)) return;
    const key = `${row.applicationId}:${row.id}`;
    setSavingKey(key);
    setError(null);
    try {
      await updateCandidateInterviewStage({
        candidateId: row.id,
        applicationId: row.applicationId,
        interviewStepId,
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al actualizar etapa');
    } finally {
      setSavingKey(null);
    }
  };

  if (loading && !flow) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" aria-label="Cargando" />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Card className="mb-4">
        <Card.Body>
          <Card.Title as="h1" className="h4 mb-3">
            {flow?.positionName ?? 'Posición'}{' '}
            <span className="text-muted fw-normal fs-6">(id {positionId})</span>
          </Card.Title>
          {flow && (
            <p className="text-muted mb-0 small">{flow.interviewFlow.description}</p>
          )}
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <div className="d-flex gap-2 mb-3 align-items-center">
        <Button variant="outline-secondary" size="sm" onClick={() => void load()} disabled={loading}>
          Actualizar
        </Button>
        {loading && <Spinner animation="border" size="sm" />}
      </div>

      {!flow ? null : (
        <Table striped bordered hover responsive size="sm">
          <thead>
            <tr>
              <th>Candidato</th>
              <th>Puntuación media</th>
              <th>Etapas del proceso</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center text-muted">
                  No hay candidatos en proceso para esta posición.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const currentId = resolveCurrentStepId(row, stepsSorted);
                const selKey = `${row.applicationId}:${row.id}`;
                const selectValue =
                  currentId !== undefined ? String(currentId) : '__unmapped__';
                return (
                  <tr key={`${row.applicationId}-${row.id}`}>
                    <td>{row.fullName}</td>
                    <td>{Number.isFinite(row.averageScore) ? row.averageScore.toFixed(1) : '—'}</td>
                    <td style={{ minWidth: 220 }}>
                      <Form.Select
                        aria-label={`Etapa para ${row.fullName}`}
                        value={selectValue}
                        disabled={Boolean(savingKey)}
                        onChange={(ev) => {
                          const v = ev.target.value;
                          if (v === '__unmapped__') return;
                          void onStageChange(row, v);
                        }}
                      >
                        {currentId === undefined && (
                          <option value="__unmapped__" disabled>
                            Actual: {row.currentInterviewStep}
                          </option>
                        )}
                        {stepsSorted.map((step) => (
                          <option key={step.id} value={step.id}>
                            {step.orderIndex}. {step.name}
                          </option>
                        ))}
                      </Form.Select>
                      {savingKey === selKey && (
                        <Spinner size="sm" className="ms-2 align-middle" />
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      )}
    </Container>
  );
}
