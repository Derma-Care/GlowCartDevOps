package com.glowkart.clinicadmin.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DateWithDayDTO {
    private String date;
    private String dayOfWeek;
}
