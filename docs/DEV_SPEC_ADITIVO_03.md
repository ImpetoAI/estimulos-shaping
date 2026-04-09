# Estimulos — Aditivo Spec #03: Cadastro, Pendencias, Perfil Unificado, Escola

Data: 2026-04-09
Referencia: docs/DEV_SPEC.md + aditivos 01 e 02

---

## 1. PLANOS/CONVENIOS CADASTRAVEIS

### Situacao atual
Campo `plano` e enum fixo: `particular | convenio | sus`

### Mudanca
Transformar em entidade cadastravel. Coordenador pode adicionar novos planos.

### Implementacao
```sql
CREATE TABLE estimulos.planos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  tipo text NOT NULL DEFAULT 'convenio', -- particular, convenio, sus, outro
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Seed com os padroes
INSERT INTO estimulos.planos (nome, tipo) VALUES
  ('Particular', 'particular'),
  ('SUS', 'sus');
-- Convenios sao cadastrados pelo usuario
```

### No frontend
- Campo `plano` no PatientForm: trocar de `Select enum` para `Select + botao "Adicionar novo"`
- Dialog simples pra cadastrar novo plano (nome + tipo)
- Listar planos ativos do DB

---

## 2. SOLICITACAO DE MATERIAIS EXTRAS (PORTAL COORDENADOR)

### Situacao atual
Removido do portal. Tinha cadeado "Premium".

### Mudanca
Coordenador pode solicitar materiais extras pelo portal. Botao abaixo de "Preencher Perfil Academico".

### Implementacao
- Reativar rota `/portal/pacientes/:id/solicitar` no PortalRoutes.tsx
- Mostrar botao SO para role coordenador/admin (nao AT)
- PortalMaterialRequestPage.tsx: remover banner de cadeado "Premium"
- Manter os 11 tipos de material

### Visao no portal
```
[Preencher / Editar Perfil Academico]    ← coord
[Solicitar Material Extra]                ← coord
[Novo Registro Avaliativo]                ← AT
```

---

## 3. QUEM RESOLVEU PENDENCIA

### Situacao atual
Pendencias tem campo `status` (pending/resolved/justified) mas sem registro de quem resolveu.

### Mudanca
Ao clicar "Resolver" em uma pendencia, abrir dialog com:
- Campo texto: "Como foi resolvido?"
- Campo automatico: usuario logado (quem resolveu)
- Timestamp

### Schema
```sql
ALTER TABLE estimulos.pendencies
  ADD COLUMN IF NOT EXISTS resolved_by uuid REFERENCES estimulos.profiles(id),
  ADD COLUMN IF NOT EXISTS resolution_notes text,
  ADD COLUMN IF NOT EXISTS resolved_at timestamptz;
```

### Frontend (PendenciasPage)
- Botao "Resolver" abre AlertDialog
- Textarea "Descreva a resolucao"
- Ao confirmar: atualiza status + resolved_by + resolution_notes + resolved_at
- Na lista, mostrar quem resolveu e quando

---

## 4. PERFIL UNIFICADO (ACADEMICO + CARD DE IDENTIFICACAO)

### Situacao atual
- Perfil Academico: 10 blocos (tipo letra, alfa, escrita, mat, assoc, motor, compreensao, comunicacao, observacoes)
- Card da Crianca: separado (gostos, preferencias, comunicacao, emocoes, estrategias)

### Mudanca
Unificar. O Perfil Academico passa a ter blocos adicionais de identificacao/preferencias que alimentam automaticamente o Card.

### Novos blocos no Perfil (blocos 11 e 12)
```
Bloco 11 — Sobre o Aluno
- Coisas que gosta (tags/chips — adicionar multiplos)
- Coisas que nao gosta (tags/chips)
- Como se comunicar (texto livre)
- Nome preferido (texto)
- Medicamentos (texto)

Bloco 12 — Emocoes e Estrategias
- Quando fica feliz (texto)
- Quando fica triste (texto)
- Quando fica irritado (texto)
- Estrategias de apoio (tags/chips — adicionar multiplos)
- Habilidades observadas (tags/chips)
```

### Impacto
- PortalAcademicProfilePage: adicionar steps 10 e 11 (apos Observacoes)
- CardTab: passar a LER dados dos blocos 11/12 do perfil em vez de ter CRUD proprio
- Card vira 100% read-only (gerado a partir do perfil)
- STEPS array: de 9 para 11 passos

---

## 5. TOGGLE "NECESSITA ADAPTACAO" NO CADASTRO

### Situacao atual
Servicos pedagogicos sempre visiveis (curriculo adaptado, provas, registro, materiais)

