package com.glowkart.clinicadmin.service;

import java.util.List;

import com.glowkart.clinicadmin.dto.ApiResponse;
import com.glowkart.clinicadmin.dto.ClinicEnquiryDTO;
import com.glowkart.clinicadmin.model.ClinicEnquiry;

public interface ClinicEnquiryService {

    ApiResponse<ClinicEnquiry> createEnquiry(ClinicEnquiryDTO dto);

    ApiResponse<ClinicEnquiry> updateEnquiry(String enquiryId, ClinicEnquiryDTO dto);

    ApiResponse<List<ClinicEnquiry>> getAllEnquiries();

    ApiResponse<List<ClinicEnquiry>> getEnquiriesByClinicId(String clinicId);

    ApiResponse<ClinicEnquiry> getEnquiryById(String id);

    ApiResponse<Void> deleteEnquiry(String id);
}
