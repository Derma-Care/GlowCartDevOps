package com.glowkart.admin.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "glowkart_admins")
public class Admin {
    @Id
    private String id;
    private String mobileNumber;
    private String userName;
    private String password; // Will be hashed, never sent in responses
}