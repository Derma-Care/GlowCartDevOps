package com.glowkart.admin.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.glowkart.admin.dto.WheelSliceDto;
import com.glowkart.admin.service.WheelSliceService;

@RestController
@RequestMapping("/admin")
public class WheelSliceController {

    private final WheelSliceService service;

    public WheelSliceController(WheelSliceService service) {
        this.service = service;
    }

    @GetMapping("/api/wheel-slices")
    public List<WheelSliceDto> getAllSlices() {
        return service.getAllSlices();
    }

    @GetMapping("/api/wheel-slices/{id}")
    public ResponseEntity<WheelSliceDto> getSlice(@PathVariable String id) {
        return service.getSliceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/api/wheel-slices/create")
    public WheelSliceDto createSlice(@RequestBody WheelSliceDto dto) {
        return service.createSlice(dto);
    }

    @PutMapping("/api/wheel-slices/{id}")
    public ResponseEntity<WheelSliceDto> updateSlice(@PathVariable String id, @RequestBody WheelSliceDto dto) {
        try {
            return ResponseEntity.ok(service.updateSlice(id, dto));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/api/wheel-slices/{id}")
    public ResponseEntity<Void> deleteSlice(@PathVariable String id) {
        service.deleteSlice(id);
        return ResponseEntity.noContent().build();
    }
}

