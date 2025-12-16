package com.glowkart.admin.service;

import java.util.List;
import com.glowkart.admin.dto.ApiResponse;
import com.glowkart.admin.dto.CityRequestDTO;
import com.glowkart.admin.dto.CityResponseDTO;

public interface CityService {
    ApiResponse<CityResponseDTO> addCity(CityRequestDTO cityDTO);
    ApiResponse<List<CityResponseDTO>> getAllCities();
}
