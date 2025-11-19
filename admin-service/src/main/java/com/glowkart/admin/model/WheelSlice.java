package com.glowkart.admin.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonInclude;

@Document(collection = "wheel_slices")
public class WheelSlice {

    @Id
    private String id;

    private String option;  // frontend option

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String src;  // Base64 image

    public WheelSlice() {}

    public WheelSlice(String id, String option, String src) {
        this.id = id;
        this.option = option;
        this.src = (option != null && option.contains("%")) ? null : src;
    }

    // Getters & Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getOption() { return option; }
    public void setOption(String option) {
        this.option = option;
        if (option != null && option.contains("%")) {
            this.src = null;
        }
    }

    public String getSrc() { return src; }
    public void setSrc(String src) {
        if (option != null && option.contains("%")) {
            this.src = null;
        } else {
            this.src = src;
        }
    }
}
