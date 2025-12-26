package com.glowkart.customer.controller;

import com.glowkart.customer.dto.ApiResponse;
import com.glowkart.customer.dto.CustomerClinicSlotsDTO;
import com.glowkart.customer.service.CustomerClinicSlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class CustomerClinicSlotController {

    private final CustomerClinicSlotService slotService;

    @GetMapping("/customer/clinic/slots")
    public ApiResponse<CustomerClinicSlotsDTO> getClinicSlots(
            @RequestParam String clinicId
    ) {
        CustomerClinicSlotsDTO dto = slotService.getClinicSlots(clinicId);

        return new ApiResponse<>(
                true,
                "Clinic slots fetched successfully",
                dto
        );
    }
}
