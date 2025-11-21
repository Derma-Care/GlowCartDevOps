package com.glowkart.clinicadmin.controller;

import com.glowkart.clinicadmin.dto.ApiResponse;
import com.glowkart.clinicadmin.dto.DoctorDTO;
import com.glowkart.clinicadmin.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/clinic-admin")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @PostMapping("/doctor/create")
    public ApiResponse<DoctorDTO> create(@RequestBody DoctorDTO dto) {
        DoctorDTO created = doctorService.createDoctor(dto);
        return new ApiResponse<>(true, "Doctor Created Successfully", created);
    }

    @GetMapping("/doctor/list/{clinicId}")
    public ApiResponse<List<DoctorDTO>> list(@PathVariable String clinicId) {
        List<DoctorDTO> doctors = doctorService.getDoctorsByClinic(clinicId);
        return new ApiResponse<>(true, "Doctor List Fetched Successfully", doctors);
    }

    @GetMapping("/doctor/get/{doctorId}")
    public ApiResponse<DoctorDTO> get(@PathVariable String doctorId) {
        DoctorDTO doctor = doctorService.getDoctor(doctorId);
        return new ApiResponse<>(true, "Doctor Fetched Successfully", doctor);
    }

    @PutMapping("/doctor/update/{doctorId}")
    public ApiResponse<DoctorDTO> update(@PathVariable String doctorId, @RequestBody DoctorDTO dto) {
        DoctorDTO updated = doctorService.updateDoctor(doctorId, dto);
        return new ApiResponse<>(true, "Doctor Updated Successfully", updated);
    }

    @DeleteMapping("/doctor/delete/{doctorId}")
    public ApiResponse<Void> delete(@PathVariable String doctorId) {
        doctorService.deleteDoctor(doctorId);
        return new ApiResponse<>(true, "Doctor Deleted Successfully", null);
    }
}
