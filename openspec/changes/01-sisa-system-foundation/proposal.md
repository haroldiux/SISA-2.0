# Proposal: 01-sisa-system-foundation

## 1. Metadata
- **Change Name**: `01-sisa-system-foundation`
- **Project**: SISA (Sistema Integrado de Seguimiento Académico)
- **Author**: GentleAI SISA Architecture Team
- **Date**: 2026-08-25
- **Status**: IMPLEMENTED & VERIFIED
- **Store Mode**: Hybrid (`openspec/changes/01-sisa-system-foundation/` + Engram)
- **Standards / Conventions**: SEA Coding Standards (`.atl/conventions-frontend.md`, `.atl/conventions-backend.md`)

---

## 2. Executive Summary
Baseline architectural foundation for SISA (Sistema Integrado de Seguimiento Académico) for Universidad Técnica Privada Cosmos (UNITEPC).

Establishes:
1. **Spring Boot 3.3.2 Backend** (Java 21, package `bo.edu.unitepc.sisa`):
   - Multi-tenant PostgreSQL database with Flyway schema migration `V1__init_sisa_schema.sql` (15 tables).
   - 15 Domain Enums & 17 JPA Entities + JSONB Converters + 14 JPA Repositories.
   - JWT authentication & 5-tier role-based access control (RBAC).
   - Core Apache POI Office ingestion & dynamic row shifter infrastructure.
   - Standard REST Controllers with RFC 7807 problem details and `ResourceBuilder<T>` envelopes.
2. **Angular 16+ Frontend** (`sisa-frontend`):
   - SEA architecture with `scu-` prefix conventions.
   - 5 desktop workflow frames (Docente Planning, Career Oversight, Academic Audit, Regional Analytics, Executive Dashboard).
   - PrimeNG 16 + Tailwind CSS design system tokens.