### Mudanca
Switch no cadastro: "Aluno necessita adaptacao curricular?"
- **Sim** → mostra servicos pedagogicos (curriculo adaptado, provas adaptadas, materiais)
- **Nao** → oculta servicos de adaptacao. Aluno so tem: perfil, registro avaliativo, card

### Schema
```sql
ALTER TABLE estimulos.students
  ADD COLUMN IF NOT EXISTS necessita_adaptacao boolean DEFAULT true;
```

### No PatientForm
- Switch antes dos servicos pedagogicos
- Se `false`: oculta secao de servicos (MODULOS_PEDAGOGICOS)
- Default: `true`

### No PatientDetailPage
- Se `necessita_adaptacao = false`: tabs de adaptacao ficam ocultas (curriculo adaptado, planejamento, apostila, provas)
- Tabs que permanecem: perfil, curriculo original, registro, timeline, evolucao, extrato, card, relatorio

---

## 6. CADASTRO DE ESCOLAS

### Situacao atual
Campo `escola` e texto livre no cadastro do aluno.

### Mudanca
CRUD completo de escolas com configuracoes que o aluno HERDA ao ser vinculado.

### Schema
```sql
CREATE TABLE IF NOT EXISTS estimulos.schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text,
  state text DEFAULT 'TO',
  tipo text NOT NULL DEFAULT 'publica'
    CHECK (tipo IN ('publica', 'particular', 'filantrópica')),
  frequencia_adaptacao text NOT NULL DEFAULT 'bimestral'
    CHECK (frequencia_adaptacao IN ('bimestral', 'trimestral', 'semestral', 'anual')),
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```

### Campos da escola

| Campo | Tipo | Descricao | Impacto no aluno |
|-------|------|-----------|-----------------|
| name | text | Nome da escola | Exibido na ficha |
| tipo | enum | publica / particular / filantropica | Informativo + pode influenciar materiais |
| frequencia_adaptacao | enum | bimestral / trimestral / semestral / anual | **Define quantos periodos o aluno tem no ano** |
| city | text | Cidade | Informativo |
| state | text | UF (default TO) | Informativo |

### Frequencia de adaptacao — impacto no ciclo

A escola define a frequencia. O aluno herda:

| Frequencia | Periodos/ano | Labels | Impacto |
|-----------|-------------|--------|---------|
| Bimestral (padrao) | 4 | B1, B2, B3, B4 | Ciclo atual — 4 bimestres |
| Trimestral | 3 | T1, T2, T3 | 3 trimestres em vez de 4 bimestres |
| Semestral | 2 | S1, S2 | 2 semestres |
| Anual | 1 | A1 | 1 periodo unico |

### Heranca no aluno
Quando o aluno e vinculado a uma escola:
1. `frequencia_adaptacao` da escola e copiada pro caso do aluno
2. O PatientDetailPage ajusta o seletor de periodos (B1-B4 ou T1-T3 ou S1-S2 ou A1)
3. A progressao de ano continua funcionando (fecha ultimo periodo → promove/reprova)

### Mudanca no caso (cases)
```sql
ALTER TABLE estimulos.cases
  ADD COLUMN IF NOT EXISTS frequencia text DEFAULT 'bimestral'
    CHECK (frequencia IN ('bimestral', 'trimestral', 'semestral', 'anual')),
  ADD COLUMN IF NOT EXISTS total_periodos int DEFAULT 4;
```

Ao criar caso, herda da escola:
```typescript
const escola = await db.from("schools").select("frequencia_adaptacao").eq("id", student.school_id).single();
const PERIODOS = { bimestral: 4, trimestral: 3, semestral: 2, anual: 1 };
const caso = {
  student_id: student.id,
  academic_year: 2026,
  grade: student.current_grade,
  frequencia: escola.frequencia_adaptacao,
  total_periodos: PERIODOS[escola.frequencia_adaptacao],
  current_bimester: 1, // renomear pra current_periodo no futuro
};
```

### Frontend — CRUD de escolas
- Rota: `/admin/escolas` (ou dialog no cadastro)
- Campos: Nome, Tipo (publica/particular/filantropica), Frequencia (bimestral/trimestral/semestral/anual), Cidade, UF
- Listar com filtros por tipo e cidade
- Botao "Nova Escola" no PatientForm

### Frontend — PatientForm
- Campo `escola`: Select de escolas cadastradas + "Adicionar nova"
- Ao selecionar escola: mostrar info (tipo + frequencia) como badge abaixo do select
- Campo `school_id` no schema (uuid, nao mais texto livre)

