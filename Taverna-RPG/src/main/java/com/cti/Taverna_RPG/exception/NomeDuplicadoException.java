package com.cti.Taverna_RPG.exception;

/**
 * Exceção lançada quando há tentativa de cadastrar ou renomear um personagem
 * para um nome já existente no códice.
 */
public class NomeDuplicadoException extends RuntimeException {

    public NomeDuplicadoException(String message) {
        super(message);
    }
}
