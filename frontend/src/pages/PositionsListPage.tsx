import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { fetchPositionsList } from '../api/hiringPipelineApi';
import type { ListedPositionDto } from '../types/hiringPipeline';
import '../styles/positions.css';

function formatDeadline(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function statusBadgeClass(status: string): string {
  const s = status.toLowerCase();
  if (s === 'open') return 'lt-badge-abierto';
  if (s === 'draft') return 'lt-badge-borrador';
  if (s === 'filled' || s === 'closed') return 'lt-badge-lleno';
  return 'lt-badge-status bg-secondary';
}

function statusLabelEs(status: string): string {
  const s = status.toLowerCase();
  if (s === 'open') return 'Abierto';
  if (s === 'draft') return 'Borrador';
  if (s === 'filled') return 'Lleno';
  if (s === 'closed') return 'Cerrado';
  return status;
}

export function PositionsListPage() {
  const [data, setData] = useState<ListedPositionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTitle, setSearchTitle] = useState('');
  /** yyyy-mm-dd compare con la parte fecha ISO del deadline en BD */
  const [deadlineFilter, setDeadlineFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [managerFilter, setManagerFilter] = useState('');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await fetchPositionsList();
        if (!cancelled) setData(list);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar posiciones');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const statuses = useMemo(() => {
    const s = new Set(data.map((p) => p.status));
    return Array.from(s).sort();
  }, [data]);

  const managers = useMemo(() => {
    const m = new Set(data.map((p) => p.managerName).filter(Boolean));
    return Array.from(m).sort();
  }, [data]);

  const filtered = useMemo(() => {
    return data.filter((p) => {
      if (searchTitle.trim()) {
        if (!p.title.toLowerCase().includes(searchTitle.trim().toLowerCase())) return false;
      }
      if (deadlineFilter) {
        if (!p.applicationDeadline) return false;
        const day = p.applicationDeadline.slice(0, 10);
        if (day !== deadlineFilter) return false;
      }
      if (statusFilter && p.status !== statusFilter) return false;
      if (managerFilter && p.managerName !== managerFilter) return false;
      return true;
    });
  }, [data, searchTitle, deadlineFilter, statusFilter, managerFilter]);

  if (loading && data.length === 0) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 px-4">
      <div className="posiciones-header">Posiciones</div>
      <div className="posiciones-header-bar" />

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Row className="g-3 posiciones-filter-bar mb-4 align-items-end">
        <Col xs={12} md={3}>
          <Form.Label className="small text-muted mb-1">Buscar por título</Form.Label>
          <Form.Control
            placeholder="Buscar por título"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
          />
        </Col>
        <Col xs={12} md={3}>
          <Form.Label className="small text-muted mb-1">Fecha deadline</Form.Label>
          <Form.Control
            type="date"
            value={deadlineFilter}
            onChange={(e) => setDeadlineFilter(e.target.value)}
          />
          {deadlineFilter && (
            <Button
              variant="link"
              size="sm"
              className="px-0 small"
              onClick={() => setDeadlineFilter('')}
            >
              Quitar fecha
            </Button>
          )}
        </Col>
        <Col xs={12} md={3}>
          <Form.Label className="small text-muted mb-1">Estado</Form.Label>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filtrar por estado"
          >
            <option value="">Todos</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {statusLabelEs(s)}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col xs={12} md={3}>
          <Form.Label className="small text-muted mb-1">Gerente</Form.Label>
          <Form.Select
            value={managerFilter}
            onChange={(e) => setManagerFilter(e.target.value)}
            aria-label="Filtrar por gerente"
          >
            <option value="">Todos</option>
            {managers.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      <Row className="g-4">
        {filtered.map((p) => (
          <Col key={p.id} xs={12} md={6} xl={4}>
            <Card className="border-0 posicion-card-shadow h-100">
              <Card.Body className="d-flex flex-column">
                <Card.Title className="h6 fw-bold">{p.title}</Card.Title>
                <Card.Text className="small mb-1 text-muted">Manager: {p.managerName}</Card.Text>
                <Card.Text className="small mb-2">
                  Deadline: {formatDeadline(p.applicationDeadline)}
                </Card.Text>
                <div className="mb-3">
                  <span className={`lt-badge-status ${statusBadgeClass(p.status)}`}>
                    {statusLabelEs(p.status)}
                  </span>
                </div>
                <div className="mt-auto d-flex gap-2">
                  <Link
                    to={`/posiciones/${p.id}`}
                    className="btn btn-primary btn-sm flex-grow-1 text-center"
                  >
                    Ver proceso
                  </Link>
                  <Button variant="secondary" size="sm" className="flex-grow-1" disabled title="No implementado">
                    Editar
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {!loading && filtered.length === 0 && (
        <p className="text-center text-muted mt-5">No hay posiciones que coincidan con los filtros.</p>
      )}
    </Container>
  );
}
