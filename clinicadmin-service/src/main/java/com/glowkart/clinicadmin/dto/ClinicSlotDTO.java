package com.glowkart.clinicadmin.dto;

import java.util.Date;

public class ClinicSlotDTO {

    private Date date;
    private Boolean workingHours;
    private String reason;

    // Constructors
    public ClinicSlotDTO() {}

    public ClinicSlotDTO(Date date, Boolean workingHours, String reason) {
        this.date = date;
        this.workingHours = workingHours;
        this.reason = reason;
    }

    // Getters and Setters
    public Date getDate() { return date; }
    public void setDate(Date date) { this.date = date; }

    public Boolean getWorkingHours() { return workingHours; }
    public void setWorkingHours(Boolean workingHours) { this.workingHours = workingHours; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
