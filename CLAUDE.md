# Projeto Estimulos

Sistema de gestao pedagogica para criancas com TDAH/autismo/necessidades especiais.
Cliente: Brinquedoteca Estimulos (Palmas-TO). Empresa: Workflow.

## Identidade na Rede
- **Codename:** `@workflow-estimulus`
- **Papel na rede:** Dev do sistema Estimulos — gestao pedagogica com AI (curriculo, avaliacao, BNCC)
- **Rede:** `~/.docs/PeronalJN/00-Network/` — ver `_PROTOCOL.md` para regras

### Ao iniciar sessao (OBRIGATORIO)
1. Ler `~/.docs/PeronalJN/00-Network/_CONTEXT.md` — estado geral
2. Ler `~/.docs/PeronalJN/00-Network/handoffs/` — tem handoff pra mim?
3. Se relevante: `~/.docs/PeronalJN/00-Network/_FEED.md` (top 20 linhas)

### Ao trabalhar
- Decisao importante → signal em `signals/YYYY-MM-DD/NNN-titulo.md`
- Blocker → signal (type: blocker)
- Aprendizado reutilizavel → `knowledge/titulo.md` + atualizar `knowledge/_INDEX.md`
- Precisa de outro agent → `handoffs/@workflow-estimulus-to-@destino-assunto.md`

### Ao finalizar sessao
1. Append em `~/.docs/PeronalJN/00-Network/_FEED.md` (max 5 linhas):
   `### YYYY-MM-DD HH:MM | @workflow-estimulus | Estimulos`
   `Resumo. Proximo passo.`
2. Se tem trabalho para outro: criar handoff
3. Handoffs recebidos: marcar como `done` quando concluir

## Contexto do Projeto

- Stack: React + TypeScript + Vite + Shadcn/UI + Tailwind + Supabase
- Frontend prototipado (Lovable), sera refeito do zero
- Schema: 19 tabelas, 15 migrations planejadas
- AI: 4 pontos de geracao (curriculo, base teorica, avaliacao, registro)
- BNCC: embeddings pgvector (~1500 habilidades)
- Docs: `docs/ARCHITECTURE.md` tem o plano completo
