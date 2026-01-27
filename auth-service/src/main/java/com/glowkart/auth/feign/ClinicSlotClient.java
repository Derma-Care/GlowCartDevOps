package com.glowkart.auth.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.glowkart.auth.dto.ApiResponse;
import com.glowkart.auth.dto.AvailableSlotsResponse;

@FeignClient(name = "clinicadmin-service", contextId = "clinicSlotsClient")
public interface ClinicSlotClient {

    @GetMapping("/clinic-admin/available-slots")
    ApiResponse<AvailableSlotsResponse> getAvailableSlots(
            @RequestParam String clinicId
    );
}
