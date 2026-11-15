# Pixlo Development & Verification Guide

This guide describes how to work with, develop, and test any application within Pixlo.

## General Prerequisites

- **Node.js**: v20 LTS or v22 LTS (v24 also supported)
- **Package Manager**: `npm` (v10+)
- **Container Engine**: Docker and Docker Compose (recommended for running local databases and backing services)

## Working on an Application

Each project directory (`NN-project-name/`) is completely self-contained. To run or verify any application:

1. **Enter the target application directory**:
   ```bash
   cd NN-project-name
   ```

2. **Configure Environment Variables**:
   Copy the provided `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

3. **Start Backing Services (Docker Compose)**:
   ```bash
   docker compose up -d
   ```

4. **Install Dependencies & Seed Database**:
   ```bash
   cd backend && npm install && npm run prisma:migrate && npm run prisma:seed
   cd ../frontend && npm install
   ```

5. **Run Development Servers**:
   - Backend API: `npm run start:dev` (runs from backend folder)
   - Frontend UI: `npm run dev` (runs from frontend folder)

6. **Execute Test Suites**:
   - Unit and Integration Tests: `npm test`
   - Security and Access Control Tests: `npm run test:security`
   - End-to-End Tests: `npm run test:e2e`

## Phase Verification Gate Checklist

Before any phase is marked as completed or pushed to the remote repository:
1. All unit, integration, API, and security tests pass with 0 failures.
2. The application demonstrates total isolation: no external database dependencies outside its own configuration.
3. Content sanitization and input validation are active on all public and authenticated endpoints.
4. Completion report (`docs/completion-report.md`) is written and substantiated with execution logs.
5. Repository-wide reference scans confirm no prohibited naming or attributions.
