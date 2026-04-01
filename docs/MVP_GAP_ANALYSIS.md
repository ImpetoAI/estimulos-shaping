# Estimulos — Gap Analysis: MVP Atual vs Requisitos Consolidados

## Legenda
- OK = Existe e esta alinhado com requisitos
- PARCIAL = Existe mas precisa refactor significativo
- FALTA = Nao existe, precisa criar
- REMOVER = Existe mas nao deveria (fora do escopo)

---

## 1. SISTEMA DE GESTAO (Admin/Coordenadora/Pedagoga)

### 1.1 Cadastro do Aluno

| Item | Status | MVP Atual | Requisito | O que fazer |
|------|--------|-----------|-----------|-------------|
| Dados pessoais | PARCIAL | Nome, nascimento, cidade | OK mas falta foto upload | Adicionar foto |
| Dados escolares | PARCIAL | Escola era select de cadastro escolas | Escola = texto livre | Ja corrigido |
| AT responsavel | OK | Select de ATs | OK | — |
| Responsaveis | OK | Multiplos com parentesco/telefone | OK | — |
| Dados clinicos | PARCIAL | Tipo atendimento (individual/grupo) | Precisa: escolar/individual/individual+escolar/particular | Ajustar opcoes |
| Terapias | OK | Checkboxes | OK | — |
| Servicos pedagogicos | OK | Checkboxes com periodicidade | OK | — |
| Config disciplinas | REMOVER | Checkboxes de disciplinas no cadastro | Disciplinas vem do curriculo original, config no bimestre | Ja removido |
| Tem prova sim/nao | FALTA | Nao existe | Ed. Infantil nao tem prova | Adicionar flag |
| V1/V2 config | FALTA | Nao existe | Escola com 1 ou 2 provas por bimestre | Adicionar flag |

### 1.2 Pasta do Aluno (PatientDetailPage)

| Item | Status | MVP Atual | Requisito | O que fazer |
|------|--------|-----------|-----------|-------------|
| Seletor ano letivo | OK | Select de anos | OK | — |
| Seletor bimestre | OK | Pills B1-B4 com status | OK | — |
| 2 bimestres simultaneos | PARCIAL | Pode selecionar qualquer B, mas nao tem visual de "2 abertos" | Visual de 2 bolinhas ativas | Ajustar UI |
| Fechar bimestre | OK | Botao com checklist + justificativa | OK | — |
| Promover ano | OK | Botao quando B4 fechado | OK | — |
| Dados cadastrais header | OK | Nome, serie, diagnostico, badges | OK | — |

### 1.3 Perfil Academico (tab dentro do aluno)

| Item | Status | MVP Atual | Requisito | O que fazer |
|------|--------|-----------|-----------|-------------|
| Visualizacao no sistema | OK | Read-only com sidebar blocos + scores | OK | — |
| Blocos detalhados | PARCIAL | 9 blocos basicos | 10 blocos DETALHADOS como Google Forms (adicao 1/2/3 termos, subtracao com/sem emprestimo, quebra-cabeca por pecas, recorte/cola sozinho/suporte, etc.) | REFAZER — espelhar Google Forms real |
| Scores calculados | OK | 5 scores automaticos das respostas | OK | Refinar calculo com campos novos |
| Nivel sugerido | OK | Calculado + aceitar/override | OK | — |
| B2+ atualizar | PARCIAL | Copiar bimestre anterior existe no portal | No sistema: mostrar "de acordo ou atualizar?" | Ajustar UX |

### 1.4 Curriculo Original

| Item | Status | MVP Atual | Requisito | O que fazer |
|------|--------|-----------|-----------|-------------|
| Banco de Curriculos | OK | CRUD com filtros | OK | — |
| Vincular ao caso | OK | Tab curriculo original, dialog busca | OK | — |

### 1.5 Curriculo Adaptado

