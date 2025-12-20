package com.glowkart.clinicadmin.controller;

import com.glowkart.clinicadmin.model.ClinicSlot;
import com.glowkart.clinicadmin.service.ClinicSlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/clinic-admin")
public class ClinicSlotController {

    @Autowired
    private ClinicSlotService service;

    // Fetch next 15 days slots (with placeholders)
    @GetMapping("/{clinicId}/slots/next15days")
    public List<ClinicSlot> getNext15DaysSlots(@PathVariable String clinicId) {
        return service.getNextNDaysSlots(clinicId, 15);
    }

    // Batch save/update slots
    @PostMapping("/{clinicId}/slots/batch")
    public String saveOrUpdateBatch(@PathVariable String clinicId, @RequestBody List<ClinicSlot> slots) {
        service.saveOrUpdateSlots(clinicId, slots);
        return "Batch save/update completed successfully!";
    }
}
