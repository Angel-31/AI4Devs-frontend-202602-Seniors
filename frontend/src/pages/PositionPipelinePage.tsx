import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { PositionHiringDashboard } from '../components/PositionHiringDashboard';

/** Ruta: /positions/:positionId */
export function PositionPipelinePage() {
  const { positionId } = useParams<{ positionId: string }>();
  const id = Number(positionId);

  if (!positionId?.trim().length || Number.isNaN(id) || id < 1) {
    return <Navigate to="/" replace />;
  }

  return <PositionHiringDashboard positionId={id} />;
}
