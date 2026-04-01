# Estimulos — Arquitetura e Plano Tecnico

## O que e

Sistema de gestao pedagogica para criancas com TDAH/autismo/necessidades especiais.
Cliente: Brinquedoteca Estimulos (Palmas-TO).
Escala: 60 alunos hoje, projecao 200-500.

## Stack

- **Frontend**: React 18 + TypeScript + Vite + Shadcn/UI + Tailwind
- **Backend**: Supabase (PostgreSQL + Auth + Storage + pgvector)
- **AI**: LLM para geracao de curriculo/avaliacao + BNCC embeddings via pgvector
- **Producao de materiais**: Canva (externo, linkado)

## Fluxo de Negocio

```
Cadastro Aluno (serie + ano letivo)
       |
       v
Perfil Academico -----> 9 blocos + 5 scores = nivel adaptacao [POR BIMESTRE]
       |
       v
Curriculo Adaptado ---> AI gera com base no perfil + BNCC [POR BIMESTRE]
       |
       +---> Ja tem tarefas? ---> Banco de Atividades (link Canva)
       |
       +---> Precisa mais? ----> Base Teorica (AI, opcional) ---> Mais tarefas
                                                                      |
                                                                      v
                                                            Banco de Atividades
                                                                      |
                                                                      v
                                                            Avaliacao Adaptada (AI)
                                                                      |
                                                                      v
                                                            Registro Avaliativo (PDF -> pais)
                                                                      |
                                                                      v
                                                            Cartao da Crianca (retrato final)
```

**Conceito central:** Tudo orbita em torno do CASO (1 aluno + 1 ano letivo + 4 bimestres).

## Conceitos-Chave

| Conceito | Descricao |
|----------|-----------|
| Ano Letivo | 2025, 2026... |
| Bimestre | 4 por ano (1o, 2o, 3o, 4o) |
| Serie/Grade | 1o ano ate 9o ano (Ensino Fundamental) |
| Nivel Adaptacao | 1-5 (Leve, Moderado, Significativo, Paralelo, Funcional) |
| Caso | Jornada completa de 1 aluno em 1 ano letivo |
| BNCC | ~1500 habilidades codificadas do MEC, usadas como base curricular |

## Roles (5)

| Role | Foco |
|------|------|
| Admin | Acesso total |
| Coordenador Pedagogico | Gestao de casos, perfis, avaliacoes |
| Pedagogo | Curriculos, base teorica, avaliacoes, atividades |
| Designer de Material | Producao de materiais, banco de atividades |
| Atendente Terapeutica | Aplica avaliacoes, registra desempenho |

## Schema do Banco (19 tabelas)

### Camada 0 — Fundacao
- `profiles` — estende auth.users (nome, role, avatar)
- `bncc_skills` — ~1500 habilidades com embeddings pgvector
- `curriculum_banks` — bancos curriculares (BNCC, DCT-TO, etc)
- `supply_items` — itens de insumo

### Camada 1 — Alunos
- `students` — registro permanente + servicos habilitados

### Camada 2 — Casos
- `cases` — 1 aluno + 1 ano letivo + grade + bimestre atual (UNIQUE: student+year)

### Camada 3 — Por Bimestre
- `academic_profiles` — 9 blocos JSONB + 5 scores + nivel adaptacao
- `adapted_curricula` — AI-generated, versionado, com areas/objetivos/BNCC
- `curriculum_bncc_skills` — M:N curriculo <-> habilidades BNCC
- `theoretical_bases` — opcional, complementa curriculo
- `activities` — banco global reutilizavel (com embedding)
- `case_activities` — liga atividade ao caso/bimestre + pipeline producao
- `adapted_assessments` — avaliacoes AI-generated, versionadas
- `assessment_results` — resultado (performance, autonomia, score)
- `evaluation_records` — relatorio PDF para pais
- `material_statements` — extrato de materiais produzidos
- `material_statement_activities` — M:N statement <-> activities

### Camada 4 — Operacional
- `child_cards` — cartao da crianca (por aluno + ano)
- `pendencies` — pendencias automaticas por servico habilitado
- `audit_log` — quem fez o que, quando
- `supply_consumption` — consumo de insumos

## Progressao Bimestral

```
Caso (aluno + ano + serie)
  |
  +-- Bimestre 1
  |     +-- perfil academico (scores, nivel adaptacao)
  |     +-- curriculo adaptado (AI + BNCC)
  |     +-- atividades (producao + canva)
  |     +-- avaliacao (AI + resultado)
  |     +-- registro avaliativo (PDF)
  |     +-- pendencias (auto-geradas)
  |
  +-- Bimestre 2
  |     +-- perfil RE-AVALIADO
  |     +-- curriculo AJUSTADO (baseado em resultado do B1)
  |     +-- ...
  |
  +-- Bimestre 3 ...
  +-- Bimestre 4 ...
```

Ao avancar bimestre:
- Trigger gera pendencias automaticas baseado nos servicos habilitados
- Resultado da avaliacao anterior informa se nivel de adaptacao deve mudar
- Perfil pode ser pre-populado do bimestre anterior

## AI Integration Points

| Ponto | Input | Output |
|-------|-------|--------|
| Curriculo Adaptado | Perfil academico + BNCC (vector search) | Areas, objetivos, estrategias, tarefas |
| Base Teorica | Gaps do curriculo | Especificacoes de tarefas adicionais |
| Avaliacao Adaptada | Tarefas efetivamente trabalhadas | Questoes de avaliacao |
| Registro Avaliativo | Todo o bimestre consolidado | Texto dissertativo para pais |

Todos os artefatos AI tem: `ai_generated`, `ai_model`, `generation_metadata`, `human_edited`, `change_log`.

## BNCC Embeddings

- ~1500 habilidades com `vector(1536)` via pgvector
- IVFFlat index (50 lists)
- Busca semantica filtrada por grade level
- Activities tambem tem embedding para sugestao de reuso

## Pipeline de Producao

```
solicitada -> design -> impressao -> producao_fisica -> concluida
```

- Atribuicao por designer
- Timestamps por etapa
- Metricas de producao no dashboard

## Migrations (15 arquivos, em ordem)

1. Extensions (uuid-ossp + pgvector)
2. Enums
3. Foundation (profiles, bncc_skills, curriculum_banks, supply_items)
4. Students
5. Cases
6. Academic Profiles
7. Curricula + Theory
8. Activities
9. Assessments
10. Reports + Cards
11. Operational (pendencies, audit, supplies)
12. Indexes
13. RLS Policies
14. Triggers
15. Seed (BNCC skills)
