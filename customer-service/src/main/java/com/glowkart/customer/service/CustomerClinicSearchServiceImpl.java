package com.glowkart.customer.service;

import com.glowkart.customer.dto.ClinicProcedureLinkDTO;
import com.glowkart.customer.dto.ClinicPublicDTO;
import com.glowkart.customer.feign.AdminClinicClient;
import com.glowkart.customer.feign.ProcedureServiceClient;
import com.glowkart.customer.geo.ReverseGeoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CustomerClinicSearchServiceImpl
        implements CustomerClinicSearchService {

    private final ReverseGeoService reverseGeoService;
    private final AdminClinicClient adminClinicClient;
    private final ProcedureServiceClient procedureServiceClient;

    @Override
    public List<ClinicProcedureLinkDTO> findClinicsForProcedure(
            double latitude,
            double longitude,
            String procedureId) {

        // 1️⃣ Resolve state from lat/lng
        String state = reverseGeoService.resolveState(latitude, longitude);

        // 2️⃣ Fetch clinics in that state
        List<ClinicPublicDTO> clinicsInState =
                adminClinicClient.getClinicsByState(state).getData();

        // 3️⃣ Fetch clinic IDs offering this procedure
        Set<String> clinicIds =
                Set.copyOf(
                        procedureServiceClient
                                .getClinicIdsByProcedure(procedureId)
                                .getData()
                );

        // 4️⃣ Filter + map response
        return clinicsInState.stream()
                .filter(c -> clinicIds.contains(c.getClinicId()))
                .map(c ->
                        new ClinicProcedureLinkDTO(
                                c.getClinicId(),
                                c.getName(),
                                c.getCity(),
                                c.getState()
                        )
                )
                .toList();
    }
}
