package com.glowkart.auth.service;

import com.glowkart.auth.dto.ApiResponse;
import com.glowkart.auth.dto.AvailableSlotsResponse;
import com.glowkart.auth.dto.ClinicSlotDTO;
import com.glowkart.auth.dto.CustomerClinicSlotsDTO;
import com.glowkart.auth.dto.DateWithDayDTO;
import com.glowkart.auth.feign.ClinicSlotClient;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

import feign.FeignException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomerClinicSlotService {

    private final ClinicSlotClient clinicSlotClient;

    public CustomerClinicSlotsDTO getClinicSlots(String clinicId) {

        ApiResponse<AvailableSlotsResponse> response =
                clinicSlotClient.getAvailableSlots(clinicId);

        return new CustomerClinicSlotsDTO(
                clinicId,
                response.getData().getSlots()
        );
    }
}

