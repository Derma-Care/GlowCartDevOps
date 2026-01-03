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
    private final ClinicService clinicService; // inject ClinicService to reuse rating logic

    @Override
    public List<ClinicPublicDTO> getVerifiedClinicsByState(String state, Boolean online) {
        List<Clinic> clinics;

        if (online != null) {
            clinics = clinicRepository.findByStateIgnoreCaseAndStatusIgnoreCaseAndOnline(
                    state, "VERIFIED", online
            );
        } else {
            clinics = clinicRepository.findByStateIgnoreCaseAndStatusIgnoreCase(
                    state, "VERIFIED"
            );
        }

        // Map to DTO without rating
        return clinics.stream()
                      .map(ClinicMapper::toPublicDTO)
                      .toList();
    }

    @Override
    public double getClinicAverageRating(String clinicId) {
        return clinicService.getClinicAverageRating(clinicId);
    }
}

