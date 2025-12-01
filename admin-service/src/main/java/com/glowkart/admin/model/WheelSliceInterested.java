package com.glowkart.admin.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonInclude;

@Document(collection = "wheel_slices_interested")
public class WheelSliceInterested {

    @Id
    private String id;
    private String option;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String src;

    public WheelSliceInterested() {}

    public WheelSliceInterested(String id, String option, String src) {
        this.id = id;
        setOption(option);
        setSrc(src);
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
