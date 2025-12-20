package com.glowkart.clinicadmin.service;

import com.glowkart.clinicadmin.model.ClinicSlot;
import com.glowkart.clinicadmin.repo.ClinicSlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class ClinicSlotService {

    @Autowired
    private ClinicSlotRepository repository;

    // Get next N days slots (include placeholders for missing days)
    public List<ClinicSlot> getNextNDaysSlots(String clinicId, int days) {
        List<ClinicSlot> slots = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (int i = 0; i < days; i++) {
            LocalDate day = today.plusDays(i);
            Date startOfDay = Date.from(day.atStartOfDay(ZoneId.of("UTC")).toInstant());
            Date endOfDay = Date.from(day.plusDays(1).atStartOfDay(ZoneId.of("UTC")).toInstant());

            List<ClinicSlot> daySlots = repository.findByClinicIdAndDateBetween(clinicId, startOfDay, endOfDay);

            if (daySlots.isEmpty()) {
                ClinicSlot placeholder = new ClinicSlot();
                placeholder.setClinicId(clinicId);
                placeholder.setDate(startOfDay);
                placeholder.setWorkingHours(null);
                placeholder.setReason(null);
                slots.add(placeholder);
            } else {
                slots.addAll(daySlots);
            }
        }
        return slots;
    }

    // Batch save or update
    public void saveOrUpdateSlots(String clinicId, List<ClinicSlot> slots) {
        List<ClinicSlot> slotsToSave = new ArrayList<>();

        for (ClinicSlot slot : slots) {
            Date startOfDay = Date.from(slot.getDate().toInstant());
            Date endOfDay = Date.from(slot.getDate().toInstant());

            List<ClinicSlot> existing = repository.findByClinicIdAndDateBetween(clinicId, startOfDay, endOfDay);

            if (existing.isEmpty()) {
                slot.setClinicId(clinicId);
                slotsToSave.add(slot);
            } else {
                ClinicSlot existingSlot = existing.get(0);
                existingSlot.setWorkingHours(slot.getWorkingHours());
                existingSlot.setReason(slot.getReason());
                slotsToSave.add(existingSlot);
            }
        }

        repository.saveAll(slotsToSave);
    }
}
