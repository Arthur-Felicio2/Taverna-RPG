package com.cti.Taverna_RPG.repository;

import com.cti.Taverna_RPG.model.Personagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PersonagemRepository extends JpaRepository<Personagem, Integer> {
    List<Personagem> findAllByOrderByIdAsc();
    List<Personagem> findByClasseIgnoreCaseOrderByIdAsc(String classe);
    Optional<Personagem> findFirstByNomeIgnoreCase(String nome);
    Optional<Personagem> findByNome(String nome);
    boolean existsByNomeIgnoreCase(String nome);
    boolean existsByNomeIgnoreCaseAndIdNot(String nome, Integer id);
    boolean existsByNome(String nome);
}
