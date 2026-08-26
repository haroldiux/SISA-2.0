---
name: Frontend - Cmd: /project:new-feature
description: Scaffolding instructions and command reference for /project:new-feature in the frontend project.
---

# Comando: /project:new-feature

Genera el scaffolding completo de una nueva feature.

## Uso
```
/project:new-feature
```

## Qué hace
Cuando el usuario ejecuta este comando, pregunta:
1. ¿Nombre de la entidad? (ej: Campus, Faculty, Career)
2. ¿Módulo destino? (ej: scu-building, scu-academy)
3. ¿Qué operaciones necesita? (create, read, update, delete)

Luego genera en orden:
1. `api/contracts/[prefix]-[entity].request.ts`
2. `api/contracts/[prefix]-[entity].response.ts`
3. `store/[entity]/[prefix]-[entity].actions.ts`
4. `store/[entity]/[prefix]-[entity].state.ts`
5. `builders/[entity]/[prefix]-[entity]-request.builder.ts`
6. `commands/[prefix]-create-[entity].cmd.ts` (y otros según operaciones)
7. `services/[prefix]-[entity].service.ts`
8. `modules/[prefix]-[module]/components/[prefix]-[entity]/` (4 archivos)

Sigue los skills:
.agents/skills/architecture/command-pattern.md
.agents/skills/architecture/builder-pattern.md
.agents/skills/state/ngxs-pattern.md
.agents/skills/development/component.md
.agents/skills/development/service.md
.agents/skills/code-conventions/naming.md
