# TaskShield

Aplicação de gestão de tarefas (TodoList) usada como exercício prático na formação **Segurança e Qualidade em Aplicações Web** — Labanta Academia.

## ⚠️ Aviso de Segurança

Este repositório contém, **de propósito**, falhas de segurança graves (SQL Injection, passwords em texto simples, controlo de acessos quebrado), para fins exclusivos de formação em Desenvolvimento Seguro de Software.

**Não:**
- fazer deploy desta versão em produção;
- usar dados reais (passwords, emails) ao testar;
- reutilizar estes padrões de código fora deste exercício.

Este código será corrigido progressivamente, sessão a sessão, ao longo da formação.

## Stack

Node.js + Express + PostgreSQL (driver `pg`, sem ORM) + EJS + Bootstrap.

## Instalação

```bash
npm install
```

Cria um ficheiro `.env` a partir de `.env.example` e ajusta as variáveis.

Cria a base de dados e corre o `schema.sql`:

```bash
docker exec -i pg-todolist psql -U postgres -d todolist < schema.sql
```

## Arrancar em desenvolvimento

```bash
npm run dev
```

Abre `http://localhost:3000`.
