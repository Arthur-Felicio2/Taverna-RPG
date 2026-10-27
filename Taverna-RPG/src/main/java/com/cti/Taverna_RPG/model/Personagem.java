package com.cti.Taverna_RPG.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "personagens")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Personagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "Nome", nullable = false, unique = true)
    private String nome;

    @Column(name = "Raca")
    private String raca;

    @Column(name = "Classe")
    private String classe;

    @Column(name = "Nivel")
    private Integer nivel;

    @Column(name = "Pontos_Vida")
    private Integer pontosVida;

    @Column(name = "Pontos_Mana")
    private Integer pontosMana;

    @Column(name = "Atributo_Forca")
    private Integer atributoForca;

    @Column(name = "Atributo_Destreza")
    private Integer atributoDestreza;

    @Column(name = "Atributo_Inteligencia")
    private Integer atributoInteligencia;

    @Column(name = "Alinhamento")
    private String alinhamento;

    @CreationTimestamp
    @Column(name = "data_criacao", updatable = false)
    private LocalDateTime dataCriacao;
}
