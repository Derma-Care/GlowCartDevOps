package com.glowkart.admin.client;


import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.glowkart.admin.dto.ApiResponse;
import com.glowkart.admin.dto.ClinicEnquiryDTO;


@FeignClient(name = "clinic-admin-service")
public interface ClinicAdminFeignClient {

    @GetMapping("/clinic-admin/clinic-enquiries/getAll")
    ApiResponse<List<ClinicEnquiryDTO>> getAllEnquiries();

    @GetMapping("/clinic-admin/clinic-enquiries/{id}")
    ApiResponse<ClinicEnquiryDTO> getEnquiryById(@PathVariable("id") String id);

    @GetMapping("/clinic-admin/clinic-enquiries/clinic/{clinicId}")
    ApiResponse<List<ClinicEnquiryDTO>> getEnquiriesByClinicId(@PathVariable("clinicId") String clinicId);

    @PostMapping("/clinic-admin/clinic-enquiries/create")
    ApiResponse<ClinicEnquiryDTO> createEnquiry(@RequestBody ClinicEnquiryDTO dto);

    @PutMapping("/clinic-admin/clinic-enquiries/{id}")
    ApiResponse<ClinicEnquiryDTO> updateEnquiry(@PathVariable("id") String id,
                                                @RequestBody ClinicEnquiryDTO dto);

    @DeleteMapping("/clinic-admin/clinic-enquiries/{id}")
    ApiResponse<Void> deleteEnquiry(@PathVariable("id") String id);
}


