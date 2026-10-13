package com.cti.Taverna_RPG.repository;

import com.cti.Taverna_RPG.model.Personagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PersonagemRepository extends JpaRepository<Personagem, Integer> {
    List<Personagem> findByClasseIgnoreCase(String classe);
}