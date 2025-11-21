package com.glowkart.admin.service;

import com.glowkart.admin.dto.StoreUpdatedQAInClinicsDTO;
import com.glowkart.admin.util.Response;

public interface StoreUpdatedQAInClinicsService {

    // ✅ Update Q&A by ID
    Response updateQaAndAnswers(String id, StoreUpdatedQAInClinicsDTO dto);

    // ✅ Get Q&A by ID
    Response getById(String id);

    // ✅ Get all Q&A
    Response getAll();

    // ✅ Delete Q&A by ID
    Response deleteById(String id);

    // ✅ Save Q&A
    Response saveQaAndAnswers(StoreUpdatedQAInClinicsDTO dto);
}
