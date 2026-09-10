# Especificação de Requisitos – TodoList App

## 1. Introdução

Esta documentação apresenta a especificação técnica da aplicação **TodoList App**, destinada a equipas técnicas envolvidas no desenvolvimento, QA, segurança e formação. O objetivo é fornecer uma referência clara sobre requisitos, casos de uso, modelos de dados, navegação e interfaces, garantindo alinhamento entre todas as áreas envolvidas.

> Nota: esta é uma versão didaticamente vulnerável da aplicação, usada como projeto-base na formação **Segurança e Qualidade em Aplicações Web** — Labanta Academia. As falhas de segurança introduzidas de propósito estão documentadas no `README.md`, não neste documento.

## 2. Descrição da Aplicação

A TodoList App é uma aplicação web para gestão de tarefas pessoais, oferecendo registo e autenticação de utilizadores, operações CRUD de tarefas associadas ao utilizador autenticado, e um conjunto de endpoints REST para acesso programático às tarefas. Os principais ativos contemplam credenciais, dados das tarefas, sessões autenticadas e a base de dados.

* Registo e autenticação de utilizadores
* CRUD de tarefas vinculado ao utilizador
* Gestão de sessões autenticadas
* API REST para acesso programático às tarefas

## 3. Requisitos Funcionais

* RF01: Registo de utilizadores
* RF02: Login e logout
* RF03: Criação de tarefas
* RF04: Listagem de tarefas do utilizador autenticado
* RF05: Visualização dos detalhes de uma tarefa
* RF06: Edição de tarefas
* RF07: Alteração de estado de uma tarefa (Pendente, Concluída)
* RF08: Eliminação de tarefas
* RF09: Acesso programático às tarefas via API REST (`/api/tasks`)

## 4. Casos de Uso

* UC0 – Registar Utilizador: permite criar utilizador com permissões para aceder ao sistema de gestão de tarefas.
* UC1 – Autenticar Utilizador: permite acesso ao sistema mediante credenciais válidas.
* UC2 – Registar tarefa: utilizador autenticado pode registar novas tarefas.
* UC3 – Gerir tarefas: permite gerir as tarefas do utilizador logado:
  * UC3.1 – Ver detalhe da tarefa
  * UC3.2 – Editar tarefa
  * UC3.3 – Alternar estado da tarefa (Pendente, Concluída)
  * UC3.4 – Eliminar tarefa
* UC4 – Consultar/gerir tarefas via API: permite listar, criar, editar e eliminar tarefas por via programática (`/api/tasks`), sem passar pela interface web.
* UC5 – Logout: permite encerrar a sessão e retornar ao ecrã de login.

## 5. Quadro Explicativo dos Casos de Uso

| Caso de Uso | Atores | Pré-condições | Fluxo Principal | Fluxos Alternativos | Pós-condições |
|---|---|---|---|---|---|
| **UC0 – Registar Utilizador** | Utilizador | Aplicação disponível | Preencher formulário → Validar dados → Guardar utilizador | Utilizador existente: exibe erro | Utilizador criado |
| **UC1 – Autenticação** | Utilizador | Utilizador registado | Inserir credenciais → Sistema valida → Cria sessão | Credenciais inválidas: exibe erro | Utilizador autenticado, sessão criada |
| **UC2 – Registar tarefa** | Utilizador autenticado | Sessão ativa | Preencher formulário (título, descrição) → Validar dados → Guardar tarefa | Título em branco: exibe erro de validação | Tarefa criada e vinculada ao utilizador |
| **UC3 – Gerir tarefas** | Utilizador autenticado | Sessão ativa | Solicitar lista → Exibir tarefas | Sem tarefas: exibe lista vazia | Lista apresentada |
| **UC3.1 – Ver detalhe** | Utilizador autenticado | Tarefa existe | Selecionar tarefa → Exibir dados completos | Tarefa inexistente: ecrã "não encontrada" | Detalhes apresentados |
| **UC3.2 – Editar tarefa** | Utilizador autenticado | Tarefa existe | Selecionar tarefa → Modificar dados → Validar → Guardar | Dados inválidos: exibe erro | Tarefa atualizada |
| **UC3.3 – Alternar estado** | Utilizador autenticado | Tarefa existe | Selecionar tarefa → Alternar estado | — | Tarefa atualizada (Pendente ⇄ Concluída) |
| **UC3.4 – Eliminar tarefa** | Utilizador autenticado | Tarefa existe | Selecionar tarefa → Confirmar → Eliminar | — | Tarefa removida |
| **UC4 – API REST** | Cliente HTTP (Postman, curl, outro serviço) | Endpoint acessível | Pedido HTTP (GET/POST/PUT/DELETE) → Sistema processa → Devolve JSON | Recurso inexistente: 404 | Estado das tarefas alterado/consultado |
| **UC5 – Logout** | Utilizador autenticado | Sessão ativa | Sair → Encerrar sessão | — | Ecrã de login apresentado |

