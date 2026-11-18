package com.cti.Taverna_RPG.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "personagens",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_personagens_nome", columnNames = "nome")
        }
)
@Getter
@Setter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
@AllArgsConstructor
public class Personagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "nome", nullable = false, unique = true)
    private String nome;

    @Column(name = "raca")
    private String raca;

    @Column(name = "classe")
    private String classe;

    @Min(value = 1, message = "O nível deve ser maior ou igual a 1.")
    @Column(name = "nivel")
    private Integer nivel;

    @Min(value = 0, message = "Os pontos de vida não podem ser negativos.")
    @Column(name = "pontos_vida")
    private Integer pontosVida;

    @Min(value = 0, message = "Os pontos de mana não podem ser negativos.")
    @Column(name = "pontos_mana")
    private Integer pontosMana;

    @Min(value = 1, message = "O atributo Força deve ser maior ou igual a 1.")
    @Column(name = "atributo_forca")
    private Integer atributoForca;

    @Min(value = 1, message = "O atributo Destreza deve ser maior ou igual a 1.")
    @Column(name = "atributo_destreza")
    private Integer atributoDestreza;

    @Min(value = 1, message = "O atributo Inteligência deve ser maior ou igual a 1.")
    @Column(name = "atributo_inteligencia")
    private Integer atributoInteligencia;

    @Column(name = "alinhamento")
    private String alinhamento;

    @CreationTimestamp
    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;
}
