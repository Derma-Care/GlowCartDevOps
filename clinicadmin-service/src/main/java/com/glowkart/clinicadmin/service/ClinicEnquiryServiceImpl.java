package com.glowkart.clinicadmin.service;

import java.util.List;
import java.util.stream.Collectors;

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

    // ✅ CREATE
    @Override
    public ApiResponse<ClinicEnquiryDTO> createEnquiry(ClinicEnquiryDTO dto) {

        validateClinic(dto.getClinicId());

        ClinicEnquiry enquiry = mapToEntity(dto);
        ClinicEnquiry saved = repository.save(enquiry);

        return new ApiResponse<>(
                true,
                "Enquiry created successfully",
                mapToDTO(saved),
                HttpStatus.CREATED.value()
        );
    }

    // ✅ UPDATE
    @Override
    public ApiResponse<ClinicEnquiryDTO> updateEnquiry(String enquiryId, ClinicEnquiryDTO dto) {

        ClinicEnquiry existing = repository.findById(enquiryId)
                .orElseThrow(() -> new RuntimeException("Enquiry not found with id: " + enquiryId));

        if (!existing.getClinicId().equals(dto.getClinicId())) {
            validateClinic(dto.getClinicId());
        }

        updateEntity(existing, dto);

        ClinicEnquiry updated = repository.save(existing);

        return new ApiResponse<>(
                true,
                "Enquiry updated successfully",
                mapToDTO(updated),
                HttpStatus.OK.value()
        );
    }

    // ✅ GET ALL
    @Override
    public ApiResponse<List<ClinicEnquiryDTO>> getAllEnquiries() {

        List<ClinicEnquiryDTO> list = repository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return new ApiResponse<>(
                true,
                "Enquiries fetched successfully",
                list,
                HttpStatus.OK.value()
        );
    }

    // ✅ GET BY CLINIC ID
    @Override
    public ApiResponse<List<ClinicEnquiryDTO>> getEnquiriesByClinicId(String clinicId) {

        List<ClinicEnquiryDTO> list = repository.findByClinicId(clinicId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return new ApiResponse<>(
                true,
                "Enquiries fetched successfully",
                list,
                HttpStatus.OK.value()
        );
    }

    // ✅ GET BY ID
    @Override
    public ApiResponse<ClinicEnquiryDTO> getEnquiryById(String id) {

        ClinicEnquiry enquiry = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enquiry not found with id: " + id));

        return new ApiResponse<>(
                true,
                "Enquiry fetched successfully",
                mapToDTO(enquiry),
                HttpStatus.OK.value()
        );
    }

    // ✅ DELETE
    @Override
    public ApiResponse<Void> deleteEnquiry(String id) {

        if (!repository.existsById(id)) {
            throw new RuntimeException("Enquiry not found with id: " + id);
        }

        repository.deleteById(id);

        return new ApiResponse<>(
                true,
                "Enquiry deleted successfully",
                null,
                HttpStatus.OK.value()
        );
    }

    // ================= PRIVATE METHODS =================

    private void validateClinic(String clinicId) {
        ApiResponse<ClinicResponse> clinicResponse =
                adminFeignClient.getClinicById(clinicId);

        if (clinicResponse == null || !clinicResponse.isSuccess()) {
            throw new RuntimeException("Invalid clinicId. Clinic not found");
        }
    }

    private ClinicEnquiry mapToEntity(ClinicEnquiryDTO dto) {
        ClinicEnquiry enquiry = new ClinicEnquiry();
        updateEntity(enquiry, dto);
        return enquiry;
    }

    private void updateEntity(ClinicEnquiry enquiry, ClinicEnquiryDTO dto) {
        enquiry.setClinicId(dto.getClinicId());
        enquiry.setClinicName(dto.getClinicName());
        enquiry.setClinicAddress(dto.getClinicAddress());
        enquiry.setClinicMobile(dto.getClinicMobile());
        enquiry.setContactName(dto.getContactName());
        enquiry.setContactMobile(dto.getContactMobile());
        enquiry.setContactEmail(dto.getContactEmail());
        enquiry.setMessage(dto.getMessage());
    }

    private ClinicEnquiryDTO mapToDTO(ClinicEnquiry enquiry) {
        ClinicEnquiryDTO dto = new ClinicEnquiryDTO();
        dto.setId(enquiry.getId());   // ✅ Important
        dto.setClinicId(enquiry.getClinicId());
        dto.setClinicName(enquiry.getClinicName());
        dto.setClinicAddress(enquiry.getClinicAddress());
        dto.setClinicMobile(enquiry.getClinicMobile());
        dto.setContactName(enquiry.getContactName());
        dto.setContactMobile(enquiry.getContactMobile());
        dto.setContactEmail(enquiry.getContactEmail());
        dto.setMessage(enquiry.getMessage());
        return dto;
    }
}
