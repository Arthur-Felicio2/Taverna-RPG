package com.cti.Taverna_RPG.controller;

import com.cti.Taverna_RPG.model.Personagem;
import com.cti.Taverna_RPG.service.PersonagemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/personagens")
public class PersonagemController {

    private final PersonagemService service;

    public PersonagemController(PersonagemService service) {
        this.service = service;
    }

    // Listar todos os personagens ou filtrar por classe (GET /api/personagens ou GET /api/personagens?classe=Mago)
    @GetMapping
    public List<Personagem> listar(@RequestParam(required = false) String classe) {
        return service.listarTodos(classe);
    }

    // Buscar por ID (GET /api/personagens/{id})
    @GetMapping("/{id}")
    public ResponseEntity<Personagem> buscarPorId(@PathVariable Integer id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Criar novo personagem (POST /api/personagens)
    @PostMapping
    public ResponseEntity<Personagem> criar(@RequestBody Personagem personagem) {
        Personagem novoPersonagem = service.salvar(personagem);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoPersonagem);
    }

    // Atualizar personagem (PUT /api/personagens/{id})
    @PutMapping("/{id}")
    public ResponseEntity<Personagem> atualizar(@PathVariable Integer id, @RequestBody Personagem personagem) {
        return service.atualizar(id, personagem)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Deletar personagem (DELETE /api/personagens/{id})
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        if (service.excluir(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}