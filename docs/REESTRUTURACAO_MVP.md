# Reestruturacao MVP Estimulos — Plano de Execucao

Data: 2026-03-31
Objetivo: Preparar MVP funcional para apresentacao/validacao com equipe Estimulos

---

## Principio Geral

**Nao reinventar a roda.** O Lovable ja entregou UX excelente em 6 paginas de referencia.
A reestruturacao consiste em ADAPTAR essas paginas como tabs dentro do PatientDetailPage,
substituindo dados hardcoded por dados dinamicos do aluno/caso/bimestre.

---

## Paginas Lovable como Referencia

| Lovable Page | Usar como base para | Status |
|---|---|---|
| CurriculumPage.tsx (301 linhas) | CurriculoAdaptadoTab | DONE |
| TheoreticalBasePage.tsx (874 linhas) | PlanejamentoTab | DONE |
| AssessmentPage.tsx (789 linhas) | ProvasTab | DONE |
| AcademicProfilePage.tsx (544 linhas) | Referencia visual perfil (portal ja tem wizard proprio) | REFERENCIA |
| ChildPresentationCardPage.tsx (321 linhas) | CardTab (ja integrado) | OK |
| MaterialBankPage.tsx (319 linhas) | Banco Atividades | REFERENCIA |

---

## Mudancas por Modulo

### 1. Curriculo Adaptado (CurriculoAdaptadoTab)
- **Antes:** 4 textareas (areas, objetivos, estrategias, tarefas) por disciplina fixa
- **Agora:** Layout CurriculumPage.tsx adaptado como tab
  - Sidebar: dados do aluno (real Supabase) + resumo perfil (scores reais) + nivel adaptacao N1-N5
  - Pre-geracao: banner sugestao IA + botao "Gerar com Sugestao Inteligente" (mock toggle)
  - Pos-geracao: documento com secoes colapsaveis por materia (objetivos + estrategias tags + BNCC badges)
  - Loading skeleton enquanto carrega dados
- **Status:** DONE

### 2. Planejamento / Base Teorica (PlanejamentoTab)
- **Antes:** Lista atividades manual/banco por disciplina, sem status pipeline
- **Agora:** Layout TheoreticalBasePage.tsx adaptado como tab
  - Header aluno com avatar + nome + badges (dados reais)
  - Sidebar: resumo curriculo (accordion), config, botao "Gerar Base Teorica" (mock com animacao)
  - 2 tabs resultado: Base Teorica (markdown editavel) + Produto Final (20 atividades com enunciado/descricao/tipo)
  - MarkdownRenderer completo
- **Status:** DONE

### 3. Provas (ProvasTab)
- **Antes:** Radio adequacao vs curriculo, sem V1/V2
- **Agora:** Layout AssessmentPage.tsx adaptado como tab
  - Header aluno + sidebar curriculo (accordion) + config + upload prova final
  - 2 tabs resultado: Questoes da Prova (10 questoes mock) + Orientacoes para Design
  - Botao "Gerar Prova Adaptada" (mock com animacao)
- **Status:** DONE

### 4. Perfil Academico (PortalAcademicProfilePage)
- **Antes:** 9 blocos com checkboxes/radios basicos
- **Agora:** 10 blocos detalhados espelhando Google Forms real
  - Matematica expandido: contagem oral, sequencia numerica, adicao 1/2/3 termos + reserva, subtracao 1/2 + emprestimo, quadro valor, liga numero-quantidade (4 tipos), formas planas/espaciais, caca-numeros
  - Coord Motora expandido: pintura contorno, legenda cores, recorte/colagem sozinho/suporte, montagem, liga pontos, dobraduras, tracado, quebra-cabeca 2-10+ pecas + tipo corte
  - Bloco 10: Observacoes finais (texto livre)
  - Score calculation atualizado com novos campos
- **Status:** DONE

