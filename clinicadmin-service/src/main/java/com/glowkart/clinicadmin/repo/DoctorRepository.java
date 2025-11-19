package com.glowkart.clinicadmin.repo;

import com.glowkart.clinicadmin.model.Doctor;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends MongoRepository<Doctor, String> {

    List<Doctor> findByClinicId(String clinicId);

    Optional<Doctor> findByClinicIdAndLicenseNumber(String clinicId, String licenseNumber);

    Optional<Doctor> findByClinicIdAndEmail(String clinicId, String email);

    Optional<Doctor> findByClinicIdAndContactNumber(String clinicId, String contactNumber);
}
