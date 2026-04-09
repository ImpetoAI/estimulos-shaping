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
Voltar CRUD de escolas. Select no cadastro + "Adicionar nova escola".

### Schema (ja existe tabela estimulos.schools)
```sql
-- Ja existe, verificar campos:
-- id, name, city, state, type (publica/particular), active
```

### Frontend
- Voltar rota `/escolas` (ou manter so como dialog)
- PatientForm: trocar Input por Select de escolas + botao "Nova escola"
- A escola e usado no vinculo com curriculo original (Banco de Curriculos tem campo `escola`)

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
```
