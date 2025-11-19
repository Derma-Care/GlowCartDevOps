package com.glowkart.admin.dto;



import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class WheelSliceDto {

    private String id;
    private String option;
    private String src;

    public WheelSliceDto() {}

    public WheelSliceDto(String id, String option, String src) {
        this.id = id;
        this.option = option;
        this.src = src;
    }

    // Getters & Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getOption() { return option; }
    public void setOption(String option) { this.option = option; }

    public String getSrc() { return src; }
    public void setSrc(String src) { this.src = src; }
}
