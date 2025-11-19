package com.glowkart.customer.dto;

import lombok.Data;

@Data
public class CompleteRegistrationDTO {

    private String spinRewardId;
    private String spinRewardValue;
    private String spinRewardImage;

    private String prizePostScreenshot;
    private String followScreenshot;
    private String address;
}
