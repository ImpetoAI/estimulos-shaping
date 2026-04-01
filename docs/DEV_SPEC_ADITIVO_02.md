# Estimulos — Aditivo Spec #02: Workflow Provas + Registro Read-Only + Separacao de Responsabilidades

Data: 2026-04-01
Referencia: docs/DEV_SPEC.md (spec principal) + docs/DEV_SPEC_ADITIVO_01.md

---

## 1. SEPARACAO DE RESPONSABILIDADES POR ROLE

### Sistema Principal (sidebar, /pacientes/*)
- Acesso: Admin, Coordenador, Pedagoga
- Todas as tabs do ciclo pedagogico disponiveis
- **Registro Avaliativo = READ-ONLY** (so visualiza o que AT enviou)
- Coordenador tambem acessa portal pra preencher perfil

### Portal (/portal/*)
- Acesso: Coordenador, AT

| Funcionalidade | Coordenador | AT |
|---------------|------------|-----|
| Ver alunos | Sim (seus) | Sim (atribuidos) |
| Preencher Perfil Academico | Sim | Nao |
| Ver Provas Disponiveis | Nao | Sim |
| Baixar PDF prova | Nao | Sim |
| Novo Registro Avaliativo | Nao | Sim |
| Historico de Registros | Nao | Sim |

---

## 2. WORKFLOW COMPLETO DE PROVAS

```
ETAPA 1 — GERACAO (Sistema Principal)
Coordenador/Pedagoga abre ProvasTab do aluno
→ Seleciona disciplina + V1/V2
→ Cenario A: upload prova escola + checklist adequacoes
→ Cenario B: IA gera prova nova
→ Salva em adapted_exams (adapted_exam_url = NULL)

ETAPA 2 — DESIGN (Sistema Principal ou fila futura)
Designer ve provas com adapted_exam_url = NULL
→ Pega specs (questoes, orientacoes, adequacoes)
→ Cria PDF no Canva/similar
→ Faz upload → atualiza adapted_exam_url

ETAPA 3 — APLICACAO (Portal AT)
AT abre ficha do paciente no portal
→ Secao "Provas Disponiveis" lista provas do bimestre
→ Prova com PDF = "Baixar PDF" (link download)
→ Prova sem PDF = "Aguardando design" (badge warning)
→ AT baixa, imprime, aplica com o aluno

ETAPA 4 — REGISTRO (Portal AT)
AT clica "Novo Registro Avaliativo"
→ Preenche form: area, data, duracao, V1/V2, 6 toggles, observacoes
→ Faz upload do PDF da prova executada (respondida pelo aluno)
→ Salva em evaluation_registries

ETAPA 5 — VISUALIZACAO (Sistema Principal)
Coordenador/Pedagoga abre tab "Registro Avaliativo" do aluno
→ Ve lista READ-ONLY de todos registros enviados pelo AT
→ Cada registro: area, data, toggles, observacoes, link PDF
→ Sem edicao — so visualizacao
```

---

## 3. REGISTRO AVALIATIVO — READ-ONLY NA GESTAO

### Arquivo: `src/pages/pacientes/ciclo/RegistroAvaliativoTab.tsx`

**Antes:** Form completo com create/edit (mesmo form do portal)
**Agora:** Lista read-only de registros enviados pelo AT

### Estrutura visual
- Badge "Somente visualizacao"
- Banner explicando que registros sao preenchidos pelo AT no portal
- Cards expansiveis por registro:
  - Header: area + data + duracao + V1/V2 + status (concluiu/nao)
  - Expandido: conteudos, 6 toggles (sim/nao com icones), descricoes condicionais, observacoes, PDF anexado
- Link pra abrir PDF da prova executada
- Se nao tem PDF: badge warning "Nenhum PDF anexado"

### Query
```typescript
db.from("evaluation_registries")
  .select("*")
  .eq("student_id", studentId)
  .eq("bimester", bimester)
  .order("evaluation_date", { ascending: false });
```

---

## 4. PORTAL AT — PROVAS DISPONIVEIS

### Componente: ProvasDisponiveis (dentro de PortalPatientDetailPage.tsx)

- Query: `adapted_exams WHERE case_id = X AND bimester = Y`
- Cada prova mostra:
  - Badge V1/V2 (colorido: verde se pronta, amarelo se aguardando)
  - Disciplina
  - Cenario (adequacao escola / gerada por IA)
  - Link "Baixar PDF" se adapted_exam_url existe
  - Badge "Aguardando design" se nao

### Visivel apenas para AT
O coordenador nao ve "Provas Disponiveis" no portal — ele ve as provas no sistema principal (ProvasTab).

---

## 5. PORTAL AT — REGISTRO COM UPLOAD PDF

### Arquivo: `src/pages/portal/PortalEvaluationFormPage.tsx`

O form do AT ja tem:
- Campos: data, duracao, area, V1/V2, 6 toggles, observacoes
- Upload de PDF da prova executada (Supabase Storage bucket `exam-files`)
- Salva exam_file_url no registro

### Fluxo do AT
1. Baixa prova da secao "Provas Disponiveis"
2. Imprime e aplica com aluno
3. Digitaliza/fotografa prova respondida
4. Abre "Novo Registro Avaliativo"
5. Preenche campos + faz upload do PDF
6. Salva → registro aparece na gestao (read-only)

---

## 6. TRIGGER FIX DOCUMENTADO

### Problema encontrado
A funcao `estimulos.handle_new_user()` falhava ao criar novos usuarios porque referenciava o tipo `user_role` sem qualificar o schema. O tipo esta em `public.user_role`.

### Fix aplicado
```sql
CREATE OR REPLACE FUNCTION estimulos.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, estimulos
AS $function$
BEGIN
  INSERT INTO estimulos.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'pedagogo')::public.user_role
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$;
```

### Usuarios de teste
| Email | Senha | Role | Ve no portal |
|-------|-------|------|-------------|
| admin@estimulos.com | Estimulos2026! | admin | Tudo (sistema principal) |
| coord@estimulos.com | Estimulos2026! | coordenador | 3 alunos + perfil |
| at@estimulos.com | Estimulos2026! | AT | 4 alunos + provas + registro |
