package com.glowkart.customer.service;

import com.glowkart.customer.dto.ClinicDetailsDTO;
import com.glowkart.customer.dto.ClinicProcedureLinkDTO;
import com.glowkart.customer.dto.ClinicPublicDTO;
import com.glowkart.customer.dto.ProcedurePackageDTO;
import com.glowkart.customer.dto.ProcedurePackageWithClinicsDTO;
import com.glowkart.customer.dto.ProcedurePricingDTO;
import com.glowkart.customer.feign.AdminClinicClient;
import com.glowkart.customer.feign.ProcedureServiceClient;
import com.glowkart.customer.geo.ReverseGeoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CustomerClinicSearchServiceImpl implements CustomerClinicSearchService {

    private final ReverseGeoService reverseGeoService;
    private final AdminClinicClient adminClinicClient;
    private final ProcedureServiceClient procedureServiceClient;

    // ============================
    // Find clinics offering a procedure
    // ============================
    @Override
    public List<ClinicProcedureLinkDTO> findClinicsForProcedure(double latitude, double longitude, String procedureId) {

        String state = reverseGeoService.resolveState(latitude, longitude);
        List<ClinicPublicDTO> clinicsInState = adminClinicClient.getClinicsByState(state, null).getData();

        if (clinicsInState == null || clinicsInState.isEmpty()) return Collections.emptyList();

        clinicsInState = clinicsInState.stream()
                .filter(ClinicPublicDTO::isOnline)
                .toList();

        if (clinicsInState.isEmpty()) return Collections.emptyList();

        List<String> clinicIds = procedureServiceClient.getClinicIdsByProcedure(procedureId).getData();
        if (clinicIds == null || clinicIds.isEmpty()) return Collections.emptyList();

        Set<String> clinicIdsOfferingProcedure = Set.copyOf(clinicIds);

        return clinicsInState.stream()
                .filter(c -> clinicIdsOfferingProcedure.contains(c.getClinicId()))
                .map(c -> mapClinicWithPricing(c, latitude, longitude, procedureId, true))
                .sorted((c1, c2) -> Double.compare(parseDistance(c1.getDistanceInKm()), parseDistance(c2.getDistanceInKm())))
                .toList();
    }

    // ============================
    // Find clinics offering a package
    // ============================
    @Override
    public List<ClinicProcedureLinkDTO> findClinicsForPackage(double latitude, double longitude, String packageId) {

        String state = reverseGeoService.resolveState(latitude, longitude);
        List<ClinicPublicDTO> clinicsInState = adminClinicClient.getClinicsByState(state, null).getData();

        if (clinicsInState == null || clinicsInState.isEmpty()) return Collections.emptyList();

        clinicsInState = clinicsInState.stream()
                .filter(ClinicPublicDTO::isOnline)
                .toList();

        if (clinicsInState.isEmpty()) return Collections.emptyList();

        List<String> clinicIds = procedureServiceClient.getClinicIdsByPackage(packageId).getData();
        if (clinicIds == null || clinicIds.isEmpty()) return Collections.emptyList();

        Set<String> clinicIdsOfferingPackage = Set.copyOf(clinicIds);

        return clinicsInState.stream()
                .filter(c -> clinicIdsOfferingPackage.contains(c.getClinicId()))
                .map(c -> mapClinicWithPricing(c, latitude, longitude, packageId, false))
                .sorted((c1, c2) -> Double.compare(parseDistance(c1.getDistanceInKm()), parseDistance(c2.getDistanceInKm())))
                .toList();
    }

    // ============================
    // Get all packages with clinics
    // ============================
    @Override
    public List<ProcedurePackageWithClinicsDTO> getAllPackagesWithClinics(double latitude, double longitude) {

        List<ProcedurePackageDTO> packages = procedureServiceClient.getAllPackages().getData();
        if (packages == null || packages.isEmpty()) return Collections.emptyList();

        final List<ClinicPublicDTO> clinicsFromAdmin = adminClinicClient.getAllClinics().getData();
        final List<ClinicPublicDTO> allClinics = clinicsFromAdmin != null ? clinicsFromAdmin : Collections.emptyList();

        return packages.stream().map(pkg -> {
            List<String> clinicIdsForPackage;
            try {
                clinicIdsForPackage = procedureServiceClient.getClinicIdsByPackage(pkg.getPackageId()).getData();
            } catch (Exception e) {
                clinicIdsForPackage = Collections.emptyList();
            }
            if (clinicIdsForPackage == null) clinicIdsForPackage = Collections.emptyList();
            Set<String> clinicIdSet = Set.copyOf(clinicIdsForPackage);

            List<ClinicProcedureLinkDTO> clinics = allClinics.stream()
                    .filter(c -> clinicIdSet.contains(c.getClinicId()))
                    .map(c -> mapClinicWithPricing(c, latitude, longitude, pkg.getPackageId(), false))
                    .toList();

            ProcedurePackageWithClinicsDTO dto = new ProcedurePackageWithClinicsDTO();
            dto.setPackageInfo(pkg);
            dto.setClinics(clinics);
            return dto;
        }).toList();
    }

    // ============================
    // Map Clinic + Pricing safely
    // ============================
    private ClinicProcedureLinkDTO mapClinicWithPricing(ClinicPublicDTO clinic, double latitude, double longitude,
                                                        String procedureOrPackageId, boolean isProcedure) {
        ProcedurePricingDTO pricing = null;
        try {
            pricing = isProcedure
                    ? procedureServiceClient.getPricingByProcedureForClinic(procedureOrPackageId, clinic.getClinicId()).getData()
                    : procedureServiceClient.getPackagePricingForClinic(procedureOrPackageId, clinic.getClinicId()).getData();
        } catch (Exception ignored) {
        }
        return mapClinicToDTO(clinic, latitude, longitude, pricing);
    }

    // ============================
    // Map ClinicPublicDTO -> ClinicProcedureLinkDTO
    // ============================
    private ClinicProcedureLinkDTO mapClinicToDTO(ClinicPublicDTO clinic, double latitude, double longitude,
                                                  ProcedurePricingDTO pricing) {

        double distanceKm = calculateDistanceInKm(latitude, longitude, clinic.getLatitude(), clinic.getLongitude());
        String distanceStr = distanceKm < 1 ? (int) Math.round(distanceKm * 1000) + " M" : Math.round(distanceKm) + " KM";

        return ClinicProcedureLinkDTO.builder()
                .clinicId(clinic.getClinicId())
                .name(clinic.getName())
                .address(clinic.getAddress())
                .city(clinic.getCity())
                .state(clinic.getState())
                .latitude(clinic.getLatitude())
                .longitude(clinic.getLongitude())
                .online(clinic.isOnline())
                .contactNumber(clinic.getContactNumber())
                .whatsappNumber(clinic.getWhatsappNumber())
                .email(clinic.getEmail())
                .openingTime(clinic.getOpeningTime())
                .closingTime(clinic.getClosingTime())
                .hospitalLogo(clinic.getHospitalLogo())
                .hospitalOverallRating(clinic.getHospitalOverallRating())
                .website(clinic.getWebsite())
                .licenseNumber(clinic.getLicenseNumber())
                .issuingAuthority(clinic.getIssuingAuthority())
                .clinicType(clinic.getClinicType())
                .medicinesSoldOnSite(clinic.getMedicinesSoldOnSite())
                .drugLicenseFormType(clinic.getDrugLicenseFormType())
                .hasPharmacist(clinic.getHasPharmacist())
                .recommended(clinic.isRecommended())
                .subscription(clinic.getSubscription())
                .nabhScore(clinic.getNabhScore())
                .branch(clinic.getBranch())
                .walkthrough(clinic.getWalkthrough())
                .instagramHandle(clinic.getInstagramHandle())
                .twitterHandle(clinic.getTwitterHandle())
                .facebookHandle(clinic.getFacebookHandle())
                .primaryContactPerson(clinic.getPrimaryContactPerson())
                .designation(clinic.getDesignation())
                .clinicManagementSoftwareUsage(clinic.getClinicManagementSoftwareUsage())
                .doctorsList(clinic.getDoctorsList())
                .procedurePricing(pricing)
                .distanceInKm(distanceStr)
                .createdAt(clinic.getCreatedAt())
                .status(clinic.getStatus())
                .username(clinic.getUsername())
                .role(clinic.getRole())
                .build();
    }

    private double parseDistance(String distanceStr) {
        if (distanceStr.endsWith("M")) {
            return Double.parseDouble(distanceStr.replace(" M", "")) / 1000.0;
        } else if (distanceStr.endsWith("KM")) {
            return Double.parseDouble(distanceStr.replace(" KM", ""));
        }
        return Double.MAX_VALUE;
    }

    private double calculateDistanceInKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    @Override
    public List<ClinicProcedureLinkDTO> findNearbyClinics(double latitude, double longitude) {

        // 1. Resolve state by geo
        String state = reverseGeoService.resolveState(latitude, longitude);

        // 2. Get all clinics in state (only online clinics)
        List<ClinicPublicDTO> clinicsInState = adminClinicClient.getClinicsByState(state, true).getData();

        if (clinicsInState == null || clinicsInState.isEmpty()) return Collections.emptyList();

        // 3. Map all clinics to DTO with distance but no procedure filter
        return clinicsInState.stream()
                .map(c -> mapClinicToDTO(c, latitude, longitude, null))  // no pricing here
                .sorted((c1, c2) -> Double.compare(parseDistance(c1.getDistanceInKm()), parseDistance(c2.getDistanceInKm())))
                .toList();
    }

    @Override
    public ClinicDetailsDTO getClinicDetails(String clinicId) {
        // Fetch clinic info from Admin service
        ClinicPublicDTO clinic = adminClinicClient.getClinicById(clinicId).getData();

        // Fetch procedure packages offered by clinic
        List<ProcedurePackageDTO> packages = Collections.emptyList();
        try {
            packages = procedureServiceClient.getPackagesByClinic(clinicId).getData();
        } catch (Exception ignored) {
        }

        // Fetch procedures/pricing offered by clinic
        List<ProcedurePricingDTO> procedures = Collections.emptyList();
        try {
            procedures = procedureServiceClient.getProceduresByClinic(clinicId).getData();
        } catch (Exception ignored) {
        }

        return new ClinicDetailsDTO( packages, procedures);
    }


}
