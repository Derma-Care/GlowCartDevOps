package com.glowkart.customer.service;

import com.glowkart.customer.dto.ProcedureDTO;
import com.glowkart.customer.dto.ProcedurePackageDTO;
import com.glowkart.customer.dto.ProcedurePricingDTO;
import com.glowkart.customer.feign.ProcedureServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProcedureIntegrationService {

    private final ProcedureServiceClient procedureServiceClient;

    // 1️⃣ Get all procedures
    public List<ProcedureDTO> getAllProcedures() {
        return procedureServiceClient.getAllProcedures().getData();
    }

    // 2️⃣ Get all packages for a clinic
    public List<ProcedurePackageDTO> getPackagesByClinic(String clinicId) {
        return procedureServiceClient.getPackagesByClinic(clinicId).getData();
    }

    // 3️⃣ Get all procedure pricing for a clinic
    public List<ProcedurePricingDTO> getPricingByClinic(String clinicId) {
        return procedureServiceClient.getPricingByClinic(clinicId).getData();
    }

    // 4️⃣ Get detailed pricing for a specific procedure & clinic
    public ProcedurePricingDTO getProcedurePricing(String procedureId, String clinicId) {
        return procedureServiceClient.getPricingByProcedureAndClinic(procedureId, clinicId).getData();
    }

    // 5️⃣ Get procedure offers and dynamic offer range for a clinic
    public Map<String, Object> getProcedureOffersWithRange(String clinicId) {
        List<ProcedureDTO> procedures = getAllProcedures();
        List<ProcedurePricingDTO> pricingList = getPricingByClinic(clinicId);

        Map<String, String> procedureOffers = new LinkedHashMap<>();
        double globalMin = 100;
        double globalMax = 0;

        for (ProcedureDTO procedure : procedures) {
            String procedureId = procedure.getProcedureId();
            List<ProcedurePricingDTO> pricesForProcedure = pricingList.stream()
                    .filter(p -> p.getProcedureId().equals(procedureId))
                    .toList();

            double minDiscount = 0;
            double maxDiscount = 0;

            if (!pricesForProcedure.isEmpty()) {
                minDiscount = pricesForProcedure.stream()
                        .mapToDouble(ProcedurePricingDTO::getDiscountPercentage)
                        .min().orElse(0);

                maxDiscount = pricesForProcedure.stream()
                        .mapToDouble(ProcedurePricingDTO::getDiscountPercentage)
                        .max().orElse(0);
            }

            procedureOffers.put(procedure.getProcedureName(), (int) minDiscount + "% - " + (int) maxDiscount + "% OFF");

            // Update global min/max
            if (minDiscount < globalMin) globalMin = minDiscount;
            if (maxDiscount > globalMax) globalMax = maxDiscount;
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("offerRange", (int) globalMin + "% - " + (int) globalMax + "%");
        response.put("procedures", procedureOffers);

        return response;
    }
}
