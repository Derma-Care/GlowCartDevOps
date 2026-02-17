package com.glowkart.admin.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.glowkart.admin.client.ClinicAdminFeignClient;
import com.glowkart.admin.dto.ApiResponse;
import com.glowkart.admin.dto.ClinicEnquiryDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminClinicEnquiryServiceImpl implements AdminClinicEnquiryService {

    private final ClinicAdminFeignClient clinicAdminFeignClient;

    @Override
    public ApiResponse<List<ClinicEnquiryDTO>> getAllEnquiries() {
        return clinicAdminFeignClient.getAllEnquiries();
    }

    @Override
    public ApiResponse<ClinicEnquiryDTO> getEnquiryById(String enquiryId) {
        return clinicAdminFeignClient.getEnquiryById(enquiryId);
    }

    @Override
    public ApiResponse<List<ClinicEnquiryDTO>> getEnquiriesByClinicId(String clinicId) {
        return clinicAdminFeignClient.getEnquiriesByClinicId(clinicId);
    }

    @Override
    public ApiResponse<ClinicEnquiryDTO> createEnquiry(ClinicEnquiryDTO dto) {
        return clinicAdminFeignClient.createEnquiry(dto);
    }

    @Override
    public ApiResponse<ClinicEnquiryDTO> updateEnquiry(String enquiryId, ClinicEnquiryDTO dto) {
        return clinicAdminFeignClient.updateEnquiry(enquiryId, dto);
    }

    @Override
    public ApiResponse<Void> deleteEnquiry(String enquiryId) {
        return clinicAdminFeignClient.deleteEnquiry(enquiryId);
    }
}
