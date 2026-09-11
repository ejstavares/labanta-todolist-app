# Docker Basics — TodoList App (Guia Prático)

Este guia tem como objetivo capacitar os formandos a **compreender Docker desde os conceitos fundamentais até à criação e distribuição de uma imagem própria**, usando sempre como exemplo a aplicação **TodoList App** (Node.js + Express + PostgreSQL) usada ao longo da formação.

---

## Índice

1. [O que é Docker](#1️⃣-o-que-é-docker)
2. [Docker vs Máquina Virtual (VM)](#2️⃣-docker-vs-máquina-virtual-vm)
3. [Conceitos Essenciais do Docker](#3️⃣-conceitos-essenciais-do-docker)
4. [Arquitetura Docker](#4️⃣-arquitetura-docker)
5. [Instalação do Docker](#5️⃣-instalação-do-docker)
6. [Comandos Docker Básicos](#6️⃣-comandos-docker-básicos)
7. [Trabalhar com Containers (`docker run`)](#7️⃣-trabalhar-com-containers-docker-run)
8. [Volumes](#8️⃣-volumes)
9. [Redes Docker](#9️⃣-redes-docker)
10. [Docker Compose (uso prático)](#🔟-docker-compose-uso-prático)
11. [Dockerfile (definição da imagem)](#1️⃣1️⃣-dockerfile-definição-da-imagem)
12. [Docker Build (criar a imagem)](#1️⃣2️⃣-docker-build-criar-a-imagem)
13. [Docker Registry (armazenar a imagem)](#1️⃣3️⃣-docker-registry-armazenar-a-imagem)
14. [Docker e Segurança](#1️⃣4️⃣-docker-e-segurança)
15. [Exercícios Práticos](#-exercícios-práticos)
16. [Documentação Oficial](#-documentação-oficial)

---

## 1️⃣ O que é Docker?

O **Docker** é uma plataforma que permite **empacotar e executar aplicações em containers**.

Um container inclui:

* a aplicação
* as dependências
* as bibliotecas necessárias
* configurações básicas

O objetivo principal do Docker é garantir que:

> *"A aplicação funciona da mesma forma em qualquer ambiente."*

Docker **não é uma máquina virtual**.

**No TodoList App:** desde a Sessão 1 já usamos Docker sem lhe chamar por esse nome — o contentor `todolist-db` é onde corre o PostgreSQL. A partir de agora vamos também colocar a própria aplicação Node.js dentro de um container.

Documentação: [https://docs.docker.com/get-started/](https://docs.docker.com/get-started/)

---

## 2️⃣ Docker vs Máquina Virtual (VM)

| Docker              | Máquina Virtual (VM) |
| --------------------| ---------------- |
| Partilha kernel com o host  | Possui Kernel próprio |
| Executa aplicações isoladas | Executa um sistema operativo completo |
| Arranque Rápido           | Arranque Lento            |
| Muito mais Leve             |  Pesada - Consome mais recursos (CPU, RAM, disco) |
| Isola aplicações | Isola SO inteiro |

| |  | |
|---------------------| ---- | ----------------------|
| ![Docker](https://docker.com/app/uploads/2021/11/docker-containerized-appliction-blue-border_2.png) | VS |  ![VM](https://www.docker.com/app/uploads/2021/11/container-vm-whatcontainer_2.png) |

**Simples e Direta:**
> VM virtualiza o sistema operativo\
> Docker virtualiza a aplicação

---

## 3️⃣ Conceitos Essenciais do Docker

### Imagem

* É um **modelo (template)** da aplicação
* É imutável (read-only)
* Serve de base para criar containers

Exemplos usados no TodoList App:

```text
node:20-slim
postgres:16
```

---

### Container

* É uma **imagem em execução**
* Pode ser iniciado, parado ou removido
* Não guarda dados permanentemente

Se o container for removido, os dados internos perdem-se — é por isto que o `todolist-db` criado na Sessão 1 perde as tarefas sempre que é removido e recriado sem volume.

---

### Volume

* Mecanismo de **persistência de dados**
* Os dados sobrevivem à remoção do container
* Usado para bases de dados, uploads, logs

**No TodoList App:** vamos corrigir isto nesta sessão — o `todolist-db` vai passar a usar um volume, para as tarefas não se perderem sempre que o container for reiniciado.

---

### Rede

* Permite comunicação entre containers
* Containers na mesma rede comunicam-se pelo `nome` ou `container_id`

Exemplo no TodoList App:

```text
todolist-app → todolist-db:5432
```

---

## 4️⃣ Arquitetura Docker

O Docker utiliza uma arquitetura `cliente–servidor`.
O cliente `docker` envia comandos e o `daemon Docker` é responsável por `construir, executar e gerir os containers`.

O `cliente` e o `daemon` podem estar:
- no mesmo sistema, ou
- em sistemas diferentes (daemon remoto)

A comunicação entre eles é feita através de:
- API REST
- sockets UNIX
- rede

O **Docker Compose** é outro `cliente` Docker, utilizado para gerir aplicações compostas por vários containers.

![Arquitetura](https://docs.docker.com/get-started/images/docker-architecture.webp)

---

## 5️⃣ Instalação do Docker

### Windows / macOS

Docker Desktop:
[https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)

### Linux / WSL2

[https://docs.docker.com/engine/install/](https://docs.docker.com/engine/install/)

Verificar instalação (já confirmado no Exercício 1 da Sessão 1):

```bash
docker --version
docker compose version
```

---

## 6️⃣ Comandos Docker Básicos

```bash
docker pull postgres
docker push todolist-app:0.0.0
docker images
docker run
docker ps
docker ps -a
docker logs
docker stop container_id
docker rm container_id
docker build
docker volume
docker network
docker compose
```

---

## 7️⃣ Trabalhar com Containers (`docker run`)

Executar um container simples:

```bash
docker run postgres
```

Executar com porta exposta — é exatamente o comando usado no Exercício 3 da Sessão 1 para pôr a base de dados a correr:

```bash
docker run --name todolist-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```

Ver logs:

```bash
docker logs todolist-db
```

Aceder ao container (linha de comandos dentro do container):

```bash
docker exec -it todolist-db sh
```

Aceder diretamente ao PostgreSQL dentro do container:

```bash
docker exec -it todolist-db psql -U postgres
```

---

## 8️⃣ Volumes

Criar volume para os dados do PostgreSQL:

```bash
docker volume create todolist-db-data
```

Recriar o `todolist-db` já com o volume associado (agora as tarefas sobrevivem a um `docker rm`):

```bash
docker run --name todolist-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -v todolist-db-data:/var/lib/postgresql/data -d postgres
```

Volumes garantem persistência de dados.

---

## 9️⃣ Redes Docker

Listar redes:

```bash
docker network ls
```

Criar rede:

```bash
docker network create todolist-network
```

Usar rede (base de dados):

```bash
docker run --name todolist-db --network todolist-network -e POSTGRES_PASSWORD=postgres -v todolist-db-data:/var/lib/postgresql/data -d postgres
```

Depois de a aplicação também correr num container na mesma rede (ver secção 12), a `DATABASE_URL` deixa de apontar para `localhost` e passa a apontar para o nome do container: `postgres://postgres:postgres@todolist-db:5432/...`.

Comunicação entre containers depende da rede Docker.

---

## 🔟 Docker Compose (uso prático)

O **Docker Compose** permite executar **vários containers em conjunto** — neste caso, a aplicação Node.js e a base de dados PostgreSQL — ideal para desenvolvimento local.

`docker-compose.yml` na raiz do TodoList App:

```yaml
services:
  web:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    environment:
      DATABASE_URL: postgres://postgres:postgres@db:5432/todolist_js
    depends_on:
      - db

  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: todolist_js
    ports:
      - "5432:5432"
    volumes:
      - todolist-db-data:/var/lib/postgresql/data
      - ./schema.sql:/docker-entrypoint-initdb.d/schema.sql

volumes:
  todolist-db-data:
```

Notas:
* `depends_on` garante que o container `db` arranca antes do `web`, mas **não espera que o PostgreSQL esteja pronto** para aceitar ligações — se a app falhar a ligar na primeira tentativa, corrigir isso com uma política de reintentos é um exercício interessante para além desta sessão.
* montar `schema.sql` em `/docker-entrypoint-initdb.d/` faz o PostgreSQL correr esse script automaticamente **só na primeira vez** que o volume é criado — deixa de ser preciso o `docker exec ... psql ... < schema.sql` manual.

Executar:

```bash
docker compose up -d
docker compose logs -f
docker compose down
```

Neste ponto, o `web` já está a usar a imagem construída a partir do `Dockerfile` (secção seguinte) — não é uma imagem existente do Docker Hub.

[https://docs.docker.com/compose/](https://docs.docker.com/compose/)

---

## 1️⃣1️⃣ Dockerfile (definição da imagem)

O **Dockerfile** é um ficheiro de texto que define **como uma imagem deve ser construída**. Cria-se na raiz do TodoList App.

```dockerfile
# Imagem base: Node.js LTS, versão "slim" para uma imagem mais leve
FROM node:20-slim

# Diretório de trabalho dentro do container
WORKDIR /app

# Copiar primeiro só os ficheiros de dependências, para aproveitar a cache do Docker
COPY package*.json ./

# Instalar dependências de produção
RUN npm ci --omit=dev

# Copiar o resto do código da aplicação
COPY . .

# Porta em que a app Express corre (ver .env.example: PORT=3000)
EXPOSE 3000

# Comando para arrancar a aplicação
CMD ["node", "src/app.js"]
```

Cria-se também um `.dockerignore`, para não copiar ficheiros desnecessários (ou sensíveis) para dentro da imagem:

```text
node_modules
.env
.git
```

O Dockerfile **descreve a imagem**, mas ainda não a cria.

---

## 1️⃣2️⃣ Docker Build (criar a imagem)

Após criar o Dockerfile, usamos `docker build` para **criar a imagem**.

Sem este passo, não existe imagem própria.

```bash
docker build -t todolist-app:0.0.0 .
```

Ver imagens criadas:

```bash
docker images
```

Executar a imagem criada (a app precisa da rede `todolist-network` para falar com o `todolist-db`):

```bash
docker run --rm --name todolist-app -p 3000:3000 --network todolist-network --env-file .env todolist-app:0.0.0
```

Alterar o container em execução, copiando um ficheiro para dentro dele (ex.: o rodapé das páginas):

```bash
docker cp views/partials/footer.ejs todolist-app:/app/views/partials/footer.ejs
```

Reiniciar o container e verificar a alteração:

```bash
docker restart todolist-app
```

Eliminar o container e voltar a executar a imagem criada, para ver que a alteração feita com `docker cp` desapareceu (porque não foi mapeado volume, só copiada para dentro do container em execução):

```bash
docker rm -f todolist-app
docker run --rm --name todolist-app -p 3000:3000 --network todolist-network --env-file .env todolist-app:0.0.0
```

Executar a imagem mapeando o código como volume (útil em desenvolvimento, para ver alterações sem reconstruir a imagem a cada mudança):

```bash
docker run --rm --name todolist-app -p 3000:3000 --network todolist-network --env-file .env -v $(pwd):/app todolist-app:0.0.0
```

---

## 1️⃣3️⃣ Docker Registry (armazenar a imagem)

Depois de criada, a imagem deve ser **armazenada num Docker Registry**.

Um **Docker Registry** é um **repositório de imagens Docker**, usado para:
* armazenar imagens
* versionar imagens
* partilhar imagens entre equipas e ambientes
* integrar com CI/CD
* *Um registry é para imagens o que o GitHub ou GitLab é para código.*

Sempre que executas `docker pull`, estás a descarregar uma imagem de um **registry**.

**Doc:** [https://docs.docker.com/registry/](https://docs.docker.com/registry/)

### Exemplos de registries (público)

* Docker Hub (registry padrão do Docker): [https://hub.docker.com](https://hub.docker.com)
* GitHub Container Registry
* GitLab Container Registry

**Limitações:**

* limites de imagens privados
* limites de build (CI/CD)
* não recomendado para ambientes corporativos sensíveis

### Docker Registry em ambientes corporativos (Privado)

Em empresas e projetos institucionais, é comum usar **registries privados**, por razões de:

* segurança
* controlo de acesso
* soberania dos dados
* integração com CI/CD
* ambientes on-premise/controlado

Open-source / on-premise (recomendado para instituições): Harbor, Docker Registry (`registry:2`), GitLab Container Registry (self-hosted), Quay (Red Hat).

#### Exercício: publicar a imagem do TodoList App num registry público

* Criar conta em Docker Hub: [https://hub.docker.com](https://hub.docker.com)
* Criar repositório no Docker Hub (ex.: `todolist-app`)
* Efetuar login no Docker Hub no terminal (requer `token` de acesso ao repositório no Docker Hub)
* Criar `tag` da imagem criada:

```bash
docker tag todolist-app:0.0.0 your_username/todolist-app:0.0.0
```

* Push para registry:

```bash
docker push your_username/todolist-app:0.0.0
```

* Remover imagem local:

```bash
docker rmi your_username/todolist-app:0.0.0
```

* Testar pull da imagem:

```bash
docker pull your_username/todolist-app:0.0.0
```

#### Exemplo de registry local

```bash
docker run --name=registry2 -d -p 5001:5000 \
  --network todolist-network \
  -e REGISTRY_HTTP_HEADERS_Access-Control-Allow-Origin="['http://localhost:8083']" \
  -e REGISTRY_HTTP_HEADERS_Access-Control-Allow-Methods='[HEAD,GET,OPTIONS,DELETE]' \
  -e REGISTRY_HTTP_HEADERS_Access-Control-Allow-Headers='[Authorization,Accept,Cache-Control]' \
  -e REGISTRY_HTTP_HEADERS_Access-Control-Expose-Headers='[Docker-Content-Digest]' \
  -e REGISTRY_HTTP_HEADERS_Access-Control-Allow-Credentials='[true]' \
  -e REGISTRY_STORAGE_DELETE_ENABLED='true' \
  registry:2
```

Push:

```bash
docker tag todolist-app:0.0.0 localhost:5001/todolist-app:1.0
docker push localhost:5001/todolist-app:1.0
docker pull localhost:5001/todolist-app:1.0
```

Listar imagens no registry local:

```bash
curl http://localhost:5001/v2/_catalog
```

Resposta:

```bash
{
  "repositories": [
    "todolist-app"
  ]
}
```

Listar tags de uma imagem:

```bash
http://localhost:5001/v2/todolist-app/tags/list
```

Docker Registry UI (joxit):

```bash
docker run --rm --name=registry-ui -d \
  -p 8080:80 \
  --network todolist-network \
  -e REGISTRY_TITLE="Local Docker Registry" \
  -e REGISTRY_URL=http://localhost:5001 \
  joxit/docker-registry-ui
```

Aceder registry UI na porta `8080`: http://localhost:8080

---

## 1️⃣4️⃣ Docker e Segurança

Boas práticas:

* utilizar imagens oficiais (`node`, `postgres`)
* evitar `latest`
* utilizar `.env` para segredos, e nunca copiar o `.env` para dentro da imagem (ver `.dockerignore`)
* scan de imagens (Trivy, Snyk)
* utilizar registries privados
* autenticação e autorização
* versionar imagens (`:0.0.0`, `:0.1.0`, nunca só `latest`)
* restringir quem pode fazer `push`
* correr o processo dentro do container com um utilizador não-`root` sempre que possível

Em ambientes DevSecOps, **a imagem também é código** — e por isso também passa por SAST/SCA, tal como o resto do TodoList App (ver Sessões 5–6).

[https://docs.docker.com/engine/security/](https://docs.docker.com/engine/security/)

---

## Exercícios Práticos

1. Recriar o `todolist-db` com volume (`todolist-db-data`), confirmar que os dados sobrevivem a um `docker rm`
2. Criar a rede `todolist-network` e ligar o `todolist-db` a ela
3. Escrever o `Dockerfile` do TodoList App
4. Construir a imagem com `docker build` e correr a app em container, ligada ao `todolist-db` pela rede
5. Subir a app + base de dados em conjunto com `docker compose up`
6. Push da imagem para um registry (local ou Docker Hub)

---

## Documentação Oficial

* Docker: [https://docs.docker.com](https://docs.docker.com)
* Dockerfile: [https://docs.docker.com/engine/reference/builder/](https://docs.docker.com/engine/reference/builder/)
* Docker Compose: [https://docs.docker.com/compose/](https://docs.docker.com/compose/)
* Docker Registry: [https://docs.docker.com/registry/](https://docs.docker.com/registry/)
* Node.js Docker (imagem oficial): [https://hub.docker.com/_/node](https://hub.docker.com/_/node)
* Harbor: [https://goharbor.io/docs/](https://goharbor.io/docs/)
* GitHub Container Registry: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry
* GitLab Registry: https://docs.gitlab.com/ee/user/packages/container_registry/

---

## Nota Final

Este README serve como:

* guia de formação
* material de apoio
* referência prática pós-formação
