import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

/** Mantiene el id de posición al migrar rutas `/positions/:id` → `/posiciones/:id` */
export function LegacyPositionsRedirect() {
  const { positionId } = useParams<{ positionId: string }>();
  const id = positionId?.trim();
  return <Navigate to={id ? `/posiciones/${id}` : '/posiciones'} replace />;
}
