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

        // 4️⃣ Map clinics with clinic-specific pricing safely
        return clinicsInState.stream()
                .filter(c -> clinicIds.contains(c.getClinicId()))
                .map(c -> {
                    // Fetch clinic-specific procedure pricing
                    ProcedurePricingDTO pricing = procedureServiceClient
                            .getPricingByProcedureForClinic(procedureId, c.getClinicId())
                            .getData();

                    // Calculate distance in km
                    double distanceKm = calculateDistanceInKm(latitude, longitude, c.getLatitude(), c.getLongitude());

                    // Format distance: meters if < 1km, km otherwise
                    String distanceStr;
                    if (distanceKm < 1) {
                        int distanceMeters = (int) Math.round(distanceKm * 1000);
                        distanceStr = distanceMeters + " M";
                    } else {
                        distanceStr = Math.round(distanceKm) + " KM";
                    }

                    return ClinicProcedureLinkDTO.builder()
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
                            .doctorsList(c.getDoctorsList())
                            .procedurePricing(pricing)
                            .distanceInKm(distanceStr) // ✅ formatted distance
                            .createdAt(c.getCreatedAt())
                            .status(c.getStatus())
                            .username(c.getUsername())
                            .role(c.getRole())
                            .build();
                })

                .toList();
    }

    /**
     * Calculate distance between two lat/lng points in kilometers
     */
    private double calculateDistanceInKm(double lat1, double lon1, double lat2, double lon2) {
        final int EARTH_RADIUS_KM = 6371; // Radius of the earth

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_KM * c;
    }
}
