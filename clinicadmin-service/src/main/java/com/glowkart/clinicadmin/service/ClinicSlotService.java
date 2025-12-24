package com.glowkart.clinicadmin.service;

import com.glowkart.clinicadmin.dto.*;
import com.glowkart.clinicadmin.exception.ResourceNotFoundException;
import com.glowkart.clinicadmin.feign.AdminServiceFeignClient;
import com.glowkart.clinicadmin.model.ClinicSlot;
import com.glowkart.clinicadmin.repo.ClinicSlotRepository;
import feign.FeignException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ClinicSlotService {

    private final ClinicSlotRepository clinicSlotRepository;
    private final AdminServiceFeignClient adminServiceFeignClient;

    public ClinicSlotService(
            ClinicSlotRepository clinicSlotRepository,
            AdminServiceFeignClient adminServiceFeignClient
    ) {
        this.clinicSlotRepository = clinicSlotRepository;
        this.adminServiceFeignClient = adminServiceFeignClient;
    }

    // --------------------------------
    // CLINIC VALIDATION (FEIGN)
    // --------------------------------
    private void validateClinicExists(String clinicId) {
        try {
            adminServiceFeignClient.getClinicById(clinicId);
        } catch (FeignException.NotFound ex) {
            throw new ResourceNotFoundException(
                    "CLINIC_NOT_FOUND",
                    "Clinic not found"
            );
        }
    }

    // --------------------------------
    // GET AVAILABLE SLOTS
    // --------------------------------
    public AvailableSlotsResponse getAvailableSlots(String clinicId) {

        // ✅ Validate clinic via admin-service
        validateClinicExists(clinicId);

        LocalDate today = LocalDate.now();
        List<String> dateList = new ArrayList<>();

        for (int i = 0; i < 30; i++) {
            dateList.add(today.plusDays(i).toString());
        }

        List<ClinicSlot> savedSlots =
                clinicSlotRepository.findByClinicIdAndDateIn(
                        clinicId, dateList
                );

        List<ClinicSlotDTO> slotDTOs = savedSlots.stream()
                .map(slot -> {
                    ClinicSlotDTO dto = new ClinicSlotDTO();
                    dto.setDate(slot.getDate());
                    dto.setWorkingHours(slot.getWorkingHours());
                    dto.setReason(slot.getReason());
                    return dto;
                })
                .collect(Collectors.toList());

        return new AvailableSlotsResponse(dateList, slotDTOs);
    }

    // --------------------------------
    // SAVE CLINIC SLOTS
    // --------------------------------
    public void saveClinicSlots(SaveClinicSlotsRequest request) {

        // ✅ Validate clinic via admin-service
        validateClinicExists(request.getClinicId());

        LocalDate today = LocalDate.now();

        Map<String, ClinicSlotDTO> exceptionMap = new HashMap<>();
        if (request.getExceptions() != null) {
            for (ClinicSlotDTO dto : request.getExceptions()) {
                exceptionMap.put(dto.getDate(), dto);
            }
        }

        for (int i = 0; i < 30; i++) {
            String dateStr = today.plusDays(i).toString();

            ClinicSlot slot = clinicSlotRepository
                    .findByClinicIdAndDate(request.getClinicId(), dateStr)
                    .orElseGet(() -> ClinicSlot.builder()
                            .clinicId(request.getClinicId())
                            .date(dateStr)
                            .build());

            if (exceptionMap.containsKey(dateStr)) {
                slot.setWorkingHours(false);
                slot.setReason(exceptionMap.get(dateStr).getReason());
            } else {
                slot.setWorkingHours(true);
                slot.setReason(null);
            }

            clinicSlotRepository.save(slot);
        }
    }
}
