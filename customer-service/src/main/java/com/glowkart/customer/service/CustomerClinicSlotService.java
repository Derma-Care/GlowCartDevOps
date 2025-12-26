package com.glowkart.customer.service;

import com.glowkart.customer.dto.AvailableSlotsResponse;
import com.glowkart.customer.dto.CustomerClinicSlotsDTO;
import com.glowkart.customer.dto.ClinicSlotDTO;
import com.glowkart.customer.dto.DateWithDayDTO;
import com.glowkart.customer.dto.ApiResponse;
import com.glowkart.customer.feign.ClinicSlotClient;
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

