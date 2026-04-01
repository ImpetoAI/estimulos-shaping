# Estimulos — Spec para Desenvolvimento

Documento tecnico completo para o desenvolvedor implementar o sistema.
Gerado em 2026-04-01 apos discovery + validacao + MVP funcional.

**MVP deployado:** https://estimulos-deploy-on0sapydz-impetoai.vercel.app
**Credenciais:** admin@estimulos.com / at@estimulos.com (Estimulos2026!)
**Supabase:** pxopccvykwdzjqjodmob (schema `estimulos`)
**Repo:** /Users/joaod.nascimento/Coding/impeto/projeto-estimulos

---

## 1. STACK

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| UI | Shadcn/UI + Tailwind CSS |
| Animacoes | Framer Motion |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| State | React Query (TanStack) |
| Auth | Supabase Auth (email/senha) |
| Database | Supabase PostgreSQL (schema `estimulos`) |
| Storage | Supabase Storage (buckets: exam-files, photos, materials) |
| Deploy | Vercel (SPA com rewrite) |
| IA (futuro) | OpenAI/Claude API + pgvector |

---

## 2. ARQUITETURA DE PASTAS

```
src/
├── App.tsx                          # Rotas principais
├── main.tsx
├── components/
│   ├── auth/AppGuard.tsx            # Guard: redireciona login/portal
│   ├── layout/
│   │   ├── AppLayout.tsx            # Layout com sidebar
│   │   ├── AppSidebar.tsx           # Navegacao principal
│   │   └── GlobalSearch.tsx         # Busca global (Cmd+K)
│   ├── portal/
│   │   ├── PortalGuard.tsx          # Guard portal AT
│   │   └── PortalLayout.tsx         # Layout portal (sem sidebar)
│   └── ui/                          # 52 componentes Shadcn
├── contexts/
│   └── AuthContext.tsx               # Auth + role + profile
├── hooks/
├── lib/
│   ├── supabase.ts                  # supabase (auth) + db (schema estimulos)
│   └── utils.ts                     # cn() helper
├── pages/
│   ├── DashboardPage.tsx            # KPIs reais
│   ├── PacientesPage.tsx            # Lista com filtros avancados
│   ├── PatientDetailPage.tsx        # Pasta do paciente (12 tabs)
│   ├── PendenciasPage.tsx           # Pendencias globais
│   ├── LoginPage.tsx
│   ├── NotFound.tsx
│   ├── banco-curriculos/index.tsx   # CRUD + vinculo a alunos
│   ├── banco-atividades/index.tsx   # CRUD + tags BNCC + status
│   ├── pacientes/
│   │   ├── PatientForm.tsx          # Form cadastro (2 colunas)
│   │   ├── patientSchema.ts         # Zod schema
│   │   ├── CriarPacientePage.tsx
│   │   ├── EditarPacientePage.tsx
│   │   └── ciclo/                   # Tabs do ciclo pedagogico
│   │       ├── _shared.tsx          # CicloTabProps interface
│   │       ├── PerfilAcademicoTab.tsx       # Read-only + botao editar
│   │       ├── CurriculoOriginalTab.tsx     # Read-only (vinculado do banco)
│   │       ├── CurriculoAdaptadoTab.tsx     # Layout Lovable + IA mock
│   │       ├── PlanejamentoTab.tsx          # Layout Lovable + 20 atividades mock
│   │       ├── ApostilaTab.tsx              # Link + versao
│   │       ├── ProvasTab.tsx                # 2 cenarios (adequacao + IA)
│   │       ├── RegistroAvaliativoTab.tsx    # Form + lista + V1/V2
│   │       ├── LinhaDoTempoTab.tsx          # Eventos cronologicos
│   │       ├── EvolucaoTab.tsx              # Graficos comparativos
│   │       ├── ExtratoTab.tsx               # Materiais + extra-bimestre
│   │       ├── CardTab.tsx                  # Card ludico da crianca
│   │       └── RelatorioTab.tsx             # Checkboxes + IA gera relatorio
│   └── portal/
│       ├── PortalLoginPage.tsx
│       ├── PortalPatientsPage.tsx           # Grid 2 colunas
│       ├── PortalPatientDetailPage.tsx      # Ficha + registro
│       ├── PortalEvaluationFormPage.tsx     # Form registro AT
│       ├── PortalAcademicProfilePage.tsx    # Wizard 10 blocos (usado pelo coord tambem)
│       └── PortalRoutes.tsx
├── types/
│   ├── patient.ts                   # Types + constantes (terapias, series, modulos)
│   └── portal.ts                    # Types portal
└── assets/
    └── logo-estimulos.png
```

