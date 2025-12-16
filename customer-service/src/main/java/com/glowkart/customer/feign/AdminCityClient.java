package com.glowkart.customer.feign;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.glowkart.customer.dto.ApiResponse;
import com.glowkart.customer.dto.CityRequestDTO;
import com.glowkart.customer.dto.CityResponseDTO;

@FeignClient(name = "admin-service", contextId = "cityClient")
public interface AdminCityClient {

    // Fetch all cities
    @GetMapping("/admin/all/cities")
    ApiResponse<List<CityResponseDTO>> getAllCities();

    // Add a city
    @PostMapping("/admin/cities")
    ApiResponse<CityResponseDTO> addCity(@RequestBody CityRequestDTO cityDTO);
}
