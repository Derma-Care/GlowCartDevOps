package com.glowkart.admin.service;

import java.util.List;

import com.glowkart.admin.dto.ApiResponse;
import com.glowkart.admin.dto.ClinicEnquiryDTO;

public interface AdminClinicEnquiryService {

    ApiResponse<List<ClinicEnquiryDTO>> getAllEnquiries();

    ApiResponse<ClinicEnquiryDTO> getEnquiryById(String enquiryId);

    ApiResponse<List<ClinicEnquiryDTO>> getEnquiriesByClinicId(String clinicId);

    ApiResponse<ClinicEnquiryDTO> createEnquiry(ClinicEnquiryDTO dto);

    ApiResponse<ClinicEnquiryDTO> updateEnquiry(String enquiryId, ClinicEnquiryDTO dto);

    ApiResponse<Void> deleteEnquiry(String enquiryId);
}
