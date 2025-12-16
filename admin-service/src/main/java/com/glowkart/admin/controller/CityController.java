package com.glowkart.admin.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.glowkart.admin.dto.ApiResponse;
import com.glowkart.admin.dto.CityRequestDTO;
import com.glowkart.admin.dto.CityResponseDTO;
import com.glowkart.admin.service.CityService;


@RestController
@RequestMapping("/admin")
public class CityController {

    @Autowired
    private CityService cityService;

    @PostMapping("/cities")
    public ApiResponse<CityResponseDTO> addCity(@RequestBody CityRequestDTO cityDTO) {
        return cityService.addCity(cityDTO);
    }

    @GetMapping("/all/cities")
    public ApiResponse<List<CityResponseDTO>> getAllCities() {
        return cityService.getAllCities();
    }
}
