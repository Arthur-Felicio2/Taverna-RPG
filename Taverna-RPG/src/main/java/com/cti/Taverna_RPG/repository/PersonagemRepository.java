package com.cti.Taverna_RPG.repository;

import com.cti.Taverna_RPG.model.Personagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PersonagemRepository extends JpaRepository<Personagem, Integer> {
    // JpaRepository já contém save(), findAll(), findById(), deleteById(), etc.
}