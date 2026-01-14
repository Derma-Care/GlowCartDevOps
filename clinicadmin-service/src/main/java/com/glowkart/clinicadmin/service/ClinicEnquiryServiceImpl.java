package com.glowkart.clinicadmin.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.glowkart.clinicadmin.dto.ApiResponse;
import com.glowkart.clinicadmin.dto.ClinicEnquiryDTO;
import com.glowkart.clinicadmin.dto.ClinicResponse;
import com.glowkart.clinicadmin.feign.AdminServiceFeignClient;
import com.glowkart.clinicadmin.model.ClinicEnquiry;
import com.glowkart.clinicadmin.repo.ClinicEnquiryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ClinicEnquiryServiceImpl implements ClinicEnquiryService {

    private final ClinicEnquiryRepository repository;
    private final AdminServiceFeignClient adminFeignClient;

    // --------------------------------------------------
    // CREATE ENQUIRY (Feign Validation)
    // --------------------------------------------------
    @Override
    public ApiResponse<ClinicEnquiry> createEnquiry(ClinicEnquiryDTO dto) {

        ApiResponse<ClinicResponse> clinicResponse =
                adminFeignClient.getClinicById(dto.getClinicId());

        if (clinicResponse == null || !clinicResponse.isSuccess()) {
            throw new RuntimeException("Invalid clinicId. Clinic not found");
        }

        ClinicEnquiry enquiry = new ClinicEnquiry();
        enquiry.setClinicId(dto.getClinicId());
        enquiry.setClinicName(dto.getClinicName());
        enquiry.setClinicAddress(dto.getClinicAddress());
        enquiry.setClinicMobile(dto.getClinicMobile());
        enquiry.setContactName(dto.getContactName());
        enquiry.setContactMobile(dto.getContactMobile());
        enquiry.setContactEmail(dto.getContactEmail());
        enquiry.setMessage(dto.getMessage());

        ClinicEnquiry saved = repository.save(enquiry);

        return new ApiResponse<>(
                true,
                "Enquiry created successfully",
                saved,
                HttpStatus.CREATED.value()
        );
    }

    // --------------------------------------------------
    // UPDATE ENQUIRY
    // --------------------------------------------------
    @Override
    public ApiResponse<ClinicEnquiry> updateEnquiry(String enquiryId, ClinicEnquiryDTO dto) {

        ClinicEnquiry enquiry = repository.findById(enquiryId)
                .orElseThrow(() -> new RuntimeException("Enquiry not found"));

        // Validate clinicId if changed
        if (!enquiry.getClinicId().equals(dto.getClinicId())) {

            ApiResponse<ClinicResponse> clinicResponse =
                    adminFeignClient.getClinicById(dto.getClinicId());

            if (clinicResponse == null || !clinicResponse.isSuccess()) {
                throw new RuntimeException("Invalid clinicId. Clinic not found");
            }

            enquiry.setClinicId(dto.getClinicId());
        }

        enquiry.setClinicName(dto.getClinicName());
        enquiry.setClinicAddress(dto.getClinicAddress());
        enquiry.setClinicMobile(dto.getClinicMobile());
        enquiry.setContactName(dto.getContactName());
        enquiry.setContactMobile(dto.getContactMobile());
        enquiry.setContactEmail(dto.getContactEmail());
        enquiry.setMessage(dto.getMessage());

        ClinicEnquiry updated = repository.save(enquiry);

        return new ApiResponse<>(
                true,
                "Enquiry updated successfully",
                updated,
                HttpStatus.OK.value()
        );
    }

    // --------------------------------------------------
    // GET ALL
    // --------------------------------------------------
    @Override
    public ApiResponse<List<ClinicEnquiry>> getAllEnquiries() {

        return new ApiResponse<>(
                true,
                "Enquiries fetched successfully",
                repository.findAll(),
                HttpStatus.OK.value()
        );
    }

    // --------------------------------------------------
    // GET BY CLINIC ID
    // --------------------------------------------------
    @Override
    public ApiResponse<List<ClinicEnquiry>> getEnquiriesByClinicId(String clinicId) {

        return new ApiResponse<>(
                true,
                "Enquiries fetched successfully",
                repository.findByClinicId(clinicId),
                HttpStatus.OK.value()
        );
    }

    // --------------------------------------------------
    // GET BY ID
    // --------------------------------------------------
    @Override
    public ApiResponse<ClinicEnquiry> getEnquiryById(String id) {

        ClinicEnquiry enquiry = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enquiry not found"));

        return new ApiResponse<>(
                true,
                "Enquiry fetched successfully",
                enquiry,
                HttpStatus.OK.value()
        );
    }

    // --------------------------------------------------
    // DELETE
    // --------------------------------------------------
    @Override
    public ApiResponse<Void> deleteEnquiry(String id) {

        if (!repository.existsById(id)) {
            throw new RuntimeException("Enquiry not found");
        }

        repository.deleteById(id);

        return new ApiResponse<>(
                true,
                "Enquiry deleted successfully",
                null,
                HttpStatus.OK.value()
        );
    }
}