### 5. Cadastro do Aluno (PatientForm)
- **Antes:** tipo_atendimento = individual/grupo, sem flags
- **Agora:**
  - tipo_atendimento = escolar/individual/individual_escolar/particular
  - Campo foto_url (URL da foto)
  - Switch "Aluno tem prova?" (Ed. Infantil nao tem)
  - Select config V1/V2 (condicional — so aparece se tem_prova=true)
- **Status:** DONE

### 6. Registro Avaliativo (RegistroAvaliativoTab + PortalEvaluationFormPage)
- **Antes:** Sem distincao V1/V2
- **Agora:** Campo tipo prova V1 (mensal) / V2 (bimestral) nos 2 forms
- **Status:** DONE

### 7. Portal AT — UX
- **Antes:** Funcional mas sem indicadores de bimestre
- **Agora:** Banner "B{N} aberto — verifique se o perfil academico precisa ser atualizado" quando bimester > 1
- **Status:** DONE

### 8. Banco de Atividades (banco-atividades)
- **Antes:** CRUD basico sem tags
- **Agora:**
  - Tags BNCC (campo texto)
  - Status: Pendente / Em Design / Concluida (com badges)
  - Link designer (URL Canva/PDF)
  - Nivel adaptacao N1-N5 (select)
  - Badges de status e BNCC nos cards
- **Status:** DONE

### 9. PatientDetailPage — 2 Bimestres Simultaneos
- **Antes:** Sem indicador visual de 2 bimestres abertos
- **Agora:** Dot pulsante (animate-ping) nos bimestres com status "open", visivel mesmo quando nao selecionado
- **Status:** DONE

### 10. Extrato — Material Extra-Bimestre
- **Antes:** So materiais por bimestre
- **Agora:** Secao "Materiais Extra-Bimestre" com placeholder para apostila de ferias (junho/dezembro)
- **Status:** DONE

---

## Progresso Final

| # | Modulo | Status |
|---|--------|--------|
| 1 | Curriculo Adaptado | DONE |
| 2 | Planejamento | DONE |
| 3 | Provas | DONE |
| 4 | Perfil Academico | DONE |
| 5 | Cadastro | DONE |
| 6 | Registro Avaliativo | DONE |
| 7 | Portal AT UX | DONE |
| 8 | Banco Atividades | DONE |
| 9 | PatientDetail | DONE |
| 10 | Extrato | DONE |

**10/10 modulos concluidos. Build limpo (vite build sem erros).**

---

## Arquivos Modificados

### Reescritos (Lovable → Tab)
- `src/pages/pacientes/ciclo/CurriculoAdaptadoTab.tsx`
- `src/pages/pacientes/ciclo/PlanejamentoTab.tsx`
- `src/pages/pacientes/ciclo/ProvasTab.tsx`

### Expandidos
- `src/pages/portal/PortalAcademicProfilePage.tsx` (campos detalhados Google Forms)

### Campos adicionados
- `src/types/patient.ts` (TipoAtendimento expandido)
- `src/pages/pacientes/patientSchema.ts` (tipo_atendimento + foto + prova flags)
- `src/pages/pacientes/PatientForm.tsx` (3 campos novos)
- `src/pages/pacientes/ciclo/RegistroAvaliativoTab.tsx` (V1/V2)
- `src/pages/portal/PortalEvaluationFormPage.tsx` (V1/V2)
- `src/pages/portal/PortalPatientDetailPage.tsx` (banner bimestre)
- `src/pages/banco-atividades/index.tsx` (BNCC, status, link, nivel)

### Polimentos
- `src/pages/PatientDetailPage.tsx` (dot pulsante 2 bimestres)
- `src/pages/pacientes/ciclo/ExtratoTab.tsx` (secao extra-bimestre)

---

## Notas

- Foco em CASCA FUNCIONAL — UI completa, dados mock onde necessario, IA mockada
- Lovable pages sao a referencia visual — nao regredir
- Dados dinamicos do Supabase onde ja existe (aluno, caso, perfil, etc.)
- Botoes IA: estrutura correta com animacao de geracao, dados mock no resultado
- Proximo passo: deploy Vercel + validacao com equipe Estimulos
