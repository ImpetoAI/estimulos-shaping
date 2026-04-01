# Estimulos — Requisitos Consolidados

Documento final de requisitos validados com Sonia (cliente), Fernando (comercial) e Joao (tech lead).
Gerado em 2026-03-31 apos discovery profundo.

---

## 1. Visao Geral

Sistema de gestao pedagogica para criancas com TDAH/autismo/necessidades especiais.
Cliente: Brinquedoteca Estimulos (Palmas-TO). 60 alunos hoje, projecao 200-500.

**Core:** Perfil → Curriculo Adaptado → Base Teorica (atividades) → Prova → Registro → Fecha bimestre

---

## 2. Roles e Acessos

| Role | Acesso | O que faz |
|------|--------|-----------|
| Admin | Tudo | Gestao geral |
| Coordenadora (Leticia) | Sistema completo | Supervisao, devolutivas familia, fechar bimestres |
| Pedagoga (Pollyana, Renata) | Ciclo pedagogico | Curriculo adaptado, base teorica, config materias por bimestre |
| Designer | Producao | Diagramar atividades/provas, adicionar links |
| AT (Atendente Terapeutica) | Portal separado | Perfil academico, registro avaliativo, solicitar material |

---

## 3. Cadastro do Aluno

Campos:
- Dados pessoais: nome, foto, nascimento, cidade
- Dados escolares: escola (texto livre), serie, coordenador responsavel
- AT responsavel: select de usuarios com role AT
- Responsaveis: nome, parentesco, telefone (multiplos)
- Dados clinicos: tipo atendimento (escolar/individual/particular), plano, diagnostico
- Terapias liberadas: checkboxes (ABA, Fono, Psicopedagogia, TO, etc.)
- Servicos pedagogicos habilitados: curriculo adaptado, provas, registro avaliativo, materiais avulsos (com periodicidade)

**NAO tem no cadastro:**
- Config de disciplinas/materias (isso e no bimestre)
- Vinculo com escola/curriculo (curriculo original e cadastrado separado)

---

## 4. Estrutura Temporal

```
Aluno → Caso (1 por ano letivo) → 4 Bimestres
```

- Caso: aluno + ano + serie
- Bimestre: periodo variavel (depende da escola, sem data fixa)
- **2 bimestres podem estar abertos simultaneamente** (Sonia trabalha com antecipacao)
- Fechar bimestre: manual pela coordenadora/pedagoga, pode fechar COM justificativa se pendencias
- Promover ano: ao fechar B4, cria caso novo com serie +1

---

## 5. Ciclo Bimestral (fluxo principal)

### 5.1 Perfil Academico

**Quem preenche:** AT (sempre, todo bimestre)
**Onde:** Portal AT
**Editavel:** Sim, sempre. Coordenador pode devolver pra edicao. Tudo com log.

**Blocos (10):** (conforme Google Forms real e doc Projeto de Automacao)
1. Identificacao
2. Tipo de Letra (matriz: cursiva/bastao x pequeno/medio/grande)
3. Alfabetizacao e Letramento (checkboxes)
4. Escrita (radio capacidade copia + checkboxes reconhecimento numerico)
5. Matematica e Logica (contagem, sequencia, escrita qtd, adicao 1/2/3 termos + com reserva, subtracao 1/2 termos com/sem emprestimo, quadro valor, liga numero-quantidade, problemas, formas geometricas, cedulas, caca-numeros)
6. Associacao e Organizacao (liga colunas, sequencia logica, padroes, classificacao)
7. Coordenacao Motora (pintura contorno, legenda, recorte/cola sozinho/suporte, montagem, liga pontos, dobraduras, construcoes materiais, tracado, quebra-cabeca 2-10+ pecas)
8. Compreensao Textual (dissertativas/objetivas, escala escrita, interpretacao)
9. Comunicacao e Habilidades Sociais (checkboxes)
10. Observacoes finais (texto livre)

**Output automatico:**
- 5 scores calculados das respostas: Leitura, Escrita, Matematica, Logica, Autonomia (1-5)
- Nivel de adaptacao sugerido (N1-N5)
- AT pode aceitar sugestao ou definir manualmente

**B2+:** Sistema pergunta "Perfil de acordo ou precisa atualizar?" Pre-popula do anterior.

### 5.2 Curriculo Original

**O que e:** O curriculo da escola do aluno (BNCC, DCT, livro didatico como Anglo)
**Onde cadastra:** Banco de Curriculos (area global do sistema)
**Como vincula:** Pedagoga seleciona do banco e vincula ao caso do aluno
**Organizado por:** escola/livro + serie + materia + conteudo

