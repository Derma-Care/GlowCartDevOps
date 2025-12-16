package com.glowkart.admin.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.glowkart.admin.dto.ApiResponse;
import com.glowkart.admin.dto.CityRequestDTO;
import com.glowkart.admin.dto.CityResponseDTO;
import com.glowkart.admin.model.City;
import com.glowkart.admin.repo.CityRepository;

@Service
public class CityServiceImpl implements CityService {

    @Autowired
    private CityRepository cityRepository;

    private CityResponseDTO convertToResponseDTO(City city) {
        return new CityResponseDTO(city.getId(), city.getName());
    }

    @Override
    public ApiResponse<CityResponseDTO> addCity(CityRequestDTO cityDTO) {
        if (cityDTO.getName() == null || cityDTO.getName().trim().isEmpty()) {
            return new ApiResponse<>(false, "City name cannot be empty", null, 400);
        }

        String cityName = cityDTO.getName().trim();

        if (cityRepository.findByNameIgnoreCase(cityName).isPresent()) {
            return new ApiResponse<>(false, "City already exists", null, 400);
        }

        City city = new City();
        city.setName(cityName);
        cityRepository.save(city);

        return new ApiResponse<>(true, "City added successfully", convertToResponseDTO(city), 200);
    }

    @Override
    public ApiResponse<List<CityResponseDTO>> getAllCities() {
        List<CityResponseDTO> cities = cityRepository.findAll()
                .stream()
                // Convert to DTO
                .map(this::convertToResponseDTO)
                // Use city name as key to remove duplicates
                .collect(Collectors.collectingAndThen(
                    Collectors.toMap(
                        CityResponseDTO::getName,   // key: city name
                        c -> c,                     // value: DTO itself
                        (existing, replacement) -> existing // if duplicate, keep first
                    ),
                    map -> map.values().stream()
                            .sorted((c1, c2) -> c1.getName().compareToIgnoreCase(c2.getName()))
                            .collect(Collectors.toList())
                ));

        return new ApiResponse<>(true, "Cities fetched successfully", cities, 200);
    }

}

