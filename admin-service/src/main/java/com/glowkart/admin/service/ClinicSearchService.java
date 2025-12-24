package com.glowkart.admin.service;

import com.glowkart.admin.dto.ClinicPublicDTO;
import java.util.List;

public interface ClinicSearchService {

    List<ClinicPublicDTO> getVerifiedClinicsByState(String state);
}
