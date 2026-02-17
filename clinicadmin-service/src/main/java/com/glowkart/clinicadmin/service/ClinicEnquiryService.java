package com.glowkart.clinicadmin.service;

import java.util.List;

import com.glowkart.clinicadmin.dto.ApiResponse;
import com.glowkart.clinicadmin.dto.ClinicEnquiryDTO;

public interface ClinicEnquiryService {

    ApiResponse<ClinicEnquiryDTO> createEnquiry(ClinicEnquiryDTO dto);

    ApiResponse<ClinicEnquiryDTO> updateEnquiry(String enquiryId, ClinicEnquiryDTO dto);

    ApiResponse<List<ClinicEnquiryDTO>> getAllEnquiries();

    ApiResponse<List<ClinicEnquiryDTO>> getEnquiriesByClinicId(String clinicId);

    ApiResponse<ClinicEnquiryDTO> getEnquiryById(String id);

    ApiResponse<Void> deleteEnquiry(String id);
}
