//package com.glowkart.clinicadmin.service;
//
//import org.springframework.stereotype.Service;
//
//import com.glowkart.clinicadmin.dto.ApiResponse;
//import com.glowkart.clinicadmin.dto.ClinicResponse;
//import com.glowkart.clinicadmin.exception.BadRequestException;
//import com.glowkart.clinicadmin.feign.AdminServiceFeignClient;
//
//import feign.FeignException;
//
//@Service
//public class ClinicValidationService {
//
//    private final AdminServiceFeignClient adminServiceFeignClient;
//
//    public ClinicValidationService(AdminServiceFeignClient adminServiceFeignClient) {
//        this.adminServiceFeignClient = adminServiceFeignClient;
//    }
//
//    public boolean isClinicValid(String clinicId) {
//        try {
//            ApiResponse<ClinicResponse> response = adminServiceFeignClient.getClinicById(clinicId);
//            return response != null && response.isSuccess();
//        } catch (FeignException.NotFound ex) {
//            // Map 404 to false
//            return false;
//        } catch (FeignException ex) {
//            // Any other Feign exception
//            throw new BadRequestException("FEIGN_ERROR", "Error calling admin-service: " + ex.getMessage());
//        }
//    }
//}