## 6. Dicionário de Dados

**Tabela `users`**

| Campo | Tipo | Descrição |
|---|---|---|
| id | SERIAL (PK) | Identificador único do utilizador |
| username | VARCHAR(50), único | Nome de utilizador usado no login |
| password_hash | VARCHAR(100) | Password do utilizador |
| created_at | TIMESTAMP | Data de criação da conta |

**Tabela `tasks`**

| Campo | Tipo | Descrição |
|---|---|---|
| id | SERIAL (PK) | Identificador único da tarefa |
| owner_id | INTEGER (FK → users.id) | Utilizador dono da tarefa |
| title | VARCHAR(200) | Título da tarefa |
| description | TEXT | Descrição opcional da tarefa |
| is_done | BOOLEAN | Estado da tarefa (Pendente / Concluída) |
| created_at | TIMESTAMP | Data de criação da tarefa |

## 7. Navegação da Aplicação

* **Ecrã de Registo** — criação de nova conta de utilizador.
* **Ecrã de Login** — utilizador insere credenciais para aceder ao sistema.
* **Ecrã Principal (Lista de Tarefas)** — exibe as tarefas, com formulário para adicionar uma nova.
* **Ecrã de Detalhe da Tarefa** — apresenta os dados completos de uma tarefa e as ações disponíveis.
* **Ecrã de Edição de Tarefa** — formulário para alterar título e descrição de uma tarefa existente.

Fluxo: após o login, o utilizador é redirecionado para a lista de tarefas, podendo navegar para ver detalhes, editar, concluir/reabrir ou apagar tarefas, e para criar novas.

## 8. Desenho das Interfaces

### 1. Login
Campos: Utilizador, Password.
Botão: Entrar.
Link: Criar conta (para o registo).

### 2. Registo
Campos: Utilizador, Password.
Botão: Registar.
Link: Entrar (para quem já tem conta).

### 3. Lista de Tarefas
Formulário no topo: Título, Descrição, botão Adicionar.
Lista de tarefas, cada uma mostrando: título, descrição, estado (badge Pendente/Concluída), dono da tarefa, e ações — Ver detalhes, Editar, Concluir/Reabrir, Apagar.

### 4. Detalhe da Tarefa
Mostra: título, estado, dono, descrição, data de criação, identificador.
Ações: Editar, Concluir/Reabrir, Apagar.

### 5. Edição de Tarefa
Campos: Título, Descrição.
Botão: Guardar alterações.

## 9. API REST (interna)

Endpoints expostos em `/api`, pensados para integração programática com as tarefas. Atualmente **sem autenticação** — mantidos assim de propósito, para serem protegidos com JWT numa sessão futura do curso (ver `README.md`).

| Método | Endpoint | Descrição | Corpo do pedido |
|---|---|---|---|
| GET | `/api/tasks` | Lista todas as tarefas | — |
| GET | `/api/tasks/:id` | Devolve uma tarefa pelo id | — |
| POST | `/api/tasks` | Cria uma nova tarefa | `{ ownerId, title, description }` |
| PUT | `/api/tasks/:id` | Atualiza título e descrição de uma tarefa | `{ title, description }` |
| DELETE | `/api/tasks/:id` | Elimina uma tarefa | — |

## 10. Stack Tecnológica

Node.js · Express · PostgreSQL (driver `pg`, sem ORM) · EJS · express-session · Bootstrap 5.
