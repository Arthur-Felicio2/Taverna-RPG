package com.cti.Taverna_RPG.service;

import com.cti.Taverna_RPG.exception.NomeDuplicadoException;
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

    @Transactional(readOnly = true)
    public List<Personagem> listarTodos(String classe) {
        if (classe != null && !classe.trim().isEmpty()) {
            return repository.findByClasseIgnoreCaseOrderByIdAsc(classe.trim());
        }
        return repository.findAllByOrderByIdAsc();
    }

    @Transactional(readOnly = true)
    public Optional<Personagem> buscarPorId(Integer id) {
        if (id == null || id <= 0) {
            return Optional.empty();
        }
        return repository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Personagem> buscarPorNome(String nome) {
        if (nome == null || nome.trim().isEmpty()) {
            return Optional.empty();
        }
        String nomeLimpo = nome.trim();
        return repository.findFirstByNomeIgnoreCase(nomeLimpo)
                .or(() -> repository.findByNome(nome));
    }

    @Transactional(readOnly = true)
    public Optional<Personagem> buscarPorIdOuNome(String idOuNome) {
        if (idOuNome == null || idOuNome.trim().isEmpty()) {
            return Optional.empty();
        }
        String valor = idOuNome.trim();
        try {
            int id = Integer.parseInt(valor);
            if (id > 0) {
                Optional<Personagem> porId = repository.findById(id);
                if (porId.isPresent()) {
                    return porId;
                }
            }
        } catch (NumberFormatException ignored) {
            // Não é número, prossegue para busca textual
        }
        return buscarPorNome(valor);
    }

    @Transactional
    public Personagem salvar(Personagem personagem) {
        if (personagem == null) {
            throw new IllegalArgumentException("Os dados do personagem são obrigatórios.");
        }
        String nomeLimpo = trimToNull(personagem.getNome());
        if (nomeLimpo == null) {
            throw new IllegalArgumentException("O nome do personagem é obrigatório.");
        }
        if (repository.existsByNomeIgnoreCase(nomeLimpo)) {
            throw new NomeDuplicadoException("Já existe um personagem cadastrado com o nome: " + nomeLimpo);
        }

        // Garante criação de novo registro mesmo que o payload envie um id
        personagem.setId(null);
        personagem.setNome(nomeLimpo);
        personagem.setRaca(trimToNull(personagem.getRaca()));
        personagem.setClasse(trimToNull(personagem.getClasse()));
        personagem.setAlinhamento(trimToNull(personagem.getAlinhamento()));

        return repository.save(personagem);
    }

    @Transactional
    public Optional<Personagem> atualizar(Integer id, Personagem dadosNovos) {
        if (id == null || id <= 0) {
            return Optional.empty();
        }
        if (dadosNovos == null) {
            throw new IllegalArgumentException("Os dados para atualização são obrigatórios.");
        }
        return repository.findById(id).map(existente -> {
            mesclarCampos(existente, dadosNovos);
            return repository.save(existente);
        });
    }

    @Transactional
    public Optional<Personagem> atualizarPorIdOuNome(String idOuNome, Personagem dadosNovos) {
        if (dadosNovos == null) {
            throw new IllegalArgumentException("Os dados para atualização são obrigatórios.");
        }
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
        String novoNome = trimToNull(dadosNovos.getNome());
        if (novoNome != null) {
            if (!novoNome.equalsIgnoreCase(existente.getNome())
                    && repository.existsByNomeIgnoreCaseAndIdNot(novoNome, existente.getId())) {
                throw new NomeDuplicadoException("Já existe outro personagem cadastrado com o nome: " + novoNome);
            }
            existente.setNome(novoNome);
        }
        String novaRaca = trimToNull(dadosNovos.getRaca());
        if (novaRaca != null) {
            existente.setRaca(novaRaca);
        }
        String novaClasse = trimToNull(dadosNovos.getClasse());
        if (novaClasse != null) {
            existente.setClasse(novaClasse);
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
        String novoAlinhamento = trimToNull(dadosNovos.getAlinhamento());
        if (novoAlinhamento != null) {
            existente.setAlinhamento(novoAlinhamento);
        }
    }

    @Transactional
    public boolean excluirPorId(Integer id) {
        if (id == null || id <= 0) {
            return false;
        }
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return true;
        }
        return false;
    }

    @Transactional
    public boolean excluirPorNome(String nome) {
        if (nome == null || nome.trim().isEmpty()) {
            return false;
        }
        Optional<Personagem> encontrado = buscarPorNome(nome);
        if (encontrado.isPresent()) {
            repository.delete(encontrado.get());
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
            if (id > 0 && repository.existsById(id)) {
                repository.deleteById(id);
                return true;
            }
        } catch (NumberFormatException ignored) {
            // Não é número, prossegue para exclusão por nome
        }
        return excluirPorNome(valor);
    }

    private String trimToNull(String valor) {
        if (valor == null) {
            return null;
        }
        String trimmed = valor.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
