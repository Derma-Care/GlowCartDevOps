package com.glowkart.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CityResponseDTO {
    private String id;
    private String name;  // What client receives
}
