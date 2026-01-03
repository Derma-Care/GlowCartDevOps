package com.glowkart.customer.service;

import com.glowkart.customer.dto.ClinicProcedureLinkDTO;
import com.glowkart.customer.dto.ClinicPublicDTO;
import com.glowkart.customer.dto.ProcedurePricingDTO;
import com.glowkart.customer.feign.AdminClinicClient;
import com.glowkart.customer.feign.ProcedureServiceClient;
import com.glowkart.customer.geo.ReverseGeoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
@Service
@RequiredArgsConstructor
public class CustomerClinicSearchServiceImpl implements CustomerClinicSearchService {

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

        // 2️⃣ Fetch verified clinics in that state, ignore offline flag in Feign
        List<ClinicPublicDTO> clinicsInState =
                adminClinicClient.getClinicsByState(state, null).getData();

        if (clinicsInState == null || clinicsInState.isEmpty()) return List.of();

        // 3️⃣ Filter only online clinics
        clinicsInState = clinicsInState.stream()
                .filter(ClinicPublicDTO::isOnline)
                .toList();

        if (clinicsInState.isEmpty()) return List.of();

        // 4️⃣ Fetch clinic IDs offering this procedure
        Set<String> clinicIdsOfferingProcedure = Set.copyOf(
                procedureServiceClient.getClinicIdsByProcedure(procedureId).getData()
        );

        // 5️⃣ Map clinics with procedure pricing and calculate distance
        return clinicsInState.stream()
                .filter(c -> clinicIdsOfferingProcedure.contains(c.getClinicId()))
                .map(c -> {
                    // Fetch clinic-specific procedure pricing
                    var pricing = procedureServiceClient
                            .getPricingByProcedureForClinic(procedureId, c.getClinicId())
                            .getData();

                    // Calculate distance in KM
                    double distanceKm = calculateDistanceInKm(latitude, longitude,
                            c.getLatitude(), c.getLongitude());

                    String distanceStr = distanceKm < 1
                            ? (int) Math.round(distanceKm * 1000) + " M"
                            : Math.round(distanceKm) + " KM";

                    // Inject hospital rating dynamically
                    double rating = c.getHospitalOverallRating(); // already set from admin-service

                    return ClinicProcedureLinkDTO.builder()
                            .clinicId(c.getClinicId())
                            .name(c.getName())
                            .address(c.getAddress())
                            .city(c.getCity())
                            .state(c.getState())
                            .latitude(c.getLatitude())
                            .longitude(c.getLongitude())
                            .online(c.isOnline())
                            .contactNumber(c.getContactNumber())
                            .whatsappNumber(c.getWhatsappNumber())
                            .email(c.getEmail())
                            .openingTime(c.getOpeningTime())
                            .closingTime(c.getClosingTime())
                            .hospitalLogo(c.getHospitalLogo())
                            .hospitalOverallRating(rating)
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
                            .doctorsList(c.getDoctorsList())
                            .procedurePricing(pricing)
                            .distanceInKm(distanceStr)
                            .createdAt(c.getCreatedAt())
                            .status(c.getStatus())
                            .username(c.getUsername())
                            .role(c.getRole())
                            .build();
                })
                // 6️⃣ Sort clinics by distance
                .sorted((c1, c2) -> {
                    double d1 = parseDistance(c1.getDistanceInKm());
                    double d2 = parseDistance(c2.getDistanceInKm());
                    return Double.compare(d1, d2);
                })
                .toList();
    }

    /** Convert distance string like "500 M" or "2 KM" to KM as double */
    private double parseDistance(String distanceStr) {
        if (distanceStr.endsWith("M")) {
            return Double.parseDouble(distanceStr.replace(" M", "")) / 1000.0;
        } else if (distanceStr.endsWith("KM")) {
            return Double.parseDouble(distanceStr.replace(" KM", ""));
        }
        return Double.MAX_VALUE;
    }

    /** Calculate distance between two lat/lng points in KM */
    private double calculateDistanceInKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
