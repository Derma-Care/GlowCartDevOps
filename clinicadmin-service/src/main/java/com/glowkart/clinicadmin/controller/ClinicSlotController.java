package com.glowkart.clinicadmin.controller;

import com.glowkart.clinicadmin.dto.*;
import com.glowkart.clinicadmin.service.ClinicSlotService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/clinic-admin")
public class ClinicSlotController {

    private final ClinicSlotService clinicSlotService;

    public ClinicSlotController(ClinicSlotService clinicSlotService) {
        this.clinicSlotService = clinicSlotService;
    }

    @GetMapping("/available-slots")
    public ApiResponse<AvailableSlotsResponse> getAvailableSlots(
            @RequestParam String clinicId
    ) {
        AvailableSlotsResponse response =
                clinicSlotService.getAvailableSlots(clinicId);

        return new ApiResponse<>(
                true,
                "Slots fetched successfully",
                response,
                200
        );
    }

    @PostMapping("/save-slots")
    public ApiResponse<Void> saveClinicSlots(
            @RequestBody SaveClinicSlotsRequest request
    ) {
        clinicSlotService.saveClinicSlots(request);

        return new ApiResponse<>(
                true,
                "Clinic slots saved successfully",
                null,
                200
        );
    }
}
