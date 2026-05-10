# prompts-ABR — Posición / flujo de entrevistas / candidatos (API + revisión SOLID/CUPID)

Usa este documento como prompt para **implementar consumo HTTP** contra el backend LTI y/o para **revisar código** (frontend/backend TS) relacionado sin violar SOLID/CUPID de forma gratuita.

---

## Rol del agente

Eres desarrolladora/o **backend TypeScript** (y, si aplica, integración cliente API) del repo `AI4Devs-frontend-202602-Seniors`. Sigues los contratos de red descritos más abajo y priorizas **claridad** para futuros cambios automatizados o asistidos por IA.

---

## Contexto funcional — Endpoints obligatorios

Base URL: usar variable de entorno (p.ej. `REACT_APP_API_URL` / `process.env.API_BASE_URL`). No hardcodees host si el código se despliegue fuera de local.

### 1) `GET /positions/:id/interviewFlow`

**Propósito:** Obtener nombre de la posición y el **proceso de contratación** (flujo + pasos ordenados).

**Respuesta esperada (forma lógica; alinear campo a campo con OpenAPI/backend real):**

- `positionName` (string): título de la posición.
- `interviewFlow` (objeto):
  - `id` (number)
  - `description` (string)
  - `interviewSteps` (array ordenable por `orderIndex`):
    - `id`, `interviewFlowId`, `interviewTypeId`, `name`, `orderIndex`

**Notas de implementación:**

- La UI debe construir Kanban/pestañas/selector de fases a partir de `interviewSteps` ordenadas por `orderIndex` (luego por `id` como desempate estable).
- El nombre en cabecera de página debe venir de `positionName`; no inferir desde la URL `:id`.

### 2) `GET /positions/:id/candidates`

**Propósito:** Listar todas las aplicaciones activas/in-process para ese `positionId`.

**Ítems esperados:**

- `fullName` — nombre completo del candidato.
- `currentInterviewStep` — **nombre textual** de la fase actual (debe poder mapearse a un `interviewSteps[].name` del flujo cargado antes).
- `averageScore` — media de puntuación (ej. número entero 0–5 según negocio).

**Notas de implementación:**

- Separar **tipos de dominio** (ApplicationForPosition) de **DTO de red** si el backend usa `snake_case`; mapear en un solo sitio (anti-confusión para agentes).
- En **este repo**, `GET .../candidates` devuelve también `id` (**candidateId**) y `applicationId` (PK de aplicación): ambos son necesarios para el `PUT` de etapa.

### 3) `PUT /candidates/:id/stage`

**Propósito:** Actualizar la etapa de entrevista del candidato (mover “tarjeta” en el flujo).

**Parámetros:**

- Path `:id`: en **este repo** es **`candidateId`** (`Application.findOneByPositionCandidateId` valida `(applicationIdNumber, candidateId)`).

**Cuerpo (ejemplo proporcionado por producto — validar contra implementación real):**

```json
{
  "applicationId": "1",
  "currentInterviewStep": "3"
}
```

**Ambigüedad a resolver antes de cerrar código:**

- El enunciado habla del parámetro `new_interview_step` junto al `interview_step_id`; el ejemplo muestra `currentInterviewStep` como **string numérico** (`"3"`).  
  El agente debe **alinear nombre de propiedades y tipos** (string vs number) con el código del servidor y/o `backend/api-spec.yaml`, y exponer una única función de cliente `updateCandidateStage(...)`.

**Respuesta ejemplo:**

```json
{
  "message": "Candidate stage updated successfully",
  "data": {
    "id": 1,
    "positionId": 1,
    "candidateId": 1,
    "applicationDate": "2024-06-04T13:34:58.304Z",
    "currentInterviewStep": 3,
    "notes": null,
    "interviews": []
  }
}
```

Aquí `data.currentInterviewStep` es **número** (id del paso), mientras que en el listado `GET .../candidates` es **string** (nombre). Eso debe quedar tipado como **dos representaciones distintas** (`currentInterviewStepName` vs `currentInterviewStepId`) en la capa de dominio/UI para evitar que un modelo unificado contradiga el servidor.

---

## Contrato HTTP real en este repositorio (referencia rápida)

| Método y ruta | Notas |
|---------------|--------|
| `GET /positions/:id/interviewFlow` | También válido `/position/:id/interviewFlow` y `.../interviewflow` (minúsculas). Respuesta JSON: `{ positionName, interviewFlow: { … } }` (sin envolver dos veces). |
| `GET /positions/:id/candidates` | Alias igual en `/position/...`. Cada elemento incluye `fullName`, `currentInterviewStep`, `averageScore`, `id` (candidate), `applicationId`. |
| `PUT /candidates/:id/stage` | `:id` = **candidateId**. Body: `{ "applicationId", "currentInterviewStep" }` (strings o números parseables → `interview_step_id`). Sigue disponible `PUT /candidates/:id` como alias legacy. |