### 5.3 Curriculo Adaptado

**Quem faz:** Pedagoga + IA
**Quando:** Apos perfil academico preenchido
**Formato:** 1 documento GLOBAL por bimestre (nao por materia)

**Input pra IA:**
- Perfil academico (scores, nivel, respostas detalhadas)
- Curriculo original da escola (conteudo da serie)
- BNCC (1.304 habilidades codificadas por componente/serie)

**Fluxo:**
1. Pedagoga abre "Criar Curriculo Adaptado"
2. Adiciona materias (vem do curriculo original ou digita)
3. Para cada materia, insere conteudo original (cola do livro/escola)
4. Clica "Gerar com IA" (por materia ou global)
5. IA gera: foco + objetivos + tabela original vs adaptado + habilidades BNCC
6. Pedagoga revisa e salva

**Output por materia:**
- Foco (ex: "Pre-alfabetizacao funcional")
- Objetivos adaptados (mensuraveis, com prazo e % acerto)
- Curriculo Original (o que a turma aprende) vs Curriculo Adaptado (o que o aluno faz)
- Habilidades BNCC selecionadas (codigos)
- Estrategias adaptadas
- **Nivel de adaptacao POR MATERIA** (ex: Portugues N2, Matematica N4) — derivado do curriculo adaptado

**REGRA IMPORTANTE:** O nivel geral do aluno vem do perfil academico (N1-N5). Mas o curriculo adaptado REFINA isso por materia — um aluno N3 geral pode ser N2 em Portugues e N4 em Matematica. Esse nivel por materia e o que dita quais tarefas/atividades serao vinculadas do banco ou geradas pela IA na base teorica.

**5 Niveis de Adaptacao:**
- N1 Leve: mantem curriculo, adapta apresentacao
- N2 Moderado: mantem curriculo, prioriza essenciais
- N3 Significativo: usa conteudo do ano anterior
- N4 Paralelo: curriculo paralelo, distante da serie formal
- N5 Funcional: foco em comunicacao, autonomia, habilidades de vida

### 5.4 Base Teorica (por materia)

**Quem faz:** Pedagoga
**Quando:** Apos curriculo adaptado salvo
**Formato:** 1 por MATERIA por bimestre

**Fluxo:**
1. Pedagoga seleciona materia do curriculo adaptado (ex: Matematica)
2. Sistema busca no Banco de Atividades: tags BNCC + nivel + serie
3. Mostra atividades compativeis existentes
4. Pedagoga seleciona existentes + gera faltantes com IA
5. IA gera atividades com: titulo, enunciado, descricao, habilidade BNCC
6. Total: ~20 atividades por materia
7. Novas atividades salvas no Banco automaticamente

**Base Teorica = documento final pro designer** com as 20 atividades organizadas.

**Atividades com status:**
- pendente (aguardando design)
- em_design
- concluida (link do Canva/PDF adicionado pelo designer)

### 5.5 Apostila

Compilacao das atividades finalizadas (com link) em formato entregavel.
Link da versao final (Canva/Drive) + responsavel + data.

### 5.6 Provas

**Mesmo fluxo das atividades:**
- Pode selecionar prova existente do banco OU gerar com IA
- Tags BNCC vinculadas
- V1 (mensal) e/ou V2 (bimestral) — depende da escola
- Ed. Infantil NAO tem prova
- Designer diagrama → link adicionado
- AT recebe e aplica

**2 cenarios:**
- A) Adequacao da prova original da escola (upload + ajustes)
- B) Prova nova baseada no curriculo adaptado (IA)

### 5.7 Registro Avaliativo

**Quem preenche:** AT (no portal)
**Vinculado a:** aluno + ano + bimestre + materia + tipo prova (V1/V2)
**Campos:** area conhecimento, data, duracao, conteudos, 6 toggles sim/nao com campos condicionais, quem conduziu (AT/professor), upload PDF prova respondida, descricao livre

### 5.8 Fechar Bimestre

**Quem faz:** Coordenadora/pedagoga
**Checklist:** perfil, curriculo, base teorica, atividades com design, provas, registros
**Pode fechar com pendencias** se justificativa assinada (ex: escola nao aplicou prova)
**Ao fechar:** arquiva (read-only), proximo bimestre ja pode estar aberto
**Notifica:** coordenadoras, pedagogas. Familia quando material pronto. AT ve pendencias.

---

## 6. Banco de Atividades

Repositorio inteligente que cresce com uso.