---

## 3. ROTAS

### Sistema Principal (AppGuard — requer auth, redireciona AT pro portal)

| Rota | Componente | Descricao |
|------|-----------|-----------|
| `/` | DashboardPage | KPIs, graficos |
| `/pacientes` | PacientesPage | Lista com filtros |
| `/pacientes/criar` | CriarPacientePage | Form cadastro |
| `/pacientes/:id` | PatientDetailPage | 12 tabs ciclo |
| `/pacientes/:id/editar` | EditarPacientePage | Form edicao |
| `/pacientes/:id/perfil` | PortalAcademicProfilePage | Wizard perfil (coord) |
| `/banco-curriculos` | BancoCurriculosPage | CRUD + vinculo |
| `/banco-atividades` | BancoAtividadesPage | CRUD + BNCC tags |
| `/pendencias` | PendenciasPage | Globais |
| `/permissoes` | UserPermissionsPage | CRUD usuarios |

### Portal AT (PortalGuard — requer role AT)

| Rota | Componente | Descricao |
|------|-----------|-----------|
| `/portal/login` | PortalLoginPage | Login AT |
| `/portal/pacientes` | PortalPatientsPage | Meus pacientes |
| `/portal/pacientes/:id` | PortalPatientDetailPage | Ficha + botao registro |
| `/portal/pacientes/:id/registro` | PortalEvaluationFormPage | Form registro avaliativo |

---

## 4. SCHEMA SUPABASE (tabelas principais)

Todas no schema `estimulos`. Client: `db = supabase.schema("estimulos")`.

### Camada 0 — Fundacao

**profiles** — Estende auth.users
- id (uuid PK → auth.users), full_name, role (admin/coordenador/pedagogo/designer/atendente_terapeutica), avatar_url, active, created_at, updated_at

**bncc_skills** — 1.304 habilidades BNCC (futuro: embedding vector)
- id, code (EF01MA01), description, grade_level, knowledge_area, created_at

**curriculum_banks** — Banco global de curriculos
- id, origin (bncc/dct/livro_didatico/outro), origin_name, escola, stage (infantil/fundamental_1/fundamental_2), discipline, experience_field, grade, content, cover_image_url, created_by, created_at

**activities** — Banco global de atividades
- id, title, description, discipline, category, activity_type, bncc_tags, status (pendente/em_design/concluida), designer_link, nivel_adaptacao, tags[], created_by, created_at

### Camada 1 — Alunos

**students** — Cadastro do aluno
- id, full_name, photo_url, birth_date, city, school_name, current_grade, attendance_type (escolar/individual/individual_escolar/particular), diagnosis, plan_type, therapies[], pedagogical_items (jsonb), guardian_1_name, guardian_1_contact, guardian_2_name, guardian_2_contact, coordinator_id (→ profiles), status, tem_prova, config_v1_v2, created_at

**student_assignments** — Vinculo AT ↔ Aluno
- id, student_id (→ students), profile_id (→ profiles), assigned_at. UNIQUE(student_id, profile_id)

### Camada 2 — Casos

**cases** — 1 por aluno por ano letivo
- id, student_id (→ students), academic_year, grade, current_bimester (1-4), status, created_at. UNIQUE(student_id, academic_year)

**case_bimesters** — Status de cada bimestre
- id, case_id (→ cases), bimester (1-4), status (open/closed), start_date, end_date, profile_status, curriculum_status, assessment_status

### Camada 3 — Ciclo Pedagogico (por bimestre)

