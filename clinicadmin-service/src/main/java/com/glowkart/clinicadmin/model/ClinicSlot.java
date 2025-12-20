package com.glowkart.clinicadmin.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "clinicSlots")
public class ClinicSlot {

    @Id
    private String id;

    private String clinicId;
    private Date date;
    private Boolean workingHours;
    private String reason;

    // Constructors
    public ClinicSlot() {}

    public ClinicSlot(String clinicId, Date date, Boolean workingHours, String reason) {
        this.clinicId = clinicId;
        this.date = date;
        this.workingHours = workingHours;
        this.reason = reason;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getClinicId() { return clinicId; }
    public void setClinicId(String clinicId) { this.clinicId = clinicId; }

    public Date getDate() { return date; }
    public void setDate(Date date) { this.date = date; }

    public Boolean getWorkingHours() { return workingHours; }
    public void setWorkingHours(Boolean workingHours) { this.workingHours = workingHours; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
