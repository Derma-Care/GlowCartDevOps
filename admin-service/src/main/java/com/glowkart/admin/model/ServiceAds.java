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

    private String type;    // image / video
    private String s3Key;   // S3 object key
    private String title;   // ad title
}
