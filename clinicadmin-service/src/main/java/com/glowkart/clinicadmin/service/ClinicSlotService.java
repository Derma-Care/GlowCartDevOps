package com.glowkart.clinicadmin.service;

import com.glowkart.clinicadmin.dto.*;
import com.glowkart.clinicadmin.model.ClinicSlot;
import com.glowkart.clinicadmin.repo.ClinicSlotRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ClinicSlotService {

    private final ClinicSlotRepository clinicSlotRepository;

    public ClinicSlotService(ClinicSlotRepository clinicSlotRepository) {
        this.clinicSlotRepository = clinicSlotRepository;
    }

    // GET available slots for next 15 days
    public AvailableSlotsResponse getAvailableSlots(String clinicId) {
        LocalDate today = LocalDate.now();
        List<String> dateList = new ArrayList<>();

        for (int i = 0; i < 15; i++) {
            dateList.add(today.plusDays(i).toString()); // YYYY-MM-DD
        }

        List<ClinicSlot> savedSlots = clinicSlotRepository.findByClinicIdAndDateIn(clinicId, dateList);

        List<ClinicSlotDTO> slotDTOs = savedSlots.stream().map(slot -> {
            ClinicSlotDTO dto = new ClinicSlotDTO();
            dto.setDate(slot.getDate());
            dto.setWorkingHours(slot.getWorkingHours());
            dto.setReason(slot.getReason());
            return dto;
        }).collect(Collectors.toList());

        return new AvailableSlotsResponse(dateList, slotDTOs);
    }

    // SAVE slots
    public void saveClinicSlots(SaveClinicSlotsRequest request) {
        LocalDate today = LocalDate.now();

        Map<String, ClinicSlotDTO> exceptionMap = new HashMap<>();
        if (request.getExceptions() != null) {
            for (ClinicSlotDTO dto : request.getExceptions()) {
                exceptionMap.put(dto.getDate(), dto);
            }
        }

        for (int i = 0; i < 15; i++) {
            String dateStr = today.plusDays(i).toString(); // YYYY-MM-DD

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
