# Patrimônio do Rei

Sistema de gerenciamento patrimonial colaborativo com Supabase.

## Artefatos principais

- `supabase/migrations/001_inventory_collaboration.sql`: schema completo com tabelas, RLS, trigger de histórico, funções RPC de restauração e exclusão permanente com senha mestra.
- `docs/frontend-flow.md`: fluxo de UI e operações React/TypeScript.
- `src/inventoryFlow.tsx`: exemplo de cliente React/TypeScript com listagem, lixeira, histórico, exportação CSV/JSON e chamada segura para importação via endpoint server-side.
