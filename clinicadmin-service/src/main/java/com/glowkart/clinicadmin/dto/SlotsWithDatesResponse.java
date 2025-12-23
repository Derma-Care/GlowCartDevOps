package com.glowkart.clinicadmin.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SlotsWithDatesResponse {
    private List<ClinicSlotDTO> clinicSlots;
    private List<String> dates;

    public SlotsWithDatesResponse(List<ClinicSlotDTO> clinicSlots, List<String> dates) {
        this.clinicSlots = clinicSlots;
        this.dates = dates;
    }

    public List<ClinicSlotDTO> getClinicSlots() {
        return clinicSlots;
    }

    public void setClinicSlots(List<ClinicSlotDTO> clinicSlots) {
        this.clinicSlots = clinicSlots;
    }

    public List<String> getDates() {
        return dates;
    }

    public void setDates(List<String> dates) {
        this.dates = dates;
    }
}
