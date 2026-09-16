# SonarQube SAST (Guia Prático) — TodoList App

Guia rápido para levantar o **SonarQube + Postgres via Docker Compose** (ficheiro `docker-compose.sonar.yml`, na raiz do projeto) e executar uma análise **SAST** ao TodoList App com o `sonar-scanner` em contentor. Tudo em português e orientado a passos.

---

## Índice

1. [O que é SonarQube e SAST](#1️⃣-o-que-é-sonarqube-e-sast)
2. [Componentes do docker-compose](#2️⃣-componentes-do-docker-compose)
3. [Pré-requisitos](#3️⃣-pré-requisitos)
4. [Preparar variáveis (.env.sonar)](#4️⃣-preparar-variáveis-envsonar)
5. [Subir o stack com Docker Compose](#5️⃣-subir-o-stack-com-docker-compose)
6. [Primeiro acesso e configuração inicial](#6️⃣-primeiro-acesso-e-configuração-inicial)
7. [Criar projeto](#7️⃣-criar-projeto)
8. [Executar análise SAST com sonar-scanner (Docker)](#8️⃣-executar-análise-sast-com-sonar-scanner-docker)
9. [Parar, limpar e recomeçar](#9️⃣-parar-limpar-e-recomeçar)
10. [Resolução de problemas](#🔟-resolução-de-problemas)
11. [Referências oficiais](#1️⃣1️⃣-referências-oficiais)

---

## 1️⃣ O que é SonarQube e SAST

* **SAST** (Static Application Security Testing): análise de código-fonte sem executar a aplicação, detectando vulnerabilidades cedo no ciclo de desenvolvimento.
* **SonarQube**: plataforma para inspeção contínua de qualidade e segurança de código (bugs, code smells, vulnerabilidades, hotspots de segurança).

Objetivo deste guia: levantar o SonarQube localmente com Postgres e executar uma análise SAST ao **TodoList App** (Node.js/Express) usando o `sonar-scanner` em contentor. Como o código ainda tem vulnerabilidades introduzidas nas sessões anteriores por corrigir (SQL Injection por concatenação em `src/routes/tasks.js` e `src/routes/api.js`, entre outras), é um bom caso real para ver o que o SonarQube consegue — e não consegue — detetar sozinho.

---

## 2️⃣ Componentes do docker-compose

Ficheiro: `docker-compose.sonar.yml` (na raiz do repositório `todolist-app/`, separado do `docker-compose.yml` da própria aplicação).

Serviços definidos:

* **sonarqube**
  * Imagem: `sonarqube:26.1.0.118079-community`
  * Porta exposta: `9000:9000`
  * `SONAR_ES_BOOTSTRAP_CHECKS_DISABLE: true` — o SonarQube usa Elasticsearch por baixo, que normalmente exige um valor mínimo de `vm.max_map_count` no sistema operativo do host. Esta variável desativa essa verificação para simplificar o arranque em ambiente de curso (ver secção de resolução de problemas se, ainda assim, o contentor falhar por causa disto).
  * Variáveis de BD: `SONAR_JDBC_URL`, `SONAR_JDBC_USERNAME`, `SONAR_JDBC_PASSWORD` — com valores por omissão já definidos no `docker-compose.sonar.yml`, mas podes sobrepor num ficheiro `.env.sonar`.
  * Volumes: `sonarqube_data`, `sonarqube_extensions`, `sonarqube_logs`
  * Rede externa: `sonarqube-network` (não é criada pelo Compose — precisamos de a criar antes, se ainda não existir: `docker network create sonarqube-network`)

* **sonarqube-db**
  * Imagem: `postgres:16`
  * Variáveis: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` (por omissão: `postgres` / `postgres` / `sonar_db`)
  * Volume: `sonarqube-db_data`
  * **Nota:** esta base de dados é só para o SonarQube guardar os seus próprios dados (projetos, análises, utilizadores) — não tem nada a ver com o `todolist-db` da aplicação. Convém não confundir os dois.

**Rede externa**: `sonarqube-network` (não é criada pelo Compose, precisamos de a criar antes de subir o stack).

`docker-compose.sonar.yml`:
```yaml
services:
  sonarqube:
    image: sonarqube:26.1.0.118079-community
    container_name: sonarqube
    ports:
      - "9000:9000"
    environment:
      SONAR_ES_BOOTSTRAP_CHECKS_DISABLE: true
      SONAR_JDBC_URL: ${SONAR_JDBC_URL:-jdbc:postgresql://sonarqube-db:5432/${POSTGRES_DB:-sonar_db}}
      SONAR_JDBC_USERNAME: ${SONAR_JDBC_USERNAME:-postgres}
      SONAR_JDBC_PASSWORD: ${SONAR_JDBC_PASSWORD:-postgres}
    volumes:
      - sonarqube_data:/opt/sonarqube/data
      - sonarqube_extensions:/opt/sonarqube/extensions
      - sonarqube_logs:/opt/sonarqube/logs
    networks:
      - sonarqube-network
    depends_on:
      - sonarqube-db

  sonarqube-db:
    image: postgres:16
    container_name: sonarqube-db
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${POSTGRES_DB:-sonar_db}
    volumes:
      - sonarqube-db_data:/var/lib/postgresql/data
    networks:
      - sonarqube-network

networks:
  ### rede dedicada, para o sonar-scanner conseguir falar com o SonarQube pelo nome do contentor
  sonarqube-network:
    external: true

volumes:
  sonarqube_data:
    name: sonarqube_data
  sonarqube_extensions:
    name: sonarqube_extensions
  sonarqube_logs:
    name: sonarqube_logs
  sonarqube-db_data:
    name: sonarqube-db_data
```

---

## 3️⃣ Pré-requisitos

* Docker e Docker Compose instalados e funcionais.
* Porta **9000** livre no host — caso contrário, muda a porta no `docker-compose.sonar.yml` (`"<porta_nova>:9000"`) e atualiza/adiciona a env `SONAR_HOST_URL=http://localhost:<porta_nova>`.
* Espaço em disco para os volumes persistentes.
* O TodoList App já clonado localmente (repositório usado desde a Sessão 1).

---

## 4️⃣ Preparar variáveis (.env.sonar)

O `docker-compose.sonar.yml` já tem valores por omissão para tudo, mas é boa prática definir um ficheiro `.env.sonar` próprio (separado do `.env` da aplicação, para não misturar as duas coisas).

`env.sonar.example` (sem ponto inicial — copia o conteúdo para `.env.sonar`; ficheiros `.env*` não podem ser gravados diretamente por ferramentas remotas):
```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=sonar_db
```

> Copia o conteúdo para `.env.sonar` na raiz do projeto antes de subir o stack, e ajusta as passwords se necessário. Como o `docker-compose.sonar.yml` não carrega `.env.sonar` automaticamente (o Docker Compose só lê `.env` por omissão), sobe o stack com `--env-file .env.sonar` — ver secção seguinte.

---

## 5️⃣ Subir o stack com Docker Compose

1. **Criar a rede externa (se ainda não existir):**
   ```bash
   docker network create sonarqube-network
   ```

2. **Subir os serviços** a partir da raiz do TodoList App:
   ```bash
   docker compose -f docker-compose.sonar.yml --env-file .env.sonar up -d
   ```

3. **Verificar estado dos contentores** — deve aparecer `sonarqube` e `sonarqube-db`:
   ```bash
   docker compose -f docker-compose.sonar.yml ps
   ```
   **PostgreSQL**: deve aparecer nos logs → `database system is ready to accept connections`
   ```bash
   docker logs --follow sonarqube-db
   ```
   **SonarQube**: deve aparecer nos logs → `SonarQube is operational` (pode demorar 1-2 minutos a arrancar).
   ```bash
   docker logs --follow sonarqube
   ```

4. **Aceder à interface**: abrir `http://localhost:9000` no navegador. Se tudo estiver certo, deve aparecer a UI do SonarQube.

---

## 6️⃣ Primeiro acesso e configuração inicial

1. Login inicial: `admin` / `admin`.
2. O SonarQube pede para alterar a password — define uma nova password segura.

---

## 7️⃣ Criar projeto

1. No menu lateral, escolhe **Projects** e depois **Add Project**.
2. Escolhe a forma de criar o projeto: **Create a local project**.
3. Dá um nome e `Project Key`: `todolist-app`.
4. Indica o branch a ser analisado: `main` (ou `develop`, se for esse o estado atual do repositório — ver `git-flow-operation.md`).
5. Clica em **Next**.
6. Configura os critérios de como é considerado código NOVO — para esta demonstração, escolhe `default`.
7. Clica em **Create Project**.
8. Escolhe o "Analysis Method": **Locally**.
9. **Gerar token**: define o nome do token e a data de expiração.
   * Clica em **Generate** e copia o token gerado.
   * Clica em **Continue**.
   > Precisamos do **Project Key** e do **Token** para a análise SAST.
10. Escolhe a **linguagem** do projeto: **JavaScript / TypeScript**. O SonarQube mostra logo o comando genérico do `sonar-scanner` — vamos usá-lo em contentor Docker no próximo passo, em vez de instalar nada localmente.
11. Se tudo correr bem, deve aparecer na UI do SonarQube o resultado da análise, depois de executares o passo seguinte.

---

## 8️⃣ Executar análise SAST com sonar-scanner (Docker)

Vamos usar o contentor oficial `sonarsource/sonar-scanner-cli` para evitar instalação local.

### 8.1 Rodar o scanner a partir da raiz do TodoList App

O SonarScanner é a ferramenta de linha de comandos que recolhe código-fonte + metadados do projeto, calcula métricas estáticas e envia os resultados para o servidor SonarQube. Funciona como "cliente" do Sonar.

* Alterar o valor de `SONAR_TOKEN` para o token gerado na criação do projeto, e executar o scanner a partir da pasta raiz do TodoList App (`todolist-app/`).
* Para Windows: alterar o volume para `${PWD}:/usr/src` e `${PWD}/.git:/usr/src/.git`.

```bash
docker run --rm --network sonarqube-network \
    -e SONAR_HOST_URL="http://sonarqube:9000" \
    -e SONAR_SCANNER_OPTS="\
    -Dsonar.projectKey=todolist-app \
    -Dsonar.sources=. \
    -Dsonar.exclusions=node_modules/**,public/** \
    -Dsonar.scm.provider=git \
    -Dsonar.scm.disabled=false" \
    -e SONAR_TOKEN="[PASSAR TOKEN AQUI]" \
    -v "$(pwd):/usr/src" \
    -v "$(pwd)/.git:/usr/src/.git" \
    --platform='linux/amd64' \
    sonarsource/sonar-scanner-cli
```

Notas importantes:
* Executa o comando **dentro da pasta do TodoList App** (`todolist-app/`).
* A flag `--network sonarqube-network` permite ao scanner comunicar com o contentor `sonarqube` pelo nome `sonarqube:9000`.
* `-Dsonar.exclusions=node_modules/**,public/**` evita perder tempo a analisar dependências instaladas e ficheiros estáticos.

### 8.2 Ver resultados

* Acompanhar o log do scanner: sai no terminal.
* Abrir `http://localhost:9000/projects` e selecionar `todolist-app` para ver issues, métricas e security hotspots.
* Prestar atenção especial à aba **Security Hotspots** — é onde o SonarQube costuma sinalizar padrões como concatenação de SQL em queries (`src/routes/tasks.js`, `src/routes/api.js`), mesmo sem "saber" que é SQL Injection de propósito.

---

## 9️⃣ Parar, limpar e recomeçar

* Parar serviços:
  ```bash
  docker compose -f docker-compose.sonar.yml down
  ```

* Parar e remover volumes (**atenção**: dados e histórico de análises são apagados):
  ```bash
  docker compose -f docker-compose.sonar.yml down -v
  ```

* Remover a rede, se já não for necessária:
  ```bash
  docker network rm sonarqube-network
  ```

---

## 🔟 Resolução de problemas

* **Porta 9000 ocupada**: muda para outra porta no `docker-compose.sonar.yml` (`"<porta_nova>:9000"`) e atualiza o `SONAR_HOST_URL`.
* **Rede não encontrada**: cria `sonarqube-network` antes de subir o stack.
* **Token inválido / 401**: gera um novo token e passa-o novamente em `SONAR_TOKEN`.
* **Erro de BD**: confirma as credenciais no `.env.sonar` e se o volume `sonarqube-db_data` não está corrompido (remover o volume para reiniciar do zero).
* **Scanner não encontra o host**: confirma que `SONAR_HOST_URL` aponta para o host correto — dentro da rede Docker, usa `http://sonarqube:9000`.
* **SonarQube não arranca / erro relacionado com Elasticsearch/`vm.max_map_count`** (mais comum em Linux, raro em Docker Desktop no macOS): mesmo com `SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true`, se o contentor continuar a falhar, aumenta o limite no host com `sudo sysctl -w vm.max_map_count=262144` e tenta novamente.

---

## 1️⃣1️⃣ Referências oficiais

* SonarQube: https://docs.sonarsource.com/sonarqube/latest/
* Scanner CLI: https://docs.sonarsource.com/sonarqube/latest/analysis/scan/sonarscanner-for-cli/
* Propriedades do Scanner: https://docs.sonarsource.com/sonarqube/latest/analysis/parameters/
* Docker Hub SonarQube: https://hub.docker.com/_/sonarqube

---

Este guia serve como apoio rápido para levantar o SonarQube local e executar SAST sobre o TodoList App com Docker, alinhado com o ficheiro `docker-compose.sonar.yml` deste repositório.
