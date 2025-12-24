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

        // 4️⃣ Filter + FULL map response
        return clinicsInState.stream()
                .filter(c -> clinicIds.contains(c.getClinicId()))
                .map(c -> ClinicProcedureLinkDTO.builder()
                        .clinicId(c.getClinicId())
                        .name(c.getName())
                        .address(c.getAddress())
                        .city(c.getCity())
                        .state(c.getState())
                        .latitude(c.getLatitude())
                        .longitude(c.getLongitude())

                        .contactNumber(c.getContactNumber())
                        .whatsappNumber(c.getWhatsappNumber())
                        .email(c.getEmail())

                        .openingTime(c.getOpeningTime())
                        .closingTime(c.getClosingTime())

                        .hospitalLogo(c.getHospitalLogo())
                        .hospitalOverallRating(c.getHospitalOverallRating())

                        .website(c.getWebsite())
                        .licenseNumber(c.getLicenseNumber())
                        .issuingAuthority(c.getIssuingAuthority())

                        .clinicType(c.getClinicType())
                        .medicinesSoldOnSite(c.getMedicinesSoldOnSite())
                        .drugLicenseFormType(c.getDrugLicenseFormType())
                        .hasPharmacist(c.getHasPharmacist())

                        .recommended(c.isRecommended())
                        .subscription(c.getSubscription())
                        .nabhScore(c.getNabhScore())
                        .branch(c.getBranch())
                        .walkthrough(c.getWalkthrough())

                        .instagramHandle(c.getInstagramHandle())
                        .twitterHandle(c.getTwitterHandle())
                        .facebookHandle(c.getFacebookHandle())

                        .primaryContactPerson(c.getPrimaryContactPerson())
                        .designation(c.getDesignation())
                        .clinicManagementSoftwareUsage(c.getClinicManagementSoftwareUsage())

                        .bankAccountName(c.getBankAccountName())
                        .bankAccountNumber(c.getBankAccountNumber())
                        .ifscCode(c.getIfscCode())
                        .upiId(c.getUpiId())
                        .panNumber(c.getPanNumber())

                        // ✅ Map doctors list directly
                        .doctorsList(c.getDoctorsList())

                        .createdAt(c.getCreatedAt())
                        .status(c.getStatus())
                        .username(c.getUsername())
                        .role(c.getRole())
                        .permissions(c.getPermissions())

                        .build()
                )
                .toList();

    }

}
