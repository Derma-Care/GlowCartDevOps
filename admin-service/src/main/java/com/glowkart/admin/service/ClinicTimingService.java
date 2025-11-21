package com.glowkart.admin.service;

import java.util.List;

import com.glowkart.admin.dto.ClinicTimingDTO;

public interface ClinicTimingService {

    /** Create ONE slot (if closingTime is blank) or a WHOLE RANGE.  
     *  Always return every slot that was persisted. */
    List<ClinicTimingDTO> createTimings(ClinicTimingDTO dto);

    /** List all stored slots (auto‑seed on first call). */
    List<ClinicTimingDTO> getAllTimings();
}
