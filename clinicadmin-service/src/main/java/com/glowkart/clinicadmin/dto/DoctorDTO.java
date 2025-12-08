package com.glowkart.clinicadmin.dto;

import lombok.Data;
import jakarta.validation.constraints.*;
import java.util.List;

@Data
public class DoctorDTO {

	  private String doctorName;
	    private String registrationNumber;
	    private String associationNumber;
	    private String associationName;
	    private String specialization;
}
