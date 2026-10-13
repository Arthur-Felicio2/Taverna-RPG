# PLAN.md - Plano de Ajustes e Execução: Taverna RPG (CRUD Spring Boot)

## 1. Diagnóstico do Projeto
O projeto Spring Boot atual possui a estrutura inicial de Controller, Service e Entity, porém apresenta lacunas estruturais que impedem o funcionamento completo do CRUD:
- **Repositório Inexistente:** O arquivo `PersonagemRepository` não existe, impedindo a injeção de dependência e compilação do Spring Data JPA.
- **Tipagem de Chave Primária (`id`):** O campo `id` na entidade e nos métodos está definido como primitivo `int` (valor padrão `0`), o que pode conflitar com o mecanismo de detecção de novas entidades do Hibernate (`null` vs existente). Deve ser `Integer`.
- **Tipo de Data/Hora:** Uso de `java.sql.Timestamp` em vez de `java.time.LocalDateTime` (padrão Spring Boot 3+ / Hibernate 6).
- **Lógica de Atualização (PUT):** O método de atualização sobrescreve a entidade diretamente sem merge controlado de campos, arriscando perder valores imutáveis (ex: `dataCriacao`).
- **Configuração de Banco de Dados:** Necessidade de garantir a existência da base `RPG` no PostgreSQL local.

---

## 2. Tarefas de Ajuste (Etapas de Implementação)

### Tarefa 1: Criar a Interface `PersonagemRepository`
- **Arquivo:** `src/main/java/com/cti/Taverna_RPG/repository/PersonagemRepository.java`
- **Ação:** Criar interface estendendo `JpaRepository<Personagem, Integer>` com anotação `@Repository`.

### Tarefa 2: Ajustar a Entidade `Personagem`
- **Arquivo:** `src/main/java/com/cti/Taverna_RPG/model/Personagem.java`
- **Ações:**
  1. Alterar tipo de `id` de `int` para `Integer`.
  2. Substituir `java.sql.Timestamp` por `java.time.LocalDateTime` para o atributo `dataCriacao`.
  3. Manter anotações `@CreationTimestamp` e `@Column(name = "data_criacao", updatable = false)`.

### Tarefa 3: Refatorar o Serviço `PersonagemService`
- **Arquivo:** `src/main/java/com/cti/Taverna_RPG/service/PersonagemService.java`
- **Ações:**
  1. Adequar tipos dos parâmetros de `int` para `Integer`.
  2. Criar método explícito `atualizar(Integer id, Personagem dadosNovos)` que busca a entidade existente via `findById`, copia os atributos editáveis e salva a entidade mesclada.
  3. Ajustar método `excluir(Integer id)` para verificar existência via `repository.existsById(id)` e retornar status booleano.

### Tarefa 4: Refatorar o Controlador `PersonagemController`
- **Arquivo:** `src/main/java/com/cti/Taverna_RPG/controller/PersonagemController.java`
- **Ações:**
  1. Alterar parâmetros `@PathVariable` de `int` para `Integer`.
  2. Atualizar método `@PutMapping("/{id}")` para chamar `service.atualizar(id, personagem)`.
  3. Atualizar método `@DeleteMapping("/{id}")` para retornar `204 No Content` se a exclusão ocorrer ou `404 Not Found` caso contrário.

### Tarefa 5: Validação do Banco de Dados
- **Arquivo:** `src/main/resources/application.properties`
- **Ações:**
  1. Assegurar que o banco `RPG` exista no PostgreSQL local (`CREATE DATABASE "RPG";`).
  2. Confirmar porta (5432), usuário (`postgres`) e senha (`postgres`).
  3. Garantir `spring.jpa.hibernate.ddl-auto=update` para criação/ajuste automático da tabela `Personagens`.

---

## 3. Roteiro de Testes via Postman (Endpoints e Validações)

| Operação | Método | Endpoint | Body (JSON) | Status Esperado |
| :--- | :--- | :--- | :--- | :--- |
| **Criar** | `POST` | `/api/personagens` | JSON com atributos do personagem (sem `id`) | `201 Created` |
| **Listar Todos** | `GET` | `/api/personagens` | Vazio | `200 OK` |
| **Buscar por ID**| `GET` | `/api/personagens/{id}` | Vazio | `200 OK` ou `404 Not Found` |
| **Atualizar** | `PUT` | `/api/personagens/{id}` | JSON com campos atualizados | `200 OK` ou `404 Not Found` |
| **Deletar** | `DELETE` | `/api/personagens/{id}` | Vazio | `204 No Content` ou `404 Not Found` |

### Exemplo de Payload JSON para POST/PUT:
```json
{
  "nome": "Galdor Ventoselvagem",
  "raca": "Elfo",
  "classe": "Mago",
  "nivel": 3,
  "pontosVida": 24,
  "pontosMana": 50,
  "atributoForca": 8,
  "atributoDestreza": 14,
  "atributoInteligencia": 18,
  "alinhamento": "Neutro e Bom"
}
```
