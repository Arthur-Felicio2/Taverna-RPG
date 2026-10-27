package com.cti.Taverna_RPG.controller;

import com.cti.Taverna_RPG.model.Personagem;
import com.cti.Taverna_RPG.service.PersonagemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping({"/personagens", "/api/personagens"})
public class PersonagemController {

    private final PersonagemService service;

    public PersonagemController(PersonagemService service) {
        this.service = service;
    }

    // Listar todos os personagens ou filtrar por classe (GET /personagens ou GET /api/personagens?classe=Mago)
    @GetMapping
    public List<Personagem> listar(@RequestParam(value = "classe", required = false) String classe) {
        return service.listarTodos(classe);
    }

    // Buscar detalhes do personagem por ID ou por Nome (GET /personagens/{identificador} ou GET /api/personagens/{identificador})
    @GetMapping("/{identificador}")
    public ResponseEntity<Personagem> buscarPorIdentificador(@PathVariable("identificador") String identificador) {
        return service.buscarPorIdOuNome(identificador)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Criar novo personagem (POST /personagens ou POST /api/personagens)
    @PostMapping
    public ResponseEntity<Personagem> criar(@RequestBody Personagem personagem) {
        Personagem novoPersonagem = service.salvar(personagem);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoPersonagem);
    }

    // Atualizar personagem por ID ou Nome sem necessidade de enviar todos os campos (PUT /personagens/{identificador})
    @PutMapping("/{identificador}")
    public ResponseEntity<Personagem> atualizar(
            @PathVariable("identificador") String identificador,
            @RequestBody Personagem personagem) {
        return service.atualizarPorIdOuNome(identificador, personagem)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Atualização parcial alternativa (PATCH /personagens/{identificador})
    @PatchMapping("/{identificador}")
    public ResponseEntity<Personagem> atualizarParcial(
            @PathVariable("identificador") String identificador,
            @RequestBody Personagem personagem) {
        return service.atualizarPorIdOuNome(identificador, personagem)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Deletar personagem por ID ou Nome (DELETE /personagens/{identificador})
    @DeleteMapping("/{identificador}")
    public ResponseEntity<Void> deletar(@PathVariable("identificador") String identificador) {
        if (service.excluirPorIdOuNome(identificador)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
