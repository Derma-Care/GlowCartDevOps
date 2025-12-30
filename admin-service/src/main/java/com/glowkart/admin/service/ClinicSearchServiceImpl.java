package com.glowkart.admin.service;

import com.glowkart.admin.dto.ClinicPublicDTO;
import com.glowkart.admin.model.Clinic;
import com.glowkart.admin.repo.ClinicRepository;
import com.glowkart.admin.util.ClinicMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClinicSearchServiceImpl implements ClinicSearchService {

    private final ClinicRepository clinicRepository;

    @Override
    public List<ClinicPublicDTO> getVerifiedClinicsByState(String state, Boolean online) {
        List<Clinic> clinics;

        if (online != null) {
            // Fetch clinics by state, status, and online flag directly from DB
            clinics = clinicRepository.findByStateIgnoreCaseAndStatusIgnoreCaseAndOnline(
                    state,
                    "VERIFIED",
                    online
            );
        } else {
            // Fetch clinics by state and status only
            clinics = clinicRepository.findByStateIgnoreCaseAndStatusIgnoreCase(
                    state,
                    "VERIFIED"
            );
        }

        // Map to DTO
        return clinics.stream()
                      .map(ClinicMapper::toPublicDTO)
                      .toList();
    }
}
