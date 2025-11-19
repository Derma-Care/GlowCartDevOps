package com.glowkart.clinicadmin.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "doctors")
@CompoundIndex(
        name = "unique_doctor_per_clinic",
        def = "{'clinicId': 1, 'licenseNumber': 1, 'email': 1, 'contactNumber': 1}",
        unique = true
)
public class Doctor {

    @Id
    private String doctorId;

    private String clinicId;

    // Doctor personal details
    private String doctorName;
    private String licenseNumber;
    private String gender;
    private int experience;
    private String qualification;
    private String specialization;
    private String profileDescription;
    private String profilePictureUrl;

    // Procedure
    private String procedureId;
    private String procedureName;

    // Working schedule
    private String startDay;
    private String endDay;
    private String startTime;
    private String endTime;

    // Contact
    private String contactNumber;
    private String email;

    // Additional
    private List<String> expertise;
    private List<String> languages;
    private List<String> achievements;
}
