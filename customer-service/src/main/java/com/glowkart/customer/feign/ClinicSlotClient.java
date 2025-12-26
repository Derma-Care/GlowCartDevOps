package com.glowkart.customer.feign;

import com.glowkart.customer.dto.AvailableSlotsResponse;
import com.glowkart.customer.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "clinicadmin-service", contextId = "clinicSlotsClient")
public interface ClinicSlotClient {

    @GetMapping("/clinic-admin/available-slots")
    ApiResponse<AvailableSlotsResponse> getAvailableSlots(
            @RequestParam String clinicId
    );
}