| Item | Status | MVP Atual | Requisito | O que fazer |
|------|--------|-----------|-----------|-------------|
| Estrutura | PARCIAL | Layout 2 colunas Lovable, 1 textarea por disciplina fixa | 1 documento GLOBAL com materias dinamicas, cada materia: foco + objetivos + original vs adaptado + BNCC | REFAZER — estrutura completamente diferente |
| Adicionar materias | FALTA | Lista fixa de disciplinas | Pedagoga adiciona materias conforme escola | Criar UI dinamica |
| Original vs Adaptado | FALTA | Nao existe comparacao | Tabela 2 colunas por materia (como doc Rafael) | Criar |
| Nivel por materia | FALTA | Nao existe | Nivel refinado por materia (Portugues N2, Matematica N4) | Criar |
| Gerar com IA | PARCIAL | Botao disabled "Em breve" | Manter mockado mas com estrutura correta | Ajustar placeholder |
| Habilidades BNCC | FALTA | Nao tem | Tags BNCC por materia selecionadas pela IA | Criar campo |
| Versionamento | PARCIAL | Version int | OK | — |

### 1.6 Base Teorica / Planejamento

| Item | Status | MVP Atual | Requisito | O que fazer |
|------|--------|-----------|-----------|-------------|
| Estrutura | PARCIAL | Layout 2 colunas Lovable, lista atividades manual | POR MATERIA: selecionar do banco + gerar faltantes com IA | REFAZER |
| Selecionar materia | FALTA | Nao existe | Select materia do curriculo adaptado | Criar |
| Buscar banco atividades | PARCIAL | Botao "Selecionar do banco" | Busca automatica por BNCC tags + nivel + materia | Melhorar busca |
| Atividades com status | FALTA | Sem status | pendente → em_design → concluida (link) | Criar |
| Link do designer | FALTA | Nao existe | Campo URL pra link do Canva/PDF finalizado | Criar |
| ~20 atividades por materia | PARCIAL | Lista livre | Meta 20, tracker de progresso | Criar |

### 1.7 Apostila

| Item | Status | MVP Atual | Requisito | O que fazer |
|------|--------|-----------|-----------|-------------|
| Link versao final | OK | Link + responsavel + data | OK | — |

### 1.8 Provas

| Item | Status | MVP Atual | Requisito | O que fazer |
|------|--------|-----------|-----------|-------------|
| 2 cenarios | OK | Radio adequacao escola vs curriculo | OK | — |
| V1/V2 | FALTA | 1 prova por disciplina | V1 (mensal) + V2 (bimestral) | Adicionar tipo prova |
| Selecionar prova existente do banco | FALTA | Nao existe | Mesmo fluxo das atividades — busca banco | Criar |
| Tags BNCC | FALTA | Nao tem | Habilidades BNCC vinculadas | Criar |

### 1.9 Registro Avaliativo (tab no sistema)

| Item | Status | MVP Atual | Requisito | O que fazer |
|------|--------|-----------|-----------|-------------|
| Lista + form | OK | Lista registros + form 6 toggles | OK | — |
| V1/V2 | FALTA | Nao distingue tipo | Tipo prova: V1 ou V2 | Adicionar campo |
| Upload PDF | OK | Supabase Storage | OK | — |

### 1.10 Linha do Tempo

| Item | Status | MVP Atual | Requisito | O que fazer |
|------|--------|-----------|-----------|-------------|
| Timeline cronologica | OK | Eventos read-only | OK | — |

### 1.11 Evolucao

| Item | Status | MVP Atual | Requisito | O que fazer |
|------|--------|-----------|-----------|-------------|
| Graficos comparativos | OK | Radar + bar charts Recharts | OK | — |

### 1.12 Extrato

| Item | Status | MVP Atual | Requisito | O que fazer |
|------|--------|-----------|-----------|-------------|
| Lista materiais | OK | Cards com tipo/data | OK | — |
| Apostila de ferias | FALTA | Nao tem | Material fora do bimestre (junho/dezembro) | Permitir material sem bimestre |

### 1.13 Card da Crianca

| Item | Status | MVP Atual | Requisito | O que fazer |
|------|--------|-----------|-----------|-------------|
| Visual ludico | OK | Reescrito com visual Lovable (chips, emocoes, estrategias) | OK | — |
| Form editavel | OK | 2 colunas: preview + form | OK | — |

