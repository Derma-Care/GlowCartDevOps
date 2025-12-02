package com.glowkart.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationResponseDTO {
    private String code;
    private boolean used;
    private boolean valid;  // true only when used = true
    private int rank; // ⭐ NEW — Position of the code (1…N)
   
}
