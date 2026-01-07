package com.glowkart.customer.dto;

import java.time.Instant;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ClinicProcedureLinkDTO {

	 private String clinicId;
	    private String name;
	    private String address;
	    private String city;
	    private String whatsappNumber;
	    private String email;
	    private Instant createdAt;

	    private String status;
	    private String username;

	    private double hospitalOverallRating;
	    private String contactNumber;
	    private String openingTime;
	    private String closingTime;

	    private String hospitalLogo; 

	    private String website;
	    private String licenseNumber;
	    private String issuingAuthority;

	    private boolean recommended;

	    private String clinicType;
	    private String medicinesSoldOnSite;
	    private String drugLicenseFormType;

	    private String hasPharmacist;
	    private String subscription;

	    private double latitude;
	    private double longitude;
	    
	    private String state;
	    private boolean online; // match field from admin-service response
	    private int nabhScore;
	    private String branch;
	    private String walkthrough;

	    private String role;
//	    private Map<String, List<String>> permissions;

	    private String instagramHandle;
	    private String twitterHandle;
	    private String facebookHandle;

	    private String primaryContactPerson;
	    private String alternateContactNumber;
	    private String designation;
	    private String clinicManagementSoftwareUsage;

//	    private String bankAccountName;
//	    private String bankAccountNumber;
//	    private String ifscCode;
//	    private String upiId;
//	    private String panNumber;

	    private List<DoctorDTO> doctorsList;  // NEW

	 // ✅ New field for procedure pricing
	    private ProcedurePricingDTO procedurePricing;
	    private Double maxOfferPercentage; // For "Upto X% OFF"

	 // After
	    private String distanceInKm;
}
