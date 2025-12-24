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
    public List<ClinicPublicDTO> getVerifiedClinicsByState(String state) {

        return clinicRepository
                .findByStateIgnoreCaseAndStatusIgnoreCase(state, "VERIFIED")
                .stream()
                .map(ClinicMapper::toPublicDTO)
                .toList();
    }
}
