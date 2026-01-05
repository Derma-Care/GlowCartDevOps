package com.glowkart.customer.service;

import com.glowkart.customer.dto.CustomerProcedureOfferDTO;
import com.glowkart.customer.dto.ProcedureDTO;
import com.glowkart.customer.dto.ProcedurePackageDTO;
import com.glowkart.customer.dto.ProcedurePackageWithClinicsDTO;
import com.glowkart.customer.dto.ProcedurePricingDTO;
import com.glowkart.customer.feign.ProcedureServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProcedureIntegrationService {

    private final ProcedureServiceClient procedureServiceClient;

    // 1️⃣ Get all procedures (master list)
    public List<ProcedureDTO> getAllProcedures() {
        return procedureServiceClient.getAllProcedures().getData();
    }

    // 2️⃣ Get all packages (across all clinics)
    public List<ProcedurePackageDTO> getAllPackages() {
        return procedureServiceClient.getAllPackages().getData();
    }

    // 3️⃣ Get pricing for a procedure (best / starting price)
    public ProcedurePricingDTO getProcedurePricing(String procedureId) {
        return procedureServiceClient
                .getPricingByProcedure(procedureId)
                .getData();
    }

    // 4️⃣ Get procedure offers (clinic-agnostic, min/max per procedure)
    public List<CustomerProcedureOfferDTO> getProcedureOffers() {
        return procedureServiceClient.getProcedureOffers().getData();
    }

	public List<ProcedurePackageWithClinicsDTO> getAllPackagesWithClinics(double latitude, double longitude) {
		// TODO Auto-generated method stub
		return null;
	}
}
