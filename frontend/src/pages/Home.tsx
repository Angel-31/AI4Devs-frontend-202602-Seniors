import React, { useState } from 'react';
import { Card, Container, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export function Home() {
  const [positionId, setPositionId] = useState('1');

  return (
    <Container className="py-5" style={{ maxWidth: 480 }}>
      <Card>
        <Card.Body>
          <Card.Title className="h5">LTI · Panel de proceso por posición</Card.Title>
          <Card.Text className="small text-muted">
            Introduce el identificador de la posición (el mismo que usas en la base de datos) para ver el
            flujo de entrevistas y mover candidatos de etapa.
          </Card.Text>
          <Form.Group className="mb-3" controlId="positionIdInput">
            <Form.Label className="small">ID de posición</Form.Label>
            <Form.Control
              type="number"
              min={1}
              value={positionId}
              onChange={(e) => setPositionId(e.target.value)}
            />
          </Form.Group>
          <Link className="btn btn-primary" to={`/positions/${positionId || '1'}`}>
            Abrir proceso
          </Link>
        </Card.Body>
      </Card>
    </Container>
  );
}
