package com.cti.Taverna_RPG;

import com.cti.Taverna_RPG.controller.PersonagemController;
import com.cti.Taverna_RPG.model.Personagem;
import com.cti.Taverna_RPG.repository.PersonagemRepository;
import com.cti.Taverna_RPG.service.PersonagemService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class PersonagemIntegrationTest {

    @Autowired
    private PersonagemController controller;

    @Autowired
    private PersonagemService service;

    @Autowired
    private PersonagemRepository repository;

    @BeforeEach
    void setUp() {
        repository.deleteAll();
    }

    @Test
    @DisplayName("POST /personagens deve criar um personagem")
    void deveCriarPersonagem() {
        Personagem p = new Personagem();
        p.setNome("Valeros");
        p.setRaca("Humano");
        p.setClasse("Guerreiro");
        p.setNivel(1);
        p.setPontosVida(35);
        p.setPontosMana(10);
        p.setAtributoForca(18);
        p.setAtributoDestreza(12);
        p.setAtributoInteligencia(10);
        p.setAlinhamento("Neutro e Bom");

        ResponseEntity<Personagem> response = controller.criar(p);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getId()).isNotNull();
        assertThat(response.getBody().getNome()).isEqualTo("Valeros");
    }

    @Test
    @DisplayName("PUT /personagens/{id} deve atualizar apenas os campos enviados sem apagar os outros")
    void deveAtualizarParcialmenteViaPutPorId() {
        // 1. Cadastra personagem completo
        Personagem original = new Personagem();
        original.setNome("Elandorr");
        original.setRaca("Elfo");
        original.setClasse("Mago");
        original.setNivel(5);
        original.setPontosVida(40);
        original.setPontosMana(100);
        original.setAtributoForca(10);
        original.setAtributoDestreza(14);
        original.setAtributoInteligencia(18);
        original.setAlinhamento("Caótico e Bom");
        Personagem salvo = repository.save(original);

        // 2. PUT enviando apenas pontosVida e nivel (demais campos nulos)
        Personagem dadosAtualizacao = new Personagem();
        dadosAtualizacao.setPontosVida(85);
        dadosAtualizacao.setNivel(6);

        ResponseEntity<Personagem> response = controller.atualizar(String.valueOf(salvo.getId()), dadosAtualizacao);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        Personagem atualizado = response.getBody();
        assertThat(atualizado).isNotNull();
        assertThat(atualizado.getPontosVida()).isEqualTo(85);
        assertThat(atualizado.getNivel()).isEqualTo(6);

        // Verifica que todos os outros campos NÃO foram apagados
        assertThat(atualizado.getNome()).isEqualTo("Elandorr");
        assertThat(atualizado.getRaca()).isEqualTo("Elfo");
        assertThat(atualizado.getClasse()).isEqualTo("Mago");
        assertThat(atualizado.getPontosMana()).isEqualTo(100);
        assertThat(atualizado.getAtributoForca()).isEqualTo(10);
        assertThat(atualizado.getAtributoDestreza()).isEqualTo(14);
        assertThat(atualizado.getAtributoInteligencia()).isEqualTo(18);
        assertThat(atualizado.getAlinhamento()).isEqualTo("Caótico e Bom");

        // 3. Valida no banco de dados
        Personagem noBanco = repository.findById(salvo.getId()).orElseThrow();
        assertThat(noBanco.getPontosVida()).isEqualTo(85);
        assertThat(noBanco.getNome()).isEqualTo("Elandorr");
    }

    @Test
    @DisplayName("PUT /personagens/{nome} deve atualizar parcialmente por nome")
    void deveAtualizarParcialmentePorNome() {
        Personagem original = new Personagem();
        original.setNome("Gimli");
        original.setRaca("Anão");
        original.setClasse("Guerreiro");
        original.setNivel(4);
        original.setPontosVida(50);
        repository.save(original);

        Personagem dadosAtualizacao = new Personagem();
        dadosAtualizacao.setPontosVida(75);

        ResponseEntity<Personagem> response = controller.atualizar("Gimli", dadosAtualizacao);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        Personagem atualizado = response.getBody();
        assertThat(atualizado).isNotNull();
        assertThat(atualizado.getPontosVida()).isEqualTo(75);
        assertThat(atualizado.getNome()).isEqualTo("Gimli");
        assertThat(atualizado.getRaca()).isEqualTo("Anão");
        assertThat(atualizado.getClasse()).isEqualTo("Guerreiro");
        assertThat(atualizado.getNivel()).isEqualTo(4);
    }

    @Test
    @DisplayName("GET deve listar e buscar por ID ou Nome")
    void deveBuscarPorIdENome() {
        Personagem p = new Personagem();
        p.setNome("Legolas");
        p.setRaca("Elfo");
        p.setClasse("Arqueiro");
        Personagem salvo = repository.save(p);

        // Lista
        List<Personagem> todos = controller.listar(null);
        assertThat(todos).hasSize(1);

        // Filtro por classe
        List<Personagem> arqueiros = controller.listar("Arqueiro");
        assertThat(arqueiros).hasSize(1);
        List<Personagem> magos = controller.listar("Mago");
        assertThat(magos).isEmpty();

        // Busca por ID
        ResponseEntity<Personagem> porId = controller.buscarPorIdentificador(String.valueOf(salvo.getId()));
        assertThat(porId.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(porId.getBody().getNome()).isEqualTo("Legolas");

        // Busca por Nome
        ResponseEntity<Personagem> porNome = controller.buscarPorIdentificador("Legolas");
        assertThat(porNome.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(porNome.getBody().getId()).isEqualTo(salvo.getId());
    }

    @Test
    @DisplayName("DELETE deve excluir por id e por nome")
    void deveDeletarPorIdENome() {
        Personagem p1 = new Personagem();
        p1.setNome("Frodo");
        p1.setRaca("Hobbit");
        Personagem salvo1 = repository.save(p1);

        Personagem p2 = new Personagem();
        p2.setNome("Sam");
        p2.setRaca("Hobbit");
        repository.save(p2);

        // Deleta por ID
        ResponseEntity<Void> resp1 = controller.deletar(String.valueOf(salvo1.getId()));
        assertThat(resp1.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        assertThat(repository.existsById(salvo1.getId())).isFalse();

        // Deleta por Nome
        ResponseEntity<Void> resp2 = controller.deletar("Sam");
        assertThat(resp2.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        assertThat(repository.existsByNome("Sam")).isFalse();
    }
}
