-- ============================================================================
-- Flyway Migration: V10__secuencia_didactica_cinco_momentos.sql
-- Module: Secuencia Didáctica Oficial UNITEPC (5 momentos pedagógicos)
-- Author: GentleAI SISA Architecture Team
-- ============================================================================

ALTER TABLE IF EXISTS seguimientos_clases
    ADD COLUMN IF NOT EXISTS secuencia_introduccion BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS secuencia_resultados BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS secuencia_contenidos BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS secuencia_cuerpo BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS secuencia_cierre BOOLEAN NOT NULL DEFAULT TRUE;