**Frontend (CRA):** `REACT_APP_API_URL` por defecto `http://localhost:3010`; pantalla `#/` para elegir `positionId`, ruta `#/positions/:positionId`. Código: `frontend/src/api/hiringPipelineApi.ts`, `components/PositionHiringDashboard.tsx`.

---

## Salida esperada cuando el prompt se usa como **revisión de código**

Al revisar uno o más ficheros solicitados (`paths: ...`), debes hacer lo siguiente:

1. **Orden de prioridad (obligatorio):** Primero lista violaciones que **harían que un agente de IA confunda rutas de datos, IDs o nombres de campos** (p.ej. mezcla de `candidateId` vs `applicationId`, DTO camelCase/snake_case duplicados, funciones que hacen fetch + DOM + estado en el mismo método).
2. Para **cada** violación (SOLID **y/o** CUPID):
   - Cita **fichero y símbolo** (función/clase/componente) o número de línea si está disponible.
   - Di **qué principio** vulnera (**S,O,L,I,D** y/o **C,U,P,I,D**).
   - Explica **en una frase** por qué.
   - Propón un **refactor mínimo** (no reescritura total): típicamente extracción de adaptador HTTP, objeto de política de errores o tipo nominal.

### Recordatorio SOLID (para la revisión)

- **S:** una razón por módulo; separar cliente HTTP frente a reglas de negocio/UI.
- **O:** preferir extensiones nuevas antes que modificar `switch` dispersos sobre `step`.
- **L:** subtipos sustituibles; no “forzar” un tipo unificado cuando el backend devuelve representaciones diferentes (nombre vs id).
- **I:** interfaces pequeñas; no un `ApiGod` gigante.
- **D:** componentes/UI o servicios de dominio dependen de **abstracciones** (`InterviewFlowRepository`), no de `fetch`/`axios` concreto en todo el grafo.

### Recordatorio CUPID (Compose, Predictable, idiomatic…) — útil sobre todo en TS

- **Composable:** funciones/modulos pequeños que se pueden combinar (p.ej. `parseInterviewFlowDto`, `orderSteps`, `mapApplicationsToCandidates`).
- **Unix philosophy:** hace una cosa y la hace bien (un archivo no debe ser “servicio + tipos + componente”).
- **Predictable:** nombres y tipos alineados con el contrato de red documentado arriba; sin “magia” sobre conversión número↔nombre de paso sin centralizarla.
- **Idiomatic:** TypeScript/`async` idioma del proyecto (`Result` vs throws: seguir convención existente).
- **Domain-based:** nombres de tipos cercanos al negocio (`InterviewStep`, `PositionHiringPipeline`) no genéricos (`Data`, `Item`).

Si el código actual no viola algo, dilo explícitamente para ese principio con “No aplica” o “Cumple; sin observaciones”.

---

## Formato final de tu respuesta (plantilla obligatoria para el agente revisor)

```markdown
## 1. Riesgos que confunden a agentes IA (prioridad alta)
- ...

## 2. SOLID — violaciones y refactors mínimos
### S ...
### O ...
...

## 3. CUPID — violaciones y refactors mínimos
### C ...
...

## 4. Contrato API ↔ tipos TS (checks rápidos)
- [ ] `GET interviewFlow`: tipos igual que JSON real del backend
- [ ] `GET candidates`: `averageScore`, `fullName`, `currentInterviewStep` coherentes con UI
- [ ] `PUT stage`: `:id`, body y tipo de `currentInterviewStep` en respuesta alineados (id vs nombre)

## 5. Lista de cambios mínimos sugeridos (ordenados)
1. ...
```

---

## Uso rápido (copiar al chat)

```
Revisa estos archivos: <pega rutas relativas al repo>
Aplica el contenido de prompts/prompts-ABR.md: prioriza confusión de agentes IA, luego SOLID y CUPID, con refactors mínimos.
```

---

## Revisión SOLID/CUPID registrada — `backend/src/` (2026-05-10)

Ámbito: capa Express, controladores, servicios de aplicación y modelos de dominio existentes. Objetivo: lo que más confunde a un agente de IA y refactors mínimos.

### 1. Riesgos que confunden a agentes IA (prioridad alta)