**academic_profiles** — Perfil academico
- id, case_id (→ cases), bimester, blocks (jsonb — 10 blocos), scores (jsonb — 5 scores), adaptation_level (1-5), recommendations, filled_by (→ profiles), filled_via, completed, previous_profile_id, adaptation_changed, created_at, updated_at. UNIQUE(case_id, bimester)

**case_curriculum_originals** — Vinculo curriculo original ↔ caso
- id, case_id (→ cases), bimester, curriculum_bank_id (→ curriculum_banks), created_at

**adapted_curricula** — Curriculo adaptado (gerado por IA)
- id, case_id, bimester, discipline, content (jsonb), ai_generated, ai_model, human_edited, version, created_at. UNIQUE(case_id, bimester, discipline)

**lesson_plans** — Planejamento (ex-base teorica)
- id, case_id, bimester, discipline, ai_activities (jsonb), bank_activity_ids (uuid[]), ai_generated, version, created_at. UNIQUE(case_id, bimester, discipline)

**adapted_booklets** — Apostila adaptada
- id, case_id, bimester, final_link, version, responsible_id, finalized_at, notes

**adapted_exams** — Provas adaptadas
- id, case_id, bimester, discipline, scenario (school_adaptation/curriculum_based), original_exam_url, adapted_exam_url, ai_generated, adequations (jsonb), exam_type (v1/v2), version

**evaluation_registries** — Registro avaliativo
- id, case_id, bimester, student_id, discipline, evaluator_id, evaluation_date, duration_minutes, contents, knowledge_area, exam_type (v1/v2), showed_resistance, showed_discomfort, discomfort_description, used_support_resources, support_resources_description, understood_commands, commands_observation, conducted_by, used_reinforcers, reinforcers_description, completed_evaluation, exam_file_url, description, filled_via

**material_statements** — Extrato de materiais
- id, case_id, material_date, material_type, description, photo_urls[]

**child_cards** — Card da crianca
- id, student_id, academic_year, content (jsonb), generated. UNIQUE(student_id, academic_year)

**patient_reports** — Relatorio IA
- id, case_id, bimester, selected_sections (jsonb), generated_text, edited_text, ai_model, generated_by

### Camada 4 — Operacional

**pendencies** — Auto-geradas
- id, case_id, module, discipline, bimester, description, due_date, responsible_id, status (pending/resolved/justified), justification, resolved_at

**timeline_events** — Eventos cronologicos
- id, case_id, event_type, module, description, metadata (jsonb), created_by, created_at

---

## 5. BLOCOS DO PERFIL ACADEMICO (jsonb academic_profiles.blocks)

10 blocos. Cada um armazena respostas de checkboxes/radios:

```typescript
{
  tipo_letra: { cursiva: "pequeno"|"medio"|"grande"|"nao_aplica", bastao_maiuscula: ..., bastao_imprensa: ... },
  alfabetizacao: string[],  // checkboxes selecionados
  escrita: { copia: string, numeros: string[] },
  matematica: {
    contagem_oral: string, sequencia_numerica: string, escrita_qtd: string,
    adicao: string[], subtracao: string[], quadro_valor: string,
    liga_numero_qtd: string[], problemas: string,
    formas_geometricas: string[], cedulas: string, caca_numeros: string
  },
  associacao: { liga_colunas: string[], sequencia: string, padroes: string, classificacao: string },
  coord_motora: {
    contorno: string, legenda: string, recorte: string, colagem: string,
    montagem: string, liga_pontos: string, dobraduras: string,
    materiais: string[], tracado: string, quebra_cabeca: string, corte_quebra_cabeca: string
  },
  compreensao: { questoes: string, escala: string, interpretacao: string[] },
  comunicacao: string[],  // checkboxes selecionados
  observacoes_finais: string  // texto livre
}
```

### Scores calculados (academic_profiles.scores)
```typescript
{ leitura: 1-5, escrita: 1-5, matematica: 1-5, logica: 1-5, autonomia: 1-5 }
```
Calculados automaticamente a partir das respostas dos blocos. Logica em `calculateScoresFromBlocks()` no PortalAcademicProfilePage.tsx.

