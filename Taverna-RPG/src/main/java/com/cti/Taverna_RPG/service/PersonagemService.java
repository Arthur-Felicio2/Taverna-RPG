package com.cti.Taverna_RPG.service;

import com.cti.Taverna_RPG.model.Personagem;
import com.cti.Taverna_RPG.repository.PersonagemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
            return repository.findByClasseIgnoreCase(classe.trim());
        }
        return repository.findAll();
    }

    public Optional<Personagem> buscarPorId(Integer id) {
        return repository.findById(id);
    }

    public Optional<Personagem> buscarPorNome(String nome) {
        return repository.findFirstByNomeIgnoreCase(nome.trim())
                .or(() -> repository.findByNome(nome));
    }

    public Optional<Personagem> buscarPorIdOuNome(String idOuNome) {
        if (idOuNome == null || idOuNome.trim().isEmpty()) {
            return Optional.empty();
        }
        String valor = idOuNome.trim();
        try {
            int id = Integer.parseInt(valor);
            Optional<Personagem> porId = repository.findById(id);
            if (porId.isPresent()) {
                return porId;
            }
        } catch (NumberFormatException ignored) {
            // Não é número, prossegue para busca textual
        }
        return buscarPorNome(valor);
    }

    public Personagem salvar(Personagem personagem) {
        return repository.save(personagem);
    }

    @Transactional
    public Optional<Personagem> atualizar(Integer id, Personagem dadosNovos) {
        return repository.findById(id).map(existente -> {
            mesclarCampos(existente, dadosNovos);
            return repository.save(existente);
        });
    }

    @Transactional
    public Optional<Personagem> atualizarPorIdOuNome(String idOuNome, Personagem dadosNovos) {
        return buscarPorIdOuNome(idOuNome).map(existente -> {
            mesclarCampos(existente, dadosNovos);
            return repository.save(existente);
        });
    }

    /**
     * Atualização seletiva/parcial: apenas os atributos enviados (não nulos) são aplicados,
     * sem sobrescrever campos omitidos com null ou zero.
     */
    private void mesclarCampos(Personagem existente, Personagem dadosNovos) {
        if (dadosNovos.getNome() != null && !dadosNovos.getNome().trim().isEmpty()) {
            existente.setNome(dadosNovos.getNome().trim());
        }
        if (dadosNovos.getRaca() != null && !dadosNovos.getRaca().trim().isEmpty()) {
            existente.setRaca(dadosNovos.getRaca().trim());
        }
        if (dadosNovos.getClasse() != null && !dadosNovos.getClasse().trim().isEmpty()) {
            existente.setClasse(dadosNovos.getClasse().trim());
        }
        if (dadosNovos.getNivel() != null) {
            existente.setNivel(dadosNovos.getNivel());
        }
        if (dadosNovos.getPontosVida() != null) {
            existente.setPontosVida(dadosNovos.getPontosVida());
        }
        if (dadosNovos.getPontosMana() != null) {
            existente.setPontosMana(dadosNovos.getPontosMana());
        }
        if (dadosNovos.getAtributoForca() != null) {
            existente.setAtributoForca(dadosNovos.getAtributoForca());
        }
        if (dadosNovos.getAtributoDestreza() != null) {
            existente.setAtributoDestreza(dadosNovos.getAtributoDestreza());
        }
        if (dadosNovos.getAtributoInteligencia() != null) {
            existente.setAtributoInteligencia(dadosNovos.getAtributoInteligencia());
        }
        if (dadosNovos.getAlinhamento() != null && !dadosNovos.getAlinhamento().trim().isEmpty()) {
            existente.setAlinhamento(dadosNovos.getAlinhamento().trim());
        }
    }

    @Transactional
    public boolean excluirPorId(Integer id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return true;
        }
        return false;
    }

    @Transactional
    public boolean excluirPorNome(String nome) {
        if (repository.existsByNomeIgnoreCase(nome.trim())) {
            repository.deleteByNomeIgnoreCase(nome.trim());
            return true;
        } else if (repository.existsByNome(nome)) {
            repository.deleteByNome(nome);
            return true;
        }
        return false;
    }

    @Transactional
    public boolean excluirPorIdOuNome(String idOuNome) {
        if (idOuNome == null || idOuNome.trim().isEmpty()) {
            return false;
        }
        String valor = idOuNome.trim();
        try {
            int id = Integer.parseInt(valor);
            if (repository.existsById(id)) {
                repository.deleteById(id);
                return true;
            }
        } catch (NumberFormatException ignored) {
        }
        return excluirPorNome(valor);
    }
}
