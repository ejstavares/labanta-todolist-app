
# Git Operations (Guia Prático)

**Curso:** Desenvolvimento de Aplicações Web Full-Stack · **Módulo:** MF4 · **Unidade:** UF4.2 — Segurança e Qualidade em Aplicações Web
**Sessão:** 2 · Setup e Fluxo de Trabalho no GitHub
**Formador:** Ederlino Tavares · **Edição:** 2025/2026-A

Este guia tem como objetivo capacitar os formandos a utilizar o Git de forma autónoma, segura e alinhada com boas práticas de desenvolvimento seguro de software, usando o repositório da **TodoList App** como caso prático.

## Índice

1. [Objetivos da Sessão](#-objetivos-da-sessão)
2. [O que é Git](#1️⃣-o-que-é-git)
3. [Git vs GitHub vs GitLab](#2️⃣-git-vs-github-vs-gitlab)
4. [Git e DevSecOps](#3️⃣-papel-do-git-no-desenvolvimento-seguro)
5. [Configuração Inicial](#4️⃣-configuração-inicial-do-git)
6. [Criar ou Clonar Repositório](#5️⃣-criar-ou-clonar-um-repositório-existente)
7. [Estado do Repositório](#6️⃣-estado-do-repositório)
8. [Adicionar Ficheiros](#7️⃣-adicionar-ficheiros-stage)
9. [Commit](#8️⃣-commit--guardar-alterações-localmente)
10. [Branches](#9️⃣-branches-ramificações)
11. [Atualizar e Enviar Código](#🔟-atualizar-e-enviar-código)
12. [Merge de Branches](#1️⃣1️⃣-merge-de-branches)
13. [Conflitos](#1️⃣2️⃣-resolução-básica-de-conflitos)
14. [Gitignore](#1️⃣3️⃣-ficheiro-gitignore)
15. [Boas Práticas de Segurança](#1️⃣4️⃣-git-e-boas-práticas-de-segurança)
16. [Fluxo de Trabalho](#1️⃣5️⃣-fluxo-de-trabalho-recomendado)
17. [Documentação Relevante](#documentação-relevante)
18. [Nota](#nota)
19. [Conclusão](#conclusão)

---

## Objetivos da Sessão

No final desta sessão, o formando deverá ser capaz de:

* compreender o que é Git e para que serve
* diferenciar Git de GitHub e GitLab
* compreender o papel do Git no desenvolvimento moderno e seguro
* usar Git no dia a dia (comandos essenciais)
* colaborar em equipa com segurança
* compreender como Git se integra num fluxo DevSecOps

---

## 1️⃣ O que é Git?

O **Git** é um **sistema de controlo de versões distribuído**, utilizado para:

* controlar alterações no código-fonte
* manter histórico de versões
* facilitar trabalho em equipa
* permitir auditoria e rastreabilidade

O Git funciona localmente, mesmo sem ligação à internet.

**Docs:** [https://git-scm.com/doc](https://git-scm.com/doc)

---

## 2️⃣ Git vs GitHub vs GitLab

### GitHub e GitLab têm a mesma função?

**Sim, em essência**: ambos são **plataformas de repositórios Git**.

|            | Função principal    | Tipo             |
| ---------- | ------------------- | ----------------------- |
| **Git**    | Controlo de versões | Ferramenta        |
| **GitHub/GitLab** | Repositório remoto + colaboração  | Plataformas |

**Docs:**
* GitHub: [https://docs.github.com](https://docs.github.com)
* GitLab: [https://docs.gitlab.com](https://docs.gitlab.com)

---

## 3️⃣ Papel do Git no desenvolvimento seguro

O Git contribui para a segurança porque:

* mantém histórico completo de alterações
* facilita revisão de código (Pull / Merge Requests)
* permite auditorias técnicas
* integra-se com ferramentas de segurança:
* SAST (ex.: SonarQube)
* análise de dependências
* pipelines CI/CD
* controlo de acessos

---

## 4️⃣ Configuração inicial do Git
Verificar versão:
```bash
git -v
```

Listar configurações globais do Git `~/.gitconfig`:
```bash
git config --list
```

Configurar nome e email:
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

---

## 5️⃣ Criar ou clonar um repositório existente

Iniciar repositório:
```bash
git init
```

Clonar o repositório da TodoList App:
```bash
git clone https://github.com/ejstavares/labanta-todolist-app.git
```
---

## 6️⃣ Estado do repositório

```bash
git status
```
Mostra:
* ficheiros modificados
* ficheiros novos
* ficheiros prontos para commit
---

## 7️⃣ Adicionar ficheiros (stage)

> Antes, criar o ficheiro na raiz do projeto: `your_name.txt`

Adicionar ficheiro específico:
```bash
git add your_name.txt
```

Adicionar todos:
```bash
git add .
```

`git add` **não envia** código, apenas prepara para commit.

---

## 8️⃣ Commit – guardar alterações **localmente**

```bash
git commit -m "Descrição clara da alteração"
```
**Boas práticas de commit:**
* mensagens curtas e objetivas
* usar verbo no presente (ex.: adiciona, corrige)
* evitar commits grandes

❌ Mau:
```bash
commit 01
alter
commit final
```

✅ Bom:
```bash
corrige validação de formulário
exclui ficheiros de cache no gitignore
```

**Exercicio:** Passar para o tópico seguinte ```branches``` de seguida completar o exercício de ```commits```.
---

## 9️⃣ Branches (ramificações)
Branch: uma ramificação do repositório. Cada ramificação pode ter um nome, com um histórico de alterações, e um ponteiro para o repositório principal.

Listar branches
```bash
git branch
```
Criar branch
```bash
git branch you-name
```
Mudar de branch
```bash
git checkout you-name
```

**Boa prática:**\
Nunca desenvolver diretamente na branch `main` / `master`.


**Exercicio do commit:** criar commits com mensagens claras e objetivas, a escolha do formando.

---

## 🔟 Atualizar e enviar código

Enviar branch para remoto
```bash
git push origin you-name
```

Atualizar branch local
```bash
git pull origin you-name
```

---

## 1️⃣1️⃣ Merge de Branches
**Juntar código de uma branch noutra**.

Exemplo:

```bash
git checkout main
git pull
git merge you-name
git status
git push
```

“Trazer o trabalho feito em branch `you-name` para a branch `main`.”

---

## 1️⃣2️⃣ Resolução básica de conflitos

Conflitos surgem quando:
* Quando duas alterações afetam a mesma linha.

### Como resolver:

1. Git sinaliza conflito `<<<<<<<`, `=======`, `>>>>>>>`
2. Editar ficheiro manualmente
3. Escolher código correto
4. Remover marcas `<<<<<<<`, `=======`, `>>>>>>>`
4. Commit

***Exercicio:***
1 - Mudar de branch
```bash
git checkout you-name
```
2 - Alterar ficheiro your_name.txt na linha 1, diretamente no GitHub a partir do branch you-name
3 - Voltar para o editor de código e alterar ficheiro your_name.txt na mesma linha, para testar a resolução de conflito.
4 - Enviar para o GitHub:
```bash
git add your_name.txt
git commit -m "modificação de your_name.txt no editor"
git pull origin you-name
git config pull.rebase false ### desligar rebase e forçar merge, em caso de erro no ```pull``` e tentar ```pull``` novamente.
```
5 - Voltar para o editor e alterar ficheiro your_name.txt na linha 1, para testar novamente a resolução de conflito.
6 - Enviar para o GitHub:
```bash
git add your_name.txt
git commit -m "resolução de conflito de your_name.txt no editor"
git push origin you-name
```
---

## 1️⃣3️⃣ Ficheiro `.gitignore`
Serve para ignorar ficheiros sensíveis ou desnecessários.

Exemplo comuns num projeto Node.js:
```gitignore
.env
node_modules/
*.log
npm-debug.log*
```

> Confirma no repositório da TodoList App que o `.gitignore` já cobre `.env` e `node_modules/` — é aqui que vivem as credenciais da base de dados e o `SESSION_SECRET`, que nunca devem ser versionados.

---

## 1️⃣4️⃣ Git e Boas Práticas de Segurança

### Recomendado
* usar branches (ramificação)
* commits pequenos
* usar CI/CD para validações automáticas

### Não versionar segredos
Nunca versionar:
* passwords
* tokens
* ficheiros `.env`

### Revisão de código

* Outro programador analisa o código antes do merge.

*Benefícios:*
* reduz bugs
* melhora qualidade
* aumenta segurança

### Proteger branch principal

Significa:

* não permitir commits diretos em `main`
* obrigar Pull/Merge Request
* exigir revisão e pipeline

---

## 1️⃣5️⃣ Fluxo de trabalho recomendado

### Fluxo típico após `git clone`:

1. Criar branch
2. Desenvolver
3. Commit
4. Push
5. Pull Request
6. Merge Request
7. Revisão de código
8. Merge

---

## Documentação Relevante

* Git: [https://git-scm.com/doc](https://git-scm.com/doc)
* GitHub: [https://docs.github.com](https://docs.github.com)
* GitLab: [https://docs.gitlab.com](https://docs.gitlab.com)
* DevSecOps (GitLab): [https://about.gitlab.com/topics/devsecops/](https://about.gitlab.com/topics/devsecops/)
* Repositório da TodoList App: [https://github.com/ejstavares/labanta-todolist-app](https://github.com/ejstavares/labanta-todolist-app)

---

## Nota:

Este README serve como:

* guia de formação
* material de apoio
* referência pós-formação

---
## Conclusão

O Git é uma ferramenta fundamental no desenvolvimento moderno.
Dominar Git é requisito básico para:
* trabalho em equipa
* segurança
* qualidade de código
* DevSecOps