### Nivel de adaptacao (adaptation_level: 1-5)
- N1 Leve: mantem curriculo, adapta apresentacao
- N2 Moderado: prioriza essenciais, reduz escopo
- N3 Significativo: conteudo ano anterior, reconstroi lacunas
- N4 Paralelo: curriculo paralelo a serie formal
- N5 Funcional: foco comunicacao, autonomia, habilidades de vida

Sugerido automaticamente via `calculateLevelFromScores()`. Coordenador pode aceitar ou override.

---

## 6. FLUXO BIMESTRAL (regras de negocio)

### Sequencia obrigatoria
```
1. Perfil Academico (coordenador preenche) → desbloqueia restante
2. Curriculo Original (vinculado do banco global)
3. Curriculo Adaptado (IA gera com base em perfil + original + BNCC)
4. Planejamento por materia (seleciona do banco + IA gera faltantes, ~20 atividades)
5. Apostila (compilacao das atividades finalizadas)
6. Provas (2 cenarios: adequacao escola OU IA gera nova)
7. Registro Avaliativo (AT preenche no portal)
8. Fechar Bimestre (coordenador, pode fechar com justificativa)
```

### Regras de bloqueio
- Sem perfil academico → bloqueia: curriculo adaptado, planejamento, provas
- Tabs nunca bloqueadas: perfil, curriculo original, registro avaliativo, linha do tempo, evolucao, extrato, card, relatorio

### 2 bimestres simultaneos
- Sonia trabalha com antecipacao. B1 pode estar aberto enquanto B2 tambem
- UI mostra dot pulsante (animate-ping) nos bimestres com status "open"

### Fechar bimestre
- Coordenador/pedagoga clica "Fechar Bimestre"
- Checklist de itens pendentes
- Pode fechar COM justificativa (ex: escola nao aplicou prova)
- Ao fechar: bimestre vira read-only

### Promover ano
- Quando B4 fechado, opcao "Iniciar Ano Letivo {ano+1}"
- Cria novo caso com serie +1

---

## 7. PROVAS — 2 CENARIOS

### Cenario A: Adequacao da prova da escola
1. Upload PDF da prova original
2. Checklist de adequacoes (simplificar enunciados, aumentar fonte, reduzir alternativas, etc.)
3. Campo observacoes
4. Upload da prova final adaptada (apos design)

### Cenario B: Prova gerada por IA
1. Selecionar disciplina + V1/V2
2. IA gera prova baseada no curriculo adaptado
3. 2 tabs resultado: questoes + orientacoes design
4. Upload prova final (apos design)

### V1 e V2
- V1 = prova mensal
- V2 = prova bimestral
- Config por aluno: v1_only ou v1_v2
- Ed. Infantil nao tem prova (flag tem_prova no cadastro)

---

## 8. PORTAL AT

Acesso separado, mobile-first. AT so faz registro avaliativo.

### O que AT ve:
- Lista de pacientes atribuidos (via student_assignments)
- Ficha do paciente (read-only): dados, bimestres, historico registros
- Form registro avaliativo: data, duracao, area conhecimento, tipo V1/V2, 6 toggles sim/nao com campos condicionais, upload PDF, descricao

### O que AT NAO ve:
- Perfil academico (responsabilidade do coordenador)
- Curriculo, planejamento, provas
- Solicitacao de material (premium)

---

## 9. IA — PONTOS DE INTEGRACAO (fase 2)

| Ponto | Input | Output | Prioridade |
|-------|-------|--------|-----------|
| Curriculo Adaptado | Perfil + curriculo original + BNCC | Documento com objetivos, estrategias, BNCC tags por materia | P0 |
| Planejamento | Curriculo adaptado + banco atividades | ~20 atividades por materia com enunciado/descricao | P0 |
| Provas (cenario B) | Curriculo adaptado + nivel | 8-10 questoes adaptadas por disciplina | P1 |
| Relatorio Paciente | Todos os dados do ciclo (checkboxes selecionados) | Relatorio pedagogico dissertativo | P1 |
| Classificacao Atividades | Atividade uploadada | Tags BNCC, nivel, tipo, materia automaticos | P2 |

