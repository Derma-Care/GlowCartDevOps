package com.glowkart.customer.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CustomerClinicSlotsDTO {

    private String clinicId;
//    private List<DateWithDayDTO> dates;          // List of next 30 days with dayOfWeek
    private List<ClinicSlotDTO> slots;           // Working hours, exceptions
}
