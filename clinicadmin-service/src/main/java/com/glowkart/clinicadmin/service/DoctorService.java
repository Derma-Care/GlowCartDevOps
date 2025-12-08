//package com.glowkart.clinicadmin.service;
//
//import com.glowkart.clinicadmin.dto.DoctorDTO;
//import com.glowkart.clinicadmin.dto.ProcedurePricingDTO;
//import com.glowkart.clinicadmin.feign.ProcedureServiceFeignClient;
//import com.glowkart.clinicadmin.model.Doctor;
//import com.glowkart.clinicadmin.repo.DoctorRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.dao.DuplicateKeyException;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//import java.util.stream.Collectors;
//
//@Service
//@RequiredArgsConstructor
//public class DoctorService {
//
//    private final DoctorRepository doctorRepo;
//    private final ProcedureServiceFeignClient procedureClient;
//
//    /**
//     * CREATE DOCTOR
//     */
//    public DoctorDTO createDoctor(DoctorDTO dto) {
//
//        // Check duplicates per clinic
//        validateUniquePerClinic(dto, null);
//
//        String procedureName = fetchProcedureName(dto.getProcedureId(), dto.getClinicId());
//
//        Doctor doctor = toEntity(dto);
//        doctor.setProcedureName(procedureName);
//
//        Doctor saved = doctorRepo.save(doctor);
//        return toDto(saved);
//    }
//
//    /**
//     * UPDATE DOCTOR
//     */
//    public DoctorDTO updateDoctor(String doctorId, DoctorDTO dto) {
//        Doctor doctor = doctorRepo.findById(doctorId)
//                .orElseThrow(() -> new RuntimeException("Doctor not found"));
//
//        // Check duplicates per clinic ignoring current doctor
//        validateUniquePerClinic(dto, doctorId);
//
//        String procedureName = fetchProcedureName(dto.getProcedureId(), dto.getClinicId());
//
//        updateEntity(doctor, dto);
//        doctor.setProcedureName(procedureName);
//
//        Doctor updated = doctorRepo.save(doctor);
//        return toDto(updated);
//    }
//
//    /**
//     * GET DOCTORS BY CLINIC
//     */
//    public List<DoctorDTO> getDoctorsByClinic(String clinicId) {
//        return doctorRepo.findByClinicId(clinicId)
//                .stream()
//                .map(this::toDto)
//                .collect(Collectors.toList());
//    }
//
//    /**
//     * GET SINGLE DOCTOR
//     */
//    public DoctorDTO getDoctor(String doctorId) {
//        Doctor doctor = doctorRepo.findById(doctorId)
//                .orElseThrow(() -> new RuntimeException("Doctor not found"));
//        return toDto(doctor);
//    }
//
//    /**
//     * DELETE DOCTOR
//     */
//    public void deleteDoctor(String doctorId) {
//        if (!doctorRepo.existsById(doctorId))
//            throw new RuntimeException("Doctor not found");
//
//        doctorRepo.deleteById(doctorId);
//    }
//
//    /**
//     * VALIDATION: ensure unique per clinic
//     */
//    private void validateUniquePerClinic(DoctorDTO dto, String ignoreDoctorId) {
//        doctorRepo.findByClinicIdAndLicenseNumber(dto.getClinicId(), dto.getLicenseNumber())
//                .filter(d -> ignoreDoctorId == null || !d.getDoctorId().equals(ignoreDoctorId))
//                .ifPresent(d -> { throw new DuplicateKeyException("License number already exists in this clinic"); });
//
//        doctorRepo.findByClinicIdAndEmail(dto.getClinicId(), dto.getEmail())
//                .filter(d -> ignoreDoctorId == null || !d.getDoctorId().equals(ignoreDoctorId))
//                .ifPresent(d -> { throw new DuplicateKeyException("Email already exists in this clinic"); });
//
//        doctorRepo.findByClinicIdAndContactNumber(dto.getClinicId(), dto.getContactNumber())
//                .filter(d -> ignoreDoctorId == null || !d.getDoctorId().equals(ignoreDoctorId))
//                .ifPresent(d -> { throw new DuplicateKeyException("Contact number already exists in this clinic"); });
//    }
//
//    /**
//     * MAPPER: DTO → ENTITY
//     */
//    private Doctor toEntity(DoctorDTO dto) {
//        Doctor d = new Doctor();
//        updateEntity(d, dto);
//        return d;
//    }
//
//    private void updateEntity(Doctor doctor, DoctorDTO dto) {
//        doctor.setClinicId(dto.getClinicId());
//        doctor.setDoctorName(dto.getDoctorName());
//        doctor.setLicenseNumber(dto.getLicenseNumber());
//        doctor.setGender(dto.getGender());
//        doctor.setExperience(dto.getExperience());
//        doctor.setQualification(dto.getQualification());
//        doctor.setSpecialization(dto.getSpecialization());
//        doctor.setProfileDescription(dto.getProfileDescription());
//        doctor.setProfilePictureUrl(dto.getProfilePictureUrl());
//        doctor.setProcedureId(dto.getProcedureId());
//        doctor.setStartDay(dto.getStartDay());
//        doctor.setEndDay(dto.getEndDay());
//        doctor.setStartTime(dto.getStartTime());
//        doctor.setEndTime(dto.getEndTime());
//        doctor.setContactNumber(dto.getContactNumber());
//        doctor.setEmail(dto.getEmail());
//        doctor.setExpertise(dto.getExpertise());
//        doctor.setLanguages(dto.getLanguages());
//        doctor.setAchievements(dto.getAchievements());
//    }
//
//    /**
//     * MAPPER: ENTITY → DTO
//     */
//    private DoctorDTO toDto(Doctor doctor) {
//        DoctorDTO dto = new DoctorDTO();
//        dto.setDoctorId(doctor.getDoctorId());
//        dto.setClinicId(doctor.getClinicId());
//        dto.setDoctorName(doctor.getDoctorName());
//        dto.setLicenseNumber(doctor.getLicenseNumber());
//        dto.setGender(doctor.getGender());
//        dto.setExperience(doctor.getExperience());
//        dto.setQualification(doctor.getQualification());
//        dto.setSpecialization(doctor.getSpecialization());
//        dto.setProfileDescription(doctor.getProfileDescription());
//        dto.setProfilePictureUrl(doctor.getProfilePictureUrl());
//        dto.setProcedureId(doctor.getProcedureId());
//        dto.setProcedureName(doctor.getProcedureName());
//        dto.setStartDay(doctor.getStartDay());
//        dto.setEndDay(doctor.getEndDay());
//        dto.setStartTime(doctor.getStartTime());
//        dto.setEndTime(doctor.getEndTime());
//        dto.setContactNumber(doctor.getContactNumber());
//        dto.setEmail(doctor.getEmail());
//        dto.setExpertise(doctor.getExpertise());
//        dto.setLanguages(doctor.getLanguages());
//        dto.setAchievements(doctor.getAchievements());
//        return dto;
//    }
//
//    /**
//     * Fetch procedure name using Feign
//     */
//    private String fetchProcedureName(String procedureId, String clinicId) {
//        List<ProcedurePricingDTO> list = procedureClient
//                .getByClinic(clinicId)
//                .getData();
//
//        return list.stream()
//                .filter(p -> p.getProcedureId().equals(procedureId))
//                .findFirst()
//                .map(ProcedurePricingDTO::getProcedureName)
//                .orElseThrow(() -> new RuntimeException("Invalid procedureId"));
//    }
//}