| Problema | Ubicación | Por qué confunde |
|----------|-----------|------------------|
| **Varias instancias de `PrismaClient`** | `index.ts` (inyecta `req.prisma`), `positionService.ts`, `Application.ts`, `Candidate.ts`, etc. | Un agente asume “una sola conexión vía middleware” y edita solo `req.prisma`; el servicio de posiciones **ignora** `req` y abre otro cliente. Comportamiento y tests difíciles de razonar. |
| **Rutas duplicadas / alias** | `index.ts` (`/position` y `/positions`); `positionRoutes` (`interviewflow` vs `interviewFlow`); `candidateRoutes` (`PUT /:id` y `PUT /:id/stage`) | Hay que documentar qué URL es canónica; si no, el agente añade un tercer alias o rompe clientes. |
| **Semántica mezclada en `updateCandidateStage`** | `candidateService.ts`: parámetros `(id, applicationIdNumber, currentInterviewStep)` | `id` en path es candidato; el body lleva `applicationId`. Los nombres genéricos (`id`) invitan a pasar el id equivocado. **Refactor mínimo:** renombrar a `candidateId` en firma y en controlador. |
| **Inconsistencia capa HTTP** | `candidateRoutes.ts`: `POST /` con handler anónimo; resto importa controladores | Un agente no sabe si debe seguir el patrón “función inline” o “controller exportado”. **Refactor mínimo:** mover POST a `addCandidateController` (ya existe en `candidateController` pero no se usa en routes). |
| **Modelo de dominio acoplado a Prisma** | `Application.save`, `Candidate`, etc. | No es “dominio puro”: mezcla persistencia y entidad. Un agente que busque “reglas de negocio” no distingue capas. **Refactor mínimo (largo plazo):** repositorio + entidad; aquí solo señalar el límite en comentario o ADR. |

### 2. SOLID — violaciones y refactors mínimos

- **S (Single Responsibility):** `positionService.ts` mezcla acceso a datos, mapeo a DTO y cálculo de `averageScore`. *Mínimo:* extraer `computeAverageInterviewScore(interviews)` y `mapApplicationToCandidateRow(app)`.
- **O (Open/Closed):** Nuevo campo en el DTO de candidatos obliga a tocar el mismo `map` central. Aceptable en MVP; *mínimo:* tipar el retorno explícitamente (`PositionCandidateRow`) compartido con frontend vía paquete o OpenAPI.
- **L (Liskov):** No aplica de forma aguda (no hay jerarquía de sustitución clara).
- **I (Interface segregation):** No hay interfaces para repositorios; clientes “ven” Prisma vía modelos monolíticos. *Mínimo:* interfaz `IApplicationRepository` con 2 métodos usados por el servicio.
- **D (Dependency inversion):** Servicios y modelos dependen de `PrismaClient` concreto. *Mínimo:* inyectar `PrismaClient` en factories o pasar `req.prisma` a funciones de servicio (alinear con middleware).

### 3. CUPID — violaciones y refactors mínimos

- **C (Composable):** Parcialmente cumplido tras separar cliente HTTP en frontend; en backend, extraer funciones puras de mapeo mejora composición.
- **U (Unix philosophy):** `index.ts` mezcla CORS, logging, subida de archivos, rutas y `listen`. *Mínimo:* extraer `createApp()` que devuelva `app` sin escuchar (mejor testabilidad).
- **P (Predictable):** Mensajes de error del controlador de etapa corregidos (`applicationId` vs “position ID”). Mantener nombres de campos alineados con Prisma (`currentInterviewStep` como id numérico en entidad).
- **I (Idiomatic):** Mezcla `require`/`import` en rutas (resuelto en `positionRoutes` con `Router`). Revisar otros archivos si reaparece `require`.
- **D (Domain-based):** Tipos y nombres mezclan “Application” y “Candidate stage”; preferir `updateApplicationInterviewStep` en servicio para reflejar que muta la aplicación.

### 4. Contrato API ↔ tipos TS (checks rápidos)

- [x] `GET interviewFlow`: cuerpo plano `{ positionName, interviewFlow }` (controlador corregido).
- [x] `GET candidates`: incluye `applicationId` y `id` (candidato) para el PUT.
- [x] `PUT stage`: path = `candidateId`; body = `applicationId` + `currentInterviewStep` (id de paso).

### 5. Lista de cambios mínimos sugeridos (ordenadas)

1. Unificar acceso Prisma: o bien solo `req.prisma` en servicios, o inyección explícita en constructores.
2. Renombrar parámetros `id` → `candidateId` en `updateCandidateStage` y controlador asociado.
3. Usar `addCandidateController` en ruta POST en lugar del closure inline.
4. Extraer `createApp` / no llamar `listen` en el mismo módulo que exporta tests (si se añaden tests de integración).
5. (Opcional) Publicar DTO compartidos desde OpenAPI o paquete `shared-types` para frontend/backend.

---

*Nota:* El fichero canónico es **`prompts/prompts-ABR.md`**. Si buscas `prompt-ABR.md`, usa el mismo documento o crea un alias simbólico en tu SO; el repo mantiene el nombre en plural para alinearlo con otros `prompts-*`.