**Cada atividade tem:**
- Titulo, enunciado, descricao
- Habilidade(s) BNCC (tags)
- Materia/componente curricular
- Nivel de adaptacao
- Serie/ano
- Tipo (pareamento, caca-palavras, completar, etc.)
- Link do design (Canva/PDF) quando finalizada
- Status (pendente/concluida)

**Busca por:** BNCC tags + nivel + materia + serie
**Reutilizacao:** ano 1 gera tudo, ano 2 reutiliza 70%, ano 3 quase nao gera

---

## 7. BNCC

1.304 habilidades extraidas do PDF oficial, organizadas por:
- Componente curricular: LP (391), MA (247), HI (151), GE (123), CI (111), LI (88), EF (69), ER (63), AR (61)
- Serie/ano (1o ao 9o)
- Codigo (EF01MA01, EF03HI02, etc.)
- Descricao da habilidade

**Uso no sistema:**
- IA seleciona habilidades compativeis com nivel do aluno
- Tags nas atividades e curriculo adaptado
- Busca no banco de atividades
- Rastreabilidade pedagogica

---

## 8. Banco de Curriculos

Area global pra cadastrar curriculos originais.
**Campos:** origem (BNCC/DCT/livro didatico), nome, etapa, serie, materia, conteudo
**Vinculo:** pedagoga seleciona e vincula ao caso do aluno

---

## 9. Portal AT

Acesso separado, mobile-first.

**Funcionalidades:**
- Ver alunos atribuidos
- Seletor de ano + visao bimestral (B1-B4 com status)
- Preencher/atualizar Perfil Academico (checkboxes/radios completos)
- Registrar Avaliativo (por materia, por prova)
- Solicitar Material (aluno + ano + bimestre + tipo + descricao)
- Ver historico e pendencias

---

## 10. Producao

Fila de producao para designers:
- Solicitacao → Producao Pedagogica → Impressao → Finalizacao → Concluida
- Cada etapa: responsavel, timestamps
- Registro de insumos na finalizacao (folha A4, espiral, plastificacao 0.5, etc.)
- Classificacao: novo, adaptado do acervo, reuso Canva, reuso armario

---

## 11. Pendencias

Auto-geradas baseado nos servicos habilitados do aluno.
- Se servico habilitado e nao preenchido = pendencia
- Pode ser resolvida (preencheu) ou justificada (motivo)
- Tela global com filtros
- Badge no sidebar com contagem

---

## 12. Dashboard

KPIs: materiais produzidos, alunos atendidos, em producao, prazo medio
Fila de producao, equipe trabalhando, consumo insumos
Filtro por periodo

---

## 13. Relatorios

- CAPE (operacional): producao, produtividade, tempo medio
- Insumos: consumo por periodo/paciente
- Paciente (IA): seleciona dados, IA gera relatorio dissertativo (devolutiva familia)

---

## 14. Entregaveis por Bimestre

- Apostila adaptada (atividades diagramadas)
- Provas adaptadas
- Registro avaliativo
- Materiais extras (rotina, cartoes, etc.)

---

## 15. Entregaveis por Ano

- Extrato de materiais (tudo que foi produzido)
- Card da Crianca (perfil ludico: sobre mim, gostos, comunicacao, habilidades)
- Relatorio consolidado (IA, devolutiva familia)

---

## 16. Encerramento

- Aluno continua: promover serie, criar novo caso
- Aluno sai: inativar com historico preservado
- 9o ano: encerrar percurso
- Apostila de ferias (junho e dezembro — material fora do bimestre)

---

## 17. Decisoes Tecnicas

- Schema Supabase: 25+ tabelas no schema 'estimulos'
- Auth: Supabase email/senha, roles no metadata
- Frontend: React + Vite + Shadcn/UI + Tailwind
- IA: pontos mockados (curriculo, base teorica, provas, relatorio)
- BNCC: 1.304 habilidades a serem seeded
- Storage: 3 buckets (exam-files, photos, materials)

---

## 18. Fontes de Validacao

- Reuniao com Sonia (23/03/2026) — transcricao completa
- APP CAPE (documentacao da Sonia) — 20 docs
- Audios/textos Sonia (31/03/2026) — bimestres, provas, fechamento
- Confirmacao Fernando (30/03/2026) — gestao anual, AT bimestral
- Google Forms real — campos detalhados perfil academico
- Doc Rafael Maloney — exemplo real curriculo adaptado
- Doc Projeto de Automacao — spec completa Lovable
- PDF BNCC — 600 paginas, 1.304 habilidades extraidas
- Exemplos reais: perfil Angelo, registros avaliativos, extrato materiais, card Rachel
