package com.cti.Taverna_RPG.repository;

import com.cti.Taverna_RPG.model.Personagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface PersonagemRepository extends JpaRepository<Personagem, Integer> {
    List<Personagem> findByClasseIgnoreCase(String classe);
    Optional<Personagem> findFirstByNomeIgnoreCase(String nome);
    Optional<Personagem> findByNome(String nome);
    boolean existsByNomeIgnoreCase(String nome);
    boolean existsByNome(String nome);

    @Modifying
    @Transactional
    void deleteByNomeIgnoreCase(String nome);

    @Modifying
    @Transactional
    void deleteByNome(String nome);
}
