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

    public List<Personagem> listarTodos(String classe) {
        if (classe != null && !classe.trim().isEmpty()) {
            return repository.findByClasseIgnoreCase(classe);
        }
        return repository.findAll();
    }

    public Optional<Personagem> buscarPorId(Integer id) {
        return repository.findById(id);
    }

    public Personagem salvar(Personagem personagem) {
        return repository.save(personagem);
    }

    public Optional<Personagem> atualizar(Integer id, Personagem dadosAtualizados) {
        return repository.findById(id).map(existente -> {
            existente.setNome(dadosAtualizados.getNome());
            existente.setRaca(dadosAtualizados.getRaca());
            existente.setClasse(dadosAtualizados.getClasse());
            existente.setNivel(dadosAtualizados.getNivel());
            existente.setPontosVida(dadosAtualizados.getPontosVida());
            existente.setPontosMana(dadosAtualizados.getPontosMana());
            existente.setAtributoForca(dadosAtualizados.getAtributoForca());
            existente.setAtributoDestreza(dadosAtualizados.getAtributoDestreza());
            existente.setAtributoInteligencia(dadosAtualizados.getAtributoInteligencia());
            existente.setAlinhamento(dadosAtualizados.getAlinhamento());
            return repository.save(existente);
        });
    }

    public boolean excluir(Integer id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return true;
        }
        return false;
    }
}