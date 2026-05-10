import React from 'react';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { resolveCurrentStepId, usePositionPipeline } from '../hooks/usePositionPipeline';
import type { InterviewStepDto, PositionCandidateRow } from '../types/hiringPipeline';
import '../styles/positions.css';

function ScoreDots({ score }: { score: number }) {
  const filled = Math.max(0, Math.min(5, Math.round(Number.isFinite(score) ? score : 0)));
  return (
    <div className="score-dots">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={`score-dot ${i < filled ? 'filled' : ''}`} aria-hidden />
      ))}
    </div>
  );
}

type Props = { positionId: number };

/** Tablero Kanban por pasos del flujo + cambio rápido de etapa por candidato */
export function PositionHiringDashboard({ positionId }: Props) {
  const {
    flow,
    rows,
    loading,
    error,
    setError,
    savingKey,
    reload,
    updateStage,
    stepsSorted,
  } = usePositionPipeline(positionId);

  const columns = stepsSorted.map((step) => ({
    step,
    rows: rows.filter((r) => r.currentInterviewStep === step.name),
  }));

  const unmatched = rows.filter(
    (r) => !stepsSorted.some((s) => s.name === r.currentInterviewStep)
  );

  const renderMiniSelect = (
    row: PositionCandidateRow,
    stepsLocal: InterviewStepDto[]
  ) => {
    const currentId = resolveCurrentStepId(row, stepsSorted);
    const selectValue =
      currentId !== undefined ? String(currentId) : '__unmapped__';

    return (
      <Form.Select
        size="sm"
        className="kanban-mini-select mt-2"
        value={selectValue}
        aria-label={`Mover ${row.fullName}`}
        disabled={Boolean(savingKey)}
        onChange={(ev) => {
          const v = ev.target.value;
          if (v === '__unmapped__') return;
          const id = Number(v);
          if (!Number.isNaN(id)) void updateStage(row, id);
        }}
      >
        {currentId === undefined && (
          <option value="__unmapped__" disabled>
            {row.currentInterviewStep}
          </option>
        )}
        {stepsLocal.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </Form.Select>
    );
  };

  if (loading && !flow) {
    return (
      <div className="board-wrap text-center py-5">
        <Spinner animation="border" role="status" aria-label="Cargando" />
      </div>
    );
  }

  return (
    <div className="board-wrap">
      <Link to="/posiciones" className="btn btn-link p-0 mb-2 text-decoration-none">
        ← Posiciones
      </Link>

      <div className="board-title">
        {flow?.positionName ?? 'Posición'}, proceso de contratación
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <div className="d-flex gap-2 mb-3 align-items-center">
        <Button variant="outline-dark" size="sm" onClick={() => void reload()} disabled={loading}>
          Actualizar
        </Button>
        {loading && <Spinner animation="border" size="sm" />}
      </div>

      {!flow ? null : (
        <div className="kanban-row">
          {columns.map(({ step, rows: bucket }) => (
            <div key={step.id} className="kanban-col">
              <div className="kanban-col-title">{step.name}</div>
              {bucket.map((row) => {
                const selKey = `${row.applicationId}:${row.id}`;
                return (
                  <div key={selKey} className="kanban-card">
                    <div className="kanban-card-name">{row.fullName}</div>
                    <ScoreDots score={row.averageScore} />
                    {renderMiniSelect(row, stepsSorted)}
                  </div>
                );
              })}
            </div>
          ))}
          {unmatched.length > 0 && (
            <div className="kanban-col border-warning border">
              <div className="kanban-col-title text-warning">Sin columna definida</div>
              {unmatched.map((row) => {
                const selKey = `${row.applicationId}:${row.id}`;
                return (
                  <div key={selKey} className="kanban-card">
                    <div className="kanban-card-name">{row.fullName}</div>
                    <small className="text-muted">Etapa: {row.currentInterviewStep}</small>
                    <ScoreDots score={row.averageScore} />
                    {renderMiniSelect(row, stepsSorted)}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
