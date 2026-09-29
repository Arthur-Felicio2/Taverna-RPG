package com.cti.Taverna_RPG.service;

import com.cti.Taverna_RPG.model.Personagem;
import com.cti.Taverna_RPG.repository.PersonagemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PersonagemService {

    private final PersonagemRepository repository;

    public PersonagemService(PersonagemRepository repository) {
        this.repository = repository;
    }

    public List<Personagem> listarTodos() {
        return repository.findAll();
    }

    public Optional<Personagem> buscarPorId(int id) {
        return repository.findById(id);
    }

    public Personagem salvar(Personagem personagem) {
        return repository.save(personagem);
    }

    public void excluir(int id) {
        repository.deleteById(id);
    }
}