### BNCC como contexto RAG
- 1.304 habilidades codificadas (EF01MA01, EF03HI02, etc.)
- Organizadas por componente curricular + serie
- Futuro: embeddings pgvector para busca semantica
- A IA seleciona habilidades compativeis com nivel do aluno

---

## 10. O QUE IMPLEMENTAR PRIMEIRO (prioridade dev)

### Sprint 1 — Backend real (Supabase)
- [ ] RLS policies por role (admin ve tudo, AT so seus alunos)
- [ ] Triggers para timeline_events (auto-gerar eventos)
- [ ] Triggers para pendencies (auto-gerar quando servico habilitado e nao preenchido)
- [ ] Seed BNCC (1.304 habilidades)
- [ ] Storage buckets (exam-files, photos, materials) com policies

### Sprint 2 — CRUD real (substituir mocks)
- [ ] Curriculo Adaptado: salvar/carregar de adapted_curricula (hoje e mock)
- [ ] Planejamento: salvar/carregar de lesson_plans (hoje e mock)
- [ ] Provas: salvar/carregar de adapted_exams (hoje e mock)
- [ ] Relatorio: salvar/carregar de patient_reports (hoje e mock)
- [ ] Banco curriculos: campo escola no DB (migration)
- [ ] Banco atividades: campos bncc_tags, status, designer_link, nivel no DB (migration)

### Sprint 3 — IA
- [ ] Endpoint curriculo adaptado (input: perfil + original + BNCC → output: documento)
- [ ] Endpoint planejamento (input: curriculo adaptado → output: 20 atividades)
- [ ] Endpoint provas cenario B (input: curriculo adaptado + nivel → output: questoes)
- [ ] Endpoint relatorio (input: dados selecionados → output: texto dissertativo)

### Sprint 4 — Polish
- [ ] Mobile responsive completo
- [ ] Notificacoes (bimestre aberto, pendencias)
- [ ] Export PDF real (relatorio, curriculo adaptado)
- [ ] Config adaptacao por disciplina (uniform_adaptation toggle)

---

## 11. PAGINAS LOVABLE (referencia visual — NAO MODIFICAR)

Essas paginas existem no codigo como referencia de UX. Foram adaptadas como tabs:

| Arquivo | Usado como base para |
|---------|---------------------|
| CurriculumPage.tsx | CurriculoAdaptadoTab |
| TheoreticalBasePage.tsx | PlanejamentoTab |
| AssessmentPage.tsx | ProvasTab |
| AcademicProfilePage.tsx | Referencia visual perfil |
| ChildPresentationCardPage.tsx | CardTab |
| MaterialBankPage.tsx | Banco Atividades |

---

## 12. VARIAVEIS DE AMBIENTE

```env
VITE_SUPABASE_URL=https://pxopccvykwdzjqjodmob.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key do projeto>
```

---

## 13. COMANDOS

```bash
npm install          # Instalar dependencias
npm run dev          # Dev server (localhost:5173)
npm run build        # Build producao (dist/)
npx vercel --prod    # Deploy Vercel
```

---

## 14. DECISOES TECNICAS IMPORTANTES

1. **Schema separado:** Todas as tabelas em `estimulos`, nao em `public`. Client usa `db = supabase.schema("estimulos")`
2. **Auth:** Supabase email/senha. Role no metadata do profile. Guard no frontend redireciona AT pro portal
3. **Perfil academico:** Wizard completo reutilizado entre portal e sistema (PortalAcademicProfilePage.tsx). Detecta contexto via `useLocation()`
4. **Blocos como JSONB:** Nao cria 50 colunas. 1 coluna `blocks` com estrutura tipada
5. **Scores calculados no frontend:** `calculateScoresFromBlocks()` recalcula a cada mudanca. Salva resultado no DB
6. **Mock data nas tabs de IA:** CurriculoAdaptado, Planejamento, Provas e Relatorio tem conteudo mock que simula o output da IA. Na fase 2, substituir por chamada real
7. **Framer Motion:** Animacoes de entrada nas tabs e listas. Manter — faz diferenca na UX
