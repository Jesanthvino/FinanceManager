package com.financeapp.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double amount;
    private String category;
    private String description;

    
    private LocalDate date;

    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "user_id")
    private User user;

}
