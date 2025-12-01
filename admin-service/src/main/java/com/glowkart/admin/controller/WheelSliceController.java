package com.glowkart.admin.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.glowkart.admin.dto.WheelSliceDto;
import com.glowkart.admin.service.WheelSliceService;

@RestController
@RequestMapping("/admin")
public class WheelSliceController {

    private final WheelSliceService service;

    public WheelSliceController(WheelSliceService service) {
        this.service = service;
    }

    // ================== YES ==================
    @GetMapping("/api/wheel-slices/yes")
    public List<WheelSliceDto> getYesSlices() {
        return service.getYesSlices();
    }

    @GetMapping("/api/wheel-slices/yes/{id}")
    public ResponseEntity<WheelSliceDto> getYesSlice(@PathVariable String id) {
        return service.getYesSliceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/api/wheel-slices/yes")
    public WheelSliceDto createYesSlice(@RequestBody WheelSliceDto dto) {
        return service.createYesSlice(dto);
    }

    @PutMapping("/api/wheel-slices/yes/{id}")
    public ResponseEntity<WheelSliceDto> updateYesSlice(@PathVariable String id, @RequestBody WheelSliceDto dto) {
        try {
            return ResponseEntity.ok(service.updateYesSlice(id, dto));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/api/wheel-slices/yes/{id}")
    public ResponseEntity<Void> deleteYesSlice(@PathVariable String id) {
        service.deleteYesSlice(id);
        return ResponseEntity.noContent().build();
    }

    // ================== INTERESTED ==================
    @GetMapping("/api/wheel-slices/interested")
    public List<WheelSliceDto> getInterestedSlices() {
        return service.getInterestedSlices();
    }

    @GetMapping("/api/wheel-slices/interested/{id}")
    public ResponseEntity<WheelSliceDto> getInterestedSlice(@PathVariable String id) {
        return service.getInterestedSliceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/api/wheel-slices/interested")
    public WheelSliceDto createInterestedSlice(@RequestBody WheelSliceDto dto) {
        return service.createInterestedSlice(dto);
    }

    @PutMapping("/api/wheel-slices/interested/{id}")
    public ResponseEntity<WheelSliceDto> updateInterestedSlice(@PathVariable String id, @RequestBody WheelSliceDto dto) {
        try {
            return ResponseEntity.ok(service.updateInterestedSlice(id, dto));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/api/wheel-slices/interested/{id}")
    public ResponseEntity<Void> deleteInterestedSlice(@PathVariable String id) {
        service.deleteInterestedSlice(id);
        return ResponseEntity.noContent().build();
    }
}
