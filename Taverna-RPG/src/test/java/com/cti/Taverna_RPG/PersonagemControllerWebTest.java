package com.cti.Taverna_RPG;

import com.cti.Taverna_RPG.model.Personagem;
import com.cti.Taverna_RPG.repository.PersonagemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
class PersonagemControllerWebTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private PersonagemRepository repository;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
        repository.deleteAll();
    }

    @Test
    @DisplayName("POST /api/personagens cria personagem válido, normaliza texto e ignora ID enviado")
    void deveCriarPersonagemViaHttp() throws Exception {
        String json = """
                {
                  "id": 999,
                  "nome": "  Trevor Belmont  ",
                  "raca": " Humano ",
                  "classe": " Paladino ",
                  "nivel": 10,
                  "pontosVida": 80,
                  "pontosMana": 30,
                  "atributoForca": 18,
                  "atributoDestreza": 15,
                  "atributoInteligencia": 12,
                  "alinhamento": "Leal e Bom"
                }
                """;

        mockMvc.perform(post("/api/personagens")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", not(999)))
                .andExpect(jsonPath("$.nome", is("Trevor Belmont")))
                .andExpect(jsonPath("$.raca", is("Humano")))
                .andExpect(jsonPath("$.classe", is("Paladino")))
                .andExpect(jsonPath("$.dataCriacao", notNullValue()));
    }

    @Test
    @DisplayName("POST /personagens rejeita nome duplicado (case-insensitive) com 409 Conflict")
    void deveRejeitarNomeDuplicado() throws Exception {
        Personagem existente = new Personagem();
        existente.setNome("Sypha Belnades");
        existente.setClasse("Mago");
        repository.save(existente);

        String jsonDuplicado = """
                {
                  "nome": "sypha belnades",
                  "classe": "Mago"
                }
                """;

        mockMvc.perform(post("/personagens")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonDuplicado))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status", is(409)))
                .andExpect(jsonPath("$.message", containsString("Sypha Belnades".toLowerCase())));
    }

    @Test
    @DisplayName("POST /api/personagens rejeita nome em branco, atributos inválidos e JSON malformado com 400")
    void deveValidarPayloadInvalido() throws Exception {
        mockMvc.perform(post("/api/personagens")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\": \"   \", \"classe\": \"Guerreiro\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)));

        mockMvc.perform(post("/api/personagens")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\": \"Conan\", \"nivel\": 0, \"pontosVida\": -5}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)));

        mockMvc.perform(post("/api/personagens")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{json-invalido"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)));
    }

    @Test
    @DisplayName("GET /api/personagens lista em ordem determinística de ID e filtra por classe")
    void deveListarEFiltrarOrdenado() throws Exception {
        Personagem p1 = new Personagem();
        p1.setNome("Alucard");
        p1.setClasse("Guerreiro");
        p1.setNivel(20);
        repository.save(p1);

        Personagem p2 = new Personagem();
        p2.setNome("Carmilla");
        p2.setClasse("Mago");
        p2.setNivel(25);
        repository.save(p2);

        mockMvc.perform(get("/api/personagens"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].nome", is("Alucard")))
                .andExpect(jsonPath("$[1].nome", is("Carmilla")));

        mockMvc.perform(get("/personagens").param("classe", "mago"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].nome", is("Carmilla")));
    }

    @Test
    @DisplayName("PUT e PATCH atualizam parcialmente e bloqueiam colisão de nome com 409")
    void deveAtualizarParcialmenteEValidarConflito() throws Exception {
        Personagem p1 = new Personagem();
        p1.setNome("Arthur");
        p1.setClasse("Paladino");
        p1.setNivel(5);
        p1.setPontosVida(60);
        p1 = repository.save(p1);

        Personagem p2 = new Personagem();
        p2.setNome("Lancelot");
        p2.setClasse("Guerreiro");
        repository.save(p2);

        // PATCH parcial preserva classe e nome
        mockMvc.perform(patch("/api/personagens/" + p1.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nivel\": 12}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome", is("Arthur")))
                .andExpect(jsonPath("$.classe", is("Paladino")))
                .andExpect(jsonPath("$.nivel", is(12)))
                .andExpect(jsonPath("$.pontosVida", is(60)));

        // Tentativa de renomear Arthur para Lancelot deve dar 409
        mockMvc.perform(put("/api/personagens/" + p1.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\": \"Lancelot\"}"))
                .andExpect(status().isConflict());

        // Atualizar inexistente deve retornar 404
        mockMvc.perform(put("/api/personagens/inexistente")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nivel\": 2}"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET e DELETE inexistentes retornam 404 Not Found")
    void deveRetornar404ParaInexistentes() throws Exception {
        mockMvc.perform(get("/api/personagens/99999"))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/personagens/Desconhecido"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Recursos estáticos do front-end devem ser servidos com 200 OK")
    void deveServirFrontendEstatico() throws Exception {
        mockMvc.perform(get("/index.html"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/app.js"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/style.css"))
                .andExpect(status().isOk());
    }
}