---

## 2. PORTAL AT

### 2.1 Acesso e Navegacao

| Item | Status | MVP Atual | Requisito | O que fazer |
|------|--------|-----------|-----------|-------------|
| Login separado | OK | /portal/login | OK | — |
| Layout mobile-first | OK | Header simples + layout limpo | OK | — |
| Lista meus pacientes | OK | Busca real Supabase via student_assignments | OK | — |

### 2.2 Ficha do Paciente (portal)

| Item | Status | MVP Atual | Requisito | O que fazer |
|------|--------|-----------|-----------|-------------|
| Dados read-only | OK | Nome, escola, serie, diagnostico | OK | — |
| Seletor ano | OK | Select se multiplos anos | OK | — |
| Visao bimestral | OK | Grid B1-B4 com status | OK | — |
| Status por bimestre | OK | Perfil/curriculo/avaliacao pendente/concluido | OK | — |
| Indicador nivel mudou | OK | Seta verde/vermelha entre bimestres | OK | — |
| Anos anteriores | PARCIAL | Cards colapsaveis | Melhorar visual | Polir |
| 3 botoes acao | OK | Perfil + Registro + Material | OK | — |
| Historico registros | OK | Lista com data/disciplina/status | OK | — |

### 2.3 Perfil Academico (portal AT)

| Item | Status | MVP Atual | Requisito | O que fazer |
|------|--------|-----------|-----------|-------------|
| Wizard com blocos | OK | 9 steps + progress bar | OK mas faltam campos | — |
| Checkboxes/radios | OK | Baseado no Lovable (FontPreference, Literacy, Writing, Math, etc.) | OK mas SIMPLIFICADO vs Google Forms real | REFAZER com campos completos |
| Campos matematica detalhados | FALTA | Basico (contagem, escrita, problemas, cedulas) | Adicao 1/2/3 termos + com reserva, subtracao 1/2 com/sem emprestimo, liga numero-quantidade (4 tipos), caca-numeros, formas planas/espaciais | Adicionar todos |
| Campos coord motora detalhados | FALTA | Basico | Recorte/cola sozinho/suporte, montagem figuras/palavras, liga pontos sozinho/suporte, dobraduras sozinho/suporte, quebra-cabeca 2/3/4/8/10+ pecas com tipo corte | Adicionar todos |
| Scores calculados automaticamente | OK | Recalcula a cada mudanca | OK mas precisa refinar com campos novos | Atualizar calculo |
| Nivel sugerido | OK | Calculado + aceitar/override manual | OK | — |
| Copiar bimestre anterior | OK | Botao funcional | OK | — |
| Auto-save rascunho | OK | Debounce 3s | OK | — |
| Sidebar com scores (desktop) | OK | Scores + nivel + blocos navegaveis | OK | — |
| Mobile scores | OK | No ultimo step | OK | — |
| "Atualizar" vs "Preencher" | FALTA | Sempre mostra "Preencher" | B2+: "Perfil de acordo ou precisa atualizar?" | Ajustar UX |

### 2.4 Registro Avaliativo (portal AT)

| Item | Status | MVP Atual | Requisito | O que fazer |
|------|--------|-----------|-----------|-------------|
| Form completo | OK | 6 toggles + upload + descricao | OK | — |
| Vinculado a aluno+ano+bimestre | PARCIAL | Vincula ao case_id + bimestre | Precisa tambem tipo prova V1/V2 | Adicionar campo |
| Por materia | OK | Select area conhecimento | OK | — |

### 2.5 Solicitar Material (portal AT)

| Item | Status | MVP Atual | Requisito | O que fazer |
|------|--------|-----------|-----------|-------------|
| Ano + bimestre | OK | Selects vinculados ao caso | OK | — |
| Tipo material | OK | 11 opcoes | OK | — |
| Lista solicitacoes | OK | Com status badge | OK | — |

### 2.6 O que FALTA no portal AT

