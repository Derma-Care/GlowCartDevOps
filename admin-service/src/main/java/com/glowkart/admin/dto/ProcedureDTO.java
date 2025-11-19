package com.glowkart.admin.dto;

import lombok.Data;
import java.time.Instant;

@Data
public class ProcedureDTO {
    private String procedureId;  // mapped from DB 'id'
    private String procedureName;
    private Instant createdAt;
    private Instant updatedAt;
}
