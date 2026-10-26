# Guia Prático: Integração com PostgreSQL & Testes de API — Taverna RPG

Este documento serve como roteiro de execução passo a passo para a atividade prática solicitada pela professora, já adaptado para o domínio do projeto **Taverna RPG** (entidade `Personagem`).

---

## 💡 O que a professora está pedindo? (Explicação Simples)

A professora quer que a aplicação deixe de rodar em memória (ou sem banco real) e passe a se comunicar com um **banco de dados PostgreSQL físico** instalado na sua máquina:

1. **Driver do Banco (`pom.xml`):** Adicionar a biblioteca que ensina o Java/Spring a "falar" o dialeto do PostgreSQL.
2. **Configuração de Conexão (`application.properties`):** Informar ao Spring onde o banco está (endereço, porta, nome do banco, usuário e senha), além de pedir ao Hibernate para criar as tabelas sozinho (`ddl-auto=update`).
3. **Criação do Banco Vazio:** Criar apenas a "casca" do banco (`taverna_rpg`) no PostgreSQL (via pgAdmin ou terminal). As tabelas serão criadas pelo Spring Boot.
4. **Teste de Persistência:** Disparar requisições HTTP (GET/POST) pelo **Postman** e provar que o registro foi gravado no banco de dados.
5. **Demonstração Presencial:** Subir o código para o GitHub e ter o Postman + banco prontos para demonstrar à professora.

---

## Passo 1: Dependência no `pom.xml`

Abra o arquivo `pom.xml` na raiz do projeto e localize a tag `<dependencies>`. Adicione o driver do PostgreSQL caso ainda não esteja presente:

```xml
<dependencies>
    <!-- Outras dependências como spring-boot-starter-data-jpa e spring-boot-starter-web -->

    <!-- Driver do PostgreSQL -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
</dependencies>
```

> **Atenção:** Logo após colar, clique no ícone do Maven com as setas giratórias (**Reload All Maven Projects**) na sua IDE (IntelliJ, Eclipse ou VS Code) para que os arquivos `.jar` sejam baixados.

---

## Passo 2: Configuração do `application.properties`

Abra o arquivo `src/main/resources/application.properties` e substitua ou adicione as configurações abaixo.

> **Importante sobre a porta:** O padrão do PostgreSQL é `5432`. Se a sua instalação estiver na porta `5433` (como no exemplo da professora), mantenha `5433`. Caso contrário, use `5432`.

```properties
spring.application.name=taverna-rpg

# Configuração de Conexão com o PostgreSQL
# (Ajuste a porta para 5432 ou 5433 e o usuário/senha conforme seu ambiente local)
spring.datasource.url=jdbc:postgresql://localhost:5432/taverna_rpg
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.datasource.driver-class-name=org.postgresql.Driver

# Configurações do Hibernate / JPA
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

---

## Passo 3: Criar o Banco de Dados no PostgreSQL

O Hibernate cria as **tabelas** automaticamente, mas o **banco de dados** deve existir previamente.

### Opção A: Via pgAdmin
1. Abra o **pgAdmin** e conecte ao seu servidor.
2. Clique com botão direito em **Databases** > **Create** > **Database...**
3. Digite o nome: `taverna_rpg`
4. Clique em **Save**.

### Opção B: Via Terminal / DBeaver / psql
Execute o comando SQL:
```sql
CREATE DATABASE taverna_rpg;
```

---

## Passo 4: Executar a Aplicação Spring Boot

1. Inicie a classe principal: `TavernaRpgApplication.java`.
2. Observe o console da IDE. Ao iniciar, o Hibernate imprimirá comandos SQL no console semelhantes a:
   ```sql
   create table if not exists personagens (...)
   ```
3. Se não houver erros vermelhos de conexão recusada (*Connection refused*), a integração com o banco está funcionando.

---

## Passo 5: Testes no Postman

A professora solicitou testar o endpoint adaptado para o seu domínio: `/personagens` (ou `/api/personagens`, conforme mapeado no seu `PersonagemController`).

### 1. Criar Personagem (POST)
* **Método:** `POST`
* **URL:** `http://localhost:8080/personagens` *(ou `http://localhost:8080/api/personagens`)*
* **Headers:**
  * `Content-Type`: `application/json`
* **Body** (marque a opção *raw* e selecione *JSON*):

```json
{
  "nome": "Thorgar Machado-de-Ferro",
  "raca": "Anão",
  "classe": "Guerreiro",
  "nivel": 1,
  "pontosVida": 30,
  "pontosMana": 10,
  "atributoForca": 16,
  "atributoDestreza": 10,
  "atributoInteligencia": 8,
  "alinhamento": "Leal e Neutro"
}
```

* **Resposta esperada:** Status `200 OK` ou `201 Created` retornando o JSON com o `id` gerado.

---

### 2. Listar Personagens (GET)
* **Método:** `GET`
* **URL:** `http://localhost:8080/personagens` *(ou `http://localhost:8080/api/personagens`)*
* **Resposta esperada:** Status `200 OK` trazendo a lista com os personagens persistidos no banco PostgreSQL.

---

## Passo 6: Publicar no Git (GitHub)

Para submeter o link à professora:

1. Abra o terminal na raiz do projeto:
   ```bash
   git status
   git add pom.xml src/main/resources/application.properties
   git commit -m "feat: configurada conexao com PostgreSQL e mapeamento de persistencia"
   git push origin main
   ```
2. Copie a URL do seu repositório no GitHub para entregar na plataforma de envio.

---

## 📋 Checklist para a Apresentação Presencial

Durante a aula com a professora, mantenha abertos na sua tela:

- [ ] **IDE aberta** mostrando o `pom.xml` com o driver e o `application.properties` configurado.
- [ ] **pgAdmin** aberto conectado na base `taverna_rpg`, pronto para executar `SELECT * FROM personagens;`.
- [ ] **Postman** aberto com as duas abas salvas:
  - Uma aba com a requisição `POST` para cadastrar um personagem novo na frente dela.
  - Uma aba com a requisição `GET` para listar e provar que o dado foi gravado.
- [ ] **Link do repositório no GitHub** já postado na plataforma.