| Item | O que fazer |
|------|-------------|
| Ver curriculo adaptado | AT precisa ver o curriculo pra saber o que trabalhar? Sonia disse nao — AT so recebe apostila. Manter fora. |
| Ver atividades/apostila | AT ve status: "apostila pronta" / "em producao". Nao edita. | FALTA — adicionar visao |
| Pendencias do AT | AT ve quais registros avaliativos faltam enviar | PARCIAL — existe no status do bimestre mas nao lista explicita |
| Notificacao bimestre mudou | "B2 aberto — atualize o perfil" | FALTA — adicionar banner/alerta |

---

## 3. OPERACIONAL (fase 2, ja existe parcialmente)

| Item | Status | Notas |
|------|--------|-------|
| Dashboard KPIs | OK | Recharts, filtro periodo |
| Producao kanban | OK | 3 colunas, avancar etapa |
| Insumos | OK | Registro na finalizacao |
| Pendencias globais | OK | Tabela com filtros + justificar |
| Relatorio CAPE | OK | Operacional |
| Relatorio Insumos | OK | Consumo |
| Relatorio Paciente | OK | IA mockada |
| Banco de Curriculos | OK | CRUD com filtros |
| Banco de Atividades | PARCIAL | CRUD existe mas falta: tags BNCC reais, status pendente/concluida, link designer, busca por nivel+materia |

---

## 4. PAGINAS LOVABLE ORIGINAIS (nao usadas nas rotas mas existem no codigo)

Estas paginas tem UX excelente e devem ser usadas como REFERENCIA VISUAL:

| Arquivo | Conteudo | Usar como base pra |
|---------|----------|-------------------|
| AcademicProfilePage.tsx (544 linhas) | Wizard completo: 3 fases, 9 blocos, sliders score, nivel | Referencia pro perfil no portal AT |
| CurriculumPage.tsx (301 linhas) | Layout 2 colunas, resumo perfil, sugestao IA, badges | Referencia pro curriculo adaptado |
| TheoreticalBasePage.tsx (874 linhas) | Sidebar + documento formatado, base teorica | Referencia pra base teorica |
| AssessmentPage.tsx (789 linhas) | Sidebar + questoes formatadas, 2 tabs | Referencia pra provas |
| ChildPresentationCardPage.tsx (321 linhas) | Card ludico com chips, emocoes | Ja usado no CardTab |
| MaterialBankPage.tsx (319 linhas) | Grid cards atividades | Referencia pro banco atividades |

---

## 5. RESUMO DE PRIORIDADES

### P0 — Critico (sem isso o sistema nao reflete a operacao real)

1. **Perfil Academico completo** — 10 blocos detalhados como Google Forms (matematica: adicao por termos, subtracao, etc.)
2. **Curriculo Adaptado reestruturado** — documento global com materias dinamicas, original vs adaptado, nivel por materia, BNCC tags
3. **Base Teorica por materia** — selecionar do banco + gerar faltantes, atividades com status + link designer

### P1 — Importante (funciona sem mas fica incompleto)

4. V1/V2 provas
5. Atividades com status (pendente → design → concluida + link)
6. Config tem prova sim/nao (Ed. Infantil)
7. Portal AT: alerta "B2 aberto — atualize perfil"
8. Portal AT: visao status apostila/atividades

### P2 — Nice to have (ja existe e funciona)

9. Dashboard, producao, pendencias, relatorios — ja implementados
10. Banco curriculos — ja implementado
11. Card da crianca — ja implementado
12. Fechar bimestre/promover ano — ja implementado

---

## 6. REMOVER DO MVP

| Item | Razao |
|------|-------|
| Pagina Escolas (/escolas) | Removido — escola e texto livre no cadastro |
| school_curricula (vinculo escola-curriculo) | Removido — curriculo vincula direto no caso |
| Config disciplinas no cadastro | Removido — materias vem do curriculo original |
| Paginas Lovable orfas (Index.tsx, PatientRegistrationPage.tsx, MaterialPage.tsx, MaterialStatementPage.tsx, EvaluationRecordPage.tsx) | Substituidas por novas paginas |
