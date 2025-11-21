package com.glowkart.procedure.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.Instant;

@Data
public class ProcedureDTO {
    private String procedureId;

    @NotBlank(message = "Procedure name is required")
    private String procedureName;

    // Read-only timestamps
    private Instant createdAt;
    private Instant updatedAt;
}
