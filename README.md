# Golden Raspberry Awards API

Este projeto é uma **API RESTful** desenvolvida com **NestJS** para processar a lista de indicados e vencedores da
categoria **Pior Filme** do **Golden Raspberry Awards (Razzie Awards)**.
Tem por finalidade participar de processo seletivo para vaga na Outsera.

Apesar do projeto ser pequeno e numa primeira olhada dar a impressão de overengineering, com muitas camadas, criei esse
teste para demonstrar uma organização de código limpo, desacoplado e escalável.
Criei uma interface para o repositório, para tornar fácil a mudança ara outro DB quando preciso e distribui
responsabilidades no projeto. A contaminação da entity pelo ORM é proposital e calculada. O custo benefício vale.

## Funcionalidades da API

- **Importação automática** dos dados de um arquivo CSV ao iniciar a aplicação.

  Ao iniciar o container, o próprio sistema subirá um Sqlite e importará os dados fornecidos no arquivo /srv/data/movielist.cvs
  Não me preocupei em criar um ambiente para subir o arquivo via upload, pois fugia ao escopo pedido
  Havia dois caminhos: fs.readFile() ou fs.createReadStream(). Preferi o segundo pois readFile para arquivos grande
  pode comprometer memória e CPU, visto carregar tudo para depois tratar. O createReadStream trabalhará com chunks,
  preservando o servidor.

- **Consulta do produtor com maior e menor intervalo entre prêmios consecutivos**.

  Analisando o csv enviado, vemos que existem producers sozinhos ou junto com outros. A consulta montada
  considerou isso, para extrair os producers que estavam acompanhados e a sós. Apenas vencedores foram considerados.
  Aqui também havia 2 caminhos: Carregar todos os dados para a memória e tratar com reduce, map, filter, etc...
  Ou criar consultas mais sofisticadas para deixar o DB nos retornar o necessário e apenas montar a estrutura para
  retornar ao cliente. Preferi a segunda abordagem exatamente pelo mesmo motivo de ter usado createReadStream().
  Preservar memória e CPU e a própria opmização do DB quando às consultas. Na consulta uso CTEs para ir agrupando
  em partes o que quero do DB e por fim, trazer o resultado limpo e mantendo o SQL legível.

- **Banco de dados em memória**, permitindo fácil substituição por MySQL/PostgreSQL.

  Foi usado o Sqlite3 para essa prova. Usei o TypeORM para ter a possibilidade de troca entre DBs facilmente e
  foi criado um contrato para também, em caso de mudança de DB, podermos alternar consultas SQL cruas que funcionam
  em um DB, mas não em outro.

- **Execução completa via Docker**, sem necessidade de dependências no host.

  Ponto para dar atenção. Tudo está containerizado. Nada roda no computador host. Nem o servidor da aplicação, nem
  os testes. Qualquer tentativa de se rodar comandos fora do container, resultaram em erro. Isso isola completamente
  o sistema da máquina do usuário, das versões que ele tem, com o que o sistema precisa. Evita, assim, o famoso
  "No meu computador roda!"

- **Hot reload ativado**, permitindo atualizações sem precisar rebuildar o container.

  Mesmo estando tudo conteinerizado, os arquivos fonte estão disponíveis no host e quando atualizados,
  já são refletidos no conatiner para que o dev não precise buildar e aguardar processos. Não há atrasos.

---

## Tecnologias Utilizadas

- **Node.js** (22.13.1 - LTS)
- **NestJS** (Framework modular para Node.js)
- **Docker & Docker Compose** (Para isolamento total do ambiente)
- **Banco de Dados Sqlite3** (Executando no Docker)
- **TypeORM** (Para facilitar a troca de banco de dados no futuro)
- **CSV Parser** (Para processar os arquivos de entrada)
- **Jest & Supertest** (Para testes de integração)

---

## Como Executar o Projeto

### **1️ Pré-requisitos**

- **Docker e Docker Compose instalados**
- **Nenhuma dependência no host** além do Docker (o ambiente é totalmente isolado)

### **2️ Rodar o projeto**

```sh
docker-compose up --force-recreate --build
```

Isso irá:

- Criar um container Alpine com **Node.js 22.13.1** e **Sqlite3** e instalar todas as dependências.
- Rodar a API NestJS na porta **3000**.
- Monitorar mudanças no código e aplicar **hot reload** automaticamente.
- Estará em pé quando a última mensagem do terminal apresentar
  LOG [NestApplication] Nest application successfully started +1ms
  Aguarde

### **3️ Testar a API**

Após iniciar o projeto, vai ocorrer o import dos dados e você pode acessar a API em:

- **URL:** `http://localhost:3000/movies/producers/awards-intervals`

---

## Arquivos de Configuração

### **Dockerfile**

```dockerfile
FROM node:22-alpine
RUN apk add --no-cache sqlite
WORKDIR /app
COPY package*.json ./
COPY . .
EXPOSE 3000
```

### **docker-compose.yml**

```yaml
services:
  api:
    build: .
    container_name: nest_api
    ports:
      - '3000:3000'
    volumes:
      - .:/app
    working_dir: /app
    command: sh -c 'rm -rf node_modules && npm install && npm run start:dev'
    environment:
      - NODE_ENV=development
```

---

## Testes de Integração

O projeto inclui **testes de integração** para garantir que a API retorne os dados corretamente.

Para rodar os testes:

```sh
npm run test:e2e:docker
```

Isso irá:

- Rodar todos os testes dentro do container.
- Garantir que as respostas da API estão corretas.

---

## Decisões Técnicas e Justificativas

| Decisão                                              | Justificativa                                                                               |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Ambiente isolado no Docker**                       | Garante que a aplicação rode sem problemas de dependências externas Em qualquer equipamento |
| **Banco de dados Sqlite rodando no Docker**          | Evita necessidade de instalar um banco na máquina local                                     |
| **Uso de volumes para sincronizar código**           | Permite modificar o código no host sem precisar rebuildar o conteiner                       |
| **Instalação do `node_modules` apenas no container** | Garante compatibilidade e evita conflitos de versão                                         |
