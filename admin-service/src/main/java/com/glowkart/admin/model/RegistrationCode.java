package com.glowkart.admin.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "registration_codes")
public class RegistrationCode {

    @Id
    private String id;

    private String code;
    private boolean used;

    public RegistrationCode() {}

    public RegistrationCode(String code) {
        this.code = code;
        this.used = false;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public boolean isUsed() { return used; }
    public void setUsed(boolean used) { this.used = used; }
}
