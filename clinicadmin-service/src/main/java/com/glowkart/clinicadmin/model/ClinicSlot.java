package com.glowkart.clinicadmin.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "clinic_slots")
@CompoundIndex(name = "clinic_date_idx", def = "{'clinicId': 1, 'date': 1}", unique = true)
public class ClinicSlot {

    @Id
    private String id;

    private String clinicId;

    // Store date as "YYYY-MM-DD" string
    private String date;

    private Boolean workingHours;

    private String reason;
}