### Frontend — PatientDetailPage
- Seletor de periodos dinamico baseado em `case.frequencia`:
  - Bimestral: B1, B2, B3, B4
  - Trimestral: T1, T2, T3
  - Semestral: S1, S2
  - Anual: A1 (so 1 periodo, seletor oculto)

### Vinculo com Banco de Curriculos
Quando aluno e cadastrado com escola X:
- Tab Curriculo Original auto-busca curriculos cadastrados pra escola X + serie do aluno
- Isso ja funciona (CurriculoOriginalTab faz match por escola)

---

## 7. SERIE E PROGRESSAO AUTOMATICA

### Situacao atual — JA IMPLEMENTADO
- `GRADE_PROGRESSION` mapeia serie atual → proxima serie
- `handlePromoteYear` cria novo caso com serie +1 quando B4 fecha
- Botao "Iniciar Ano Letivo {ano+1}" aparece quando B4 esta fechado

### O que falta
1. **Serie nao editavel apos primeiro caso** — se aluno ja tem caso ativo, serie e derivada do caso (nao do cadastro)
2. **Ed. Infantil na progressao** — adicionar:
   ```
   "Maternal I" → "Maternal II"
   "Maternal II" → "Pre I"
   "Pre I" → "Pre II"
   "Pre II" → "1o ano"
   ```
3. **Bloqueio de progressao sem B4 fechado** — so permite promover se todos os 4 bimestres foram fechados (com ou sem justificativa)
4. **Historico de series** — cada `case` tem campo `grade` que registra a serie daquele ano. Aluno pode ter: 2025 = 4o ano, 2026 = 5o ano

### Nao precisa codar — so spec
Ja esta no fluxo. So precisa:
- Adicionar progressao Ed. Infantil no `GRADE_PROGRESSION`
- Tornar campo `serie` read-only no form de edicao se ja tem caso

---

## 8. RESUMO DE PRIORIDADES

| # | Item | Tipo | Prioridade |
|---|------|------|-----------|
| 1 | Planos cadastraveis | Nova tabela + select dinamico | P1 |
| 2 | Solicitar material (portal coord) | Reativar rota existente | P1 |
| 3 | Quem resolveu pendencia | 3 campos novos + dialog | P1 |
| 4 | Perfil unificado (academico + card) | 2 blocos novos + card read-only | P2 |
| 5 | Toggle necessita adaptacao | 1 campo + condicional UI | P1 |
| 6 | Cadastro de escolas | Reativar CRUD + select | P1 |
| 7 | Progressao Ed. Infantil | Adicionar mapeamento | P2 |
| 8 | Reprovacao do aluno | 5 campos no cases + dialog + badges | P1 |
| — | PDF espelho curriculo | Linear/futuro | P3 |

---

## 9. MIGRATIONS NECESSARIAS

```sql
-- 1. Planos
CREATE TABLE IF NOT EXISTS estimulos.planos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  tipo text NOT NULL DEFAULT 'convenio',
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 2. Pendencias — quem resolveu
ALTER TABLE estimulos.pendencies
  ADD COLUMN IF NOT EXISTS resolved_by uuid REFERENCES estimulos.profiles(id),
  ADD COLUMN IF NOT EXISTS resolution_notes text,
  ADD COLUMN IF NOT EXISTS resolved_at timestamptz;

-- 3. Necessita adaptacao
ALTER TABLE estimulos.students
  ADD COLUMN IF NOT EXISTS necessita_adaptacao boolean DEFAULT true;

-- 4. Escolas com frequencia e tipo
CREATE TABLE IF NOT EXISTS estimulos.schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text,
  state text DEFAULT 'TO',
  tipo text NOT NULL DEFAULT 'publica'
    CHECK (tipo IN ('publica', 'particular', 'filantrópica')),
  frequencia_adaptacao text NOT NULL DEFAULT 'bimestral'
    CHECK (frequencia_adaptacao IN ('bimestral', 'trimestral', 'semestral', 'anual')),
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 5. Aluno vincula a escola por ID (nao texto livre)
ALTER TABLE estimulos.students
  ADD COLUMN IF NOT EXISTS school_id uuid REFERENCES estimulos.schools(id);

-- 6. Caso herda frequencia da escola
ALTER TABLE estimulos.cases
  ADD COLUMN IF NOT EXISTS frequencia text DEFAULT 'bimestral'
    CHECK (frequencia IN ('bimestral', 'trimestral', 'semestral', 'anual')),
  ADD COLUMN IF NOT EXISTS total_periodos int DEFAULT 4;

-- 7. Reprovacao
ALTER TABLE estimulos.cases
  ADD COLUMN IF NOT EXISTS outcome text DEFAULT 'em_andamento'
    CHECK (outcome IN ('em_andamento', 'aprovado', 'reprovado')),
  ADD COLUMN IF NOT EXISTS outcome_reason text,
  ADD COLUMN IF NOT EXISTS outcome_date timestamptz,
  ADD COLUMN IF NOT EXISTS outcome_by uuid REFERENCES estimulos.profiles(id),
  ADD COLUMN IF NOT EXISTS is_repeat boolean DEFAULT false;
  -- is_repeat = true quando o caso foi criado porque o aluno reprovou no anterior
```

