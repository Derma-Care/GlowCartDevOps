package com.glowkart.admin.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "service_ads")
public class ServiceAds {

    @Id
    private String id;

    private String clinicId;     // ✅ NEW
    private String clinicName;   // ✅ NEW

    private String type;    
    private String s3Key;   
    private String title;   
}
