# SonarQube CI – Integração com GitHub Actions (Parte 2)

Guia prático para executar análise SAST do SonarQube em pipelines GitHub Actions. Inclui notas rápidas para GitLab.\
**Instância a usar neste exercício (URL Temporário):** [https://sonar.lab-bca.cloud-ip.cc/](https://sonar.lab-bca.cloud-ip.cc/).

---

## Índice
1. Visão Geral
2. O que é GitHub Actions?
3. Pré‑requisitos
4. Configurar GitHub dentro do SonarQube
5. Importar projeto de GitHub para SonarQube
6. Conferir execução no GitHub Actions
7. Referências

---

## 1. Visão Geral
- O SonarScanner é executado em cada push/PR.
- Os resultados são enviados para o SonarQube Server self‑hosted (ou SonarCloud).
- A análise corre num workflow do GitHub Actions hospedado no próprio repositório.
---

## 2. O que é GitHub Actions?
- Plataforma de automação nativa do GitHub que permite orquestrar pipelines (CI/CD) através de ficheiros YAML guardados no repositório em `.github/workflows/`.
- Um workflow é composto por _triggers_ (ex.: `push`, `pull_request`, `schedule`), _jobs_ e _steps_; os _jobs_ correm em _runners_ hospedados pelo GitHub ou self‑hosted.
- Permite usar _actions_ prontas da marketplace ou código próprio; as credenciais e _tokens_ ficam em `secrets`.
- Para SAST com SonarQube, usamos um workflow que executa o scanner e envia resultados para o servidor configurado.

---

## 3. Pré‑requisitos
- Projeto já criado no SonarQube com `Project Key`.
- Token de projeto (gerado em My Account → Security).
- Permissão para criar _Secrets_ no repositório GitHub (ex.: `SONAR_HOST_URL` e `SONAR_TOKEN`).

---

## 4. Configurar GitHub dentro do SonarQube
> Necessário para PR Decoration e para ligar projetos a repositórios.

1. Entrar como admin no SonarQube e seguir os seguintes passos:
![img](./img/sonar01.png)
2. **Create GitHub configuration**:
   - `Configuration name`: ex. `github-bca`
   - `GitHub API URL`: `https://api.github.com`
3. Configurar Github APP:
    > Antes de continuar com a configuração, vamos criar um App no GitHub.Por favor, siga os seguintes passos:\
    > Setting up a GitHub App for use with SonarQube: [https://docs.sonarsource.com/sonarqube-community-build/devops-platform-integration/github-integration/setting-up-at-global-level/setting-up-github-app](https://docs.sonarsource.com/sonarqube-community-build/devops-platform-integration/github-integration/setting-up-at-global-level/setting-up-github-app)
    - Abrir em nova aba a URP para cria APP no Github, atraves da seguinte opção no github `Settings > Developer Settings > GitHub Apps` OU acedendo URL direta: [https://github.com/settings/apps/new](https://github.com/settings/apps/new).
    - Clicar em `New GitHub App`.
    - Preencher os campos:
      - **Name**: `sonarqube-bca`
      - **Homepage**: `https://sonar.lab-bca.cloud-ip.cc`
      - **Callback URL**: `https://sonar.lab-bca.cloud-ip.cc`.
      - Inativar **Webhook**: remover o Check em Active.
      - Marcar as permissões indicada na imagem a seguir, bem como a de `pull_requests: Read & Write`: 
      ![Permissions](./img/sonar02.png)
      - Certifiar que as suas permissões fique da seguinte forma:
      ![Permissions](./img/sonar03.png)
      - Clicar em **Create GitHub App**.
      > Depois de criar o App, vamos obter as credenciais dele para usar no SonarQube.
      - Copiar o `Client ID` e o `App ID` e colar nas configurações do SonarQube.
      - Gerar **Client Secret** e colar nas configurações do SonarQube, clicando em `Generate a new client secret`.
      - Clicar em `Generate a private key` e copiar o Private Key, irá gerar e baixar um arquivo `.pem`. Abrir o arquivo e copiar o conteúdo nas configurações do SonarQube.
      - Na UI do SonarQube, clicar em `Save configuration`.
      - Apos isso, ainda na UI do SonarQube, clicar em `Check configuration`. Em caso de falha, ele indicará a permissão em falta.
      - Se tudo estiver certo, o SonarQube irá indicar que a configuração é válida.
      - Voltar a UI github e clicar em `Install App`. 
      - Selecione uma conta e clicar em **Install**.
      - Clicar em **Only select repositories** e ecolha o seu repositorio, que pretende analisar. Por Fim, clicar em **Install**.

---
## 5. Importar projeto de GitHub para SonarQube
1. Menu **Projects**, clicar em **Create Project** e selecionar **From github**.
2. Autorizar o SonarQube a acessar o GitHub, clicando em `Authorize sonarqube-bca`.
3. Escolher a conta GitHub e de seguida o repositório que pretende importar.
4. Apos selecionar, clicar em `import`.
5. Selecionar o critério para identificar **Código Novo** e clicar em **Create project**.
6. Com a importação feita.
7. De seguida passamos a configuração do do **Método de Análise**, clicando em ** With GitHub Actions** e, seguimos as instruções apresentadas pela UI do SonarQube, gerar Token e adicionar ENVs com as seguintes chaves: SONAR_HOST_URL e SONAR_TOKEN no repositorio:
![img](./img/sonar04.png)
8. Para finalizar a integração, em **Create Workflow YAML File** clicar na tecnologia utilizado no projeto, neste caso**Python** e siga as instruções apresentadas pela UI do SonarQube:
- criar o ficheiro `sonar-project.properties` a raiz do projeto com o valor de **projectKey** apresentado no UI do SonarQube:
```bash
sonar.projectKey=ejstavares_django-observability_6ec301b6-140a-4f30-b83e-6b3fdcd8c508
```
- crair o ficheiro na seguinta pasta: `.github/workflows/sonar.yml` com o seguinte conteudo, apresentado pela UI do SonarQube:
```yaml
name: SonarQube Analize 2

on:
  push:
    branches:
      - main

jobs:
  build:
    name: Build and sonarqube analyze
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: SonarSource/sonarqube-scan-action@v6
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
```

## 6. Conferir a execução do pipeline em Github Actions do repositorio. 
1. Clicar em **Actions** e ver os logs da execução.
2. Voltar para UI do SonarQube e ver os resultados.

---

## 7. Referências
- SonarQube Docs: https://docs.sonarsource.com/sonarqube/latest/
- GitHub Action oficial: https://github.com/SonarSource/sonarcloud-github-action
- Scanner CLI: https://docs.sonarsource.com/sonarqube/latest/analysis/scan/sonarscanner-for-cli/
- Parâmetros do Scanner: https://docs.sonarsource.com/sonarqube/latest/analysis/parameters/
