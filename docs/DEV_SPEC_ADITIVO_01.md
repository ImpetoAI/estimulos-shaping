# Estimulos — Aditivo Spec #01: Portal Multi-Role + Workflow de Provas

Data: 2026-04-01
Referencia: docs/DEV_SPEC.md (spec principal)

---

## 1. PORTAL MULTI-ROLE

O portal (`/portal/*`) agora aceita 3 roles: `admin`, `coordenador`, `atendente_terapeutica`.

### Comportamento por role

| Funcionalidade | Admin | Coordenador | AT |
|---------------|-------|------------|-----|
| Ver alunos | Todos | Seus (coordinator_id) | Atribuidos (student_assignments) |
| Preencher Perfil Academico | Sim | Sim | Nao |
| Ver provas disponiveis | Sim | Sim | Sim |
| Baixar PDF da prova | Sim | Sim | Sim |
| Preencher Registro Avaliativo | Sim | Sim | Sim |

### Arquivos alterados
- `src/components/portal/PortalGuard.tsx` — aceita array de roles `["atendente_terapeutica", "coordenador", "admin"]`
- `src/pages/portal/PortalPatientsPage.tsx` — carrega alunos baseado no role
- `src/pages/portal/PortalPatientDetailPage.tsx` — acoes condicionais por role + secao "Provas Disponiveis"
- `src/pages/portal/PortalRoutes.tsx` — rota `/portal/pacientes/:id/perfil` restaurada

### Logica de carregamento de alunos
```typescript
if (user.role === "admin") {
  // Ve todos os alunos ativos
  db.from("students").select("id").eq("status", "active")
} else if (user.role === "coordenador") {
  // Ve alunos onde e coordenador
  db.from("students").select("id").eq("coordinator_id", user.id)
} else {
  // AT: ve alunos atribuidos
  db.from("student_assignments").select("student_id").eq("profile_id", user.id)
}
```

---

## 2. WORKFLOW DE PROVAS

### Fluxo completo

```
1. Coordenador/Pedagoga gera prova no ProvasTab
   (Cenario A: adequacao escola, Cenario B: IA gera)
   → Salva specs em adapted_exams

2. Designer ve provas pendentes (campo adapted_exam_url = null)
   → Pega specs (discipline, scenario, adequations, questions)
   → Cria PDF no Canva/similar
   → Faz upload do PDF final → atualiza adapted_exam_url

3. AT abre portal → ve "Provas Disponiveis" com status
   → Prova com PDF = "Baixar PDF" (link)
   → Prova sem PDF = "Aguardando design" (badge warning)

4. AT aplica prova → preenche Registro Avaliativo
```

### Tabela adapted_exams — campos relevantes pro workflow

```sql
adapted_exams (
  id uuid PK,
  case_id uuid,
  bimester int,
  discipline text,
  scenario text,           -- 'school_adaptation' | 'curriculum_based'
  exam_type text,          -- 'v1' | 'v2'
  original_exam_url text,  -- PDF escola (cenario A)
  adapted_exam_url text,   -- PDF FINAL (designer faz upload aqui)
  adequations jsonb,       -- checklist de adequacoes (cenario A)
  ai_generated boolean,
  version int
)
```

### Status derivado
- `adapted_exam_url IS NULL` → "Aguardando design"
- `adapted_exam_url IS NOT NULL` → "Pronta" (AT pode baixar)

### Componente ProvasDisponiveis (portal AT)
- Localizado em: `src/pages/portal/PortalPatientDetailPage.tsx`
- Query: `adapted_exams WHERE case_id = X AND bimester = Y`
- Mostra: badge V1/V2 + disciplina + cenario + link PDF ou status "aguardando"

---

## 3. PONTOS PENDENTES DO FERNANDO

### Implementar

| # | Item | Descricao | Prioridade |
|---|------|-----------|-----------|
| 8 | Categoria/subcategoria | Trocar input livre por select fixo + "Adicionar nova" no banco de atividades | P2 |
| 5 | Visual piramide | Adicionar visual de piramide dos 5 niveis no curriculo adaptado (opcional) | P3 |

### Esclarecimentos (nao sao bugs)

| # | Item | Resposta |
|---|------|---------|
| 2 | BNCC cadastrada? | Nao. Seed de 1.304 habilidades e Sprint 1. Banco de Curriculos e pra curriculos de escolas. |
| 3 | Upload curriculo original | Cadastro e no Banco de Curriculos (sidebar). Tab do paciente e read-only. |
| 6 | Botao salvar | Tabs de IA sao mock. Backend real tera persistencia + save. |

---

## 4. DESIGNER — ACESSO FUTURO

O designer precisa de acesso pra:
1. Ver fila de provas pendentes (`adapted_exams WHERE adapted_exam_url IS NULL`)
2. Baixar specs (questoes, orientacoes, adequacoes)
3. Fazer upload do PDF final

### Opcoes de implementacao
- **A) Tela dedicada no sistema principal** — rota `/producao/provas` com lista de provas pendentes
- **B) Portal separado** — `/portal` com role `designer`
- **C) Coluna no banco de atividades** — reutilizar a mesma logica

**Recomendacao:** Opcao A (tela no sistema principal). Designer ja tem acesso ao sistema, so precisa de uma view filtrada.

---

## 5. MIGRATIONS NECESSARIAS

```sql
-- Adicionar campo escola no curriculum_banks (se nao existir)
ALTER TABLE estimulos.curriculum_banks ADD COLUMN IF NOT EXISTS escola text;

-- Adicionar campo exam_type no adapted_exams (se nao existir)
ALTER TABLE estimulos.adapted_exams ADD COLUMN IF NOT EXISTS exam_type text DEFAULT 'v1';

-- Adicionar campos no activities (se nao existir)
ALTER TABLE estimulos.activities ADD COLUMN IF NOT EXISTS bncc_tags text;
ALTER TABLE estimulos.activities ADD COLUMN IF NOT EXISTS status text DEFAULT 'pendente';
ALTER TABLE estimulos.activities ADD COLUMN IF NOT EXISTS designer_link text;
ALTER TABLE estimulos.activities ADD COLUMN IF NOT EXISTS nivel_adaptacao text;
```