---

## 10. REPROVACAO DO ALUNO

### Contexto
Quando o aluno completa o ano letivo (B4 fechado), o coordenador decide: aprovar ou reprovar.
O sistema ja tem "Iniciar Ano Letivo" que aprova. Falta o fluxo de reprovacao.

### Fluxo atual (so aprovacao)
```
B4 fecha → Botao "Iniciar Ano Letivo 2027"
         → Cria caso 2027 com serie+1
         → Caso 2026 fica read-only
```

### Fluxo proposto (aprovacao + reprovacao)
```
B4 fecha → Dialog com 2 opcoes:

  [Aprovar e Avançar Serie]
    → Cria caso 2027 com serie+1
    → Caso 2026: outcome = 'aprovado'

  [Reprovar — Repetir Serie]
    → Abre campo: justificativa da reprovacao (obrigatorio)
    → Cria caso 2027 com MESMA serie
    → Caso 2027: is_repeat = true
    → Caso 2026: outcome = 'reprovado', outcome_reason = texto
```

### Regras de negocio

1. **Caso reprovado permanece intacto** — todos os dados (perfil, curriculo, registros, timeline) preservados como historico read-only
2. **Novo caso com mesma serie** — campo `is_repeat = true` marca que e repetencia
3. **Copiar perfil opcional** — ao criar caso de repetencia, dialog pergunta: "Copiar perfil academico do ano anterior como base?" (sim/nao)
   - Se sim: copia blocos do perfil do ultimo bimestre do ano anterior para B1 do novo caso (como rascunho, nao concluido)
   - Se nao: perfil comeca do zero
4. **Curriculo NAO copia** — precisa ser refeito (aluno nao avancou, abordagem pode mudar)
5. **Justificativa obrigatoria** — campo `outcome_reason` nao pode ser vazio na reprovacao
6. **Quem decidiu** — campo `outcome_by` registra o coordenador que tomou a decisao

### Impacto visual

#### PatientDetailPage — Dialog de encerramento de ano
Ao fechar B4, em vez de so mostrar "Iniciar Ano Letivo":
```
┌─────────────────────────────────────────────┐
│  Ano letivo 2026 encerrado                  │
│  Angelo — 5o ano                            │
│                                             │
│  [✓ Aprovar — Iniciar 6o ano em 2027]       │
│  [✗ Reprovar — Repetir 5o ano em 2027]      │
│                                             │
│  Ao reprovar:                               │
│  ┌─────────────────────────────────────┐    │
│  │ Justificativa: ________________     │    │
│  │ □ Copiar perfil do ano anterior     │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

#### Lista de pacientes
- Badge "Repetente" ao lado do nome se caso atual tem `is_repeat = true`

#### Ficha do paciente — anos anteriores
- Ano reprovado: badge vermelho "Reprovado" + justificativa visivel
- Ano aprovado: badge verde "Aprovado"

#### Portal coordenador
- Aluno repetente mostra badge na lista

### Historico do aluno (exemplo)
```
2025 — 4o ano — Aprovado ✓
2026 — 5o ano — Reprovado ✗ (Justificativa: "Nao atingiu objetivos minimos em leitura e matematica")
2027 — 5o ano — Em andamento (Repetente)
```

### Tabela cases (campos novos)
| Campo | Tipo | Descricao |
|-------|------|-----------|
| outcome | text | 'em_andamento' / 'aprovado' / 'reprovado' |
| outcome_reason | text | Justificativa (obrigatoria se reprovado) |
| outcome_date | timestamptz | Quando foi decidido |
| outcome_by | uuid → profiles | Quem decidiu |
| is_repeat | boolean | Caso criado por reprovacao do anterior |

### Query: verificar se aluno e repetente
```sql
SELECT c.is_repeat, prev.outcome, prev.outcome_reason
FROM estimulos.cases c
LEFT JOIN estimulos.cases prev
  ON prev.student_id = c.student_id
  AND prev.academic_year = c.academic_year - 1
WHERE c.student_id = :student_id
  AND c.academic_year = :current_year;
```
