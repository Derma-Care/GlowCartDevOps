package com.glowkart.customer.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

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

@Service
@RequiredArgsConstructor
public class CustomerClinicSearchServiceImpl implements CustomerClinicSearchService {

    private final ReverseGeoService reverseGeoService;
    private final AdminClinicClient adminClinicClient;
    private final ProcedureServiceClient procedureServiceClient;

    private final Map<String, Double> offerCache = new ConcurrentHashMap<>();

    // =========================================================
    // Find clinics offering a procedure
    // =========================================================
    @Override
    public List<ClinicProcedureLinkDTO> findClinicsForProcedure(double latitude, double longitude, String procedureId) {
        String state = reverseGeoService.resolveState(latitude, longitude);
        List<ClinicPublicDTO> clinics = safeGetClinics(state, null);
        if (clinics.isEmpty()) return Collections.emptyList();

        List<String> clinicIds = safeGetClinicIdsByProcedure(procedureId);
        if (clinicIds.isEmpty()) return Collections.emptyList();
        Set<String> allowedIds = Set.copyOf(clinicIds);

        return clinics.stream()
                .filter(ClinicPublicDTO::isOnline)
                .filter(c -> allowedIds.contains(c.getClinicId()))
                .map(c -> mapClinicWithPricing(c, latitude, longitude, procedureId, true))
                .sorted(this::sortByDistance)
                .toList();
    }

    // =========================================================
    // Find clinics offering a package
    // =========================================================
    @Override
    public List<ClinicProcedureLinkDTO> findClinicsForPackage(double latitude, double longitude, String packageId) {
        String state = reverseGeoService.resolveState(latitude, longitude);
        List<ClinicPublicDTO> clinics = safeGetClinics(state, null);
        if (clinics.isEmpty()) return Collections.emptyList();

        List<String> clinicIds = safeGetClinicIdsByPackage(packageId);
        if (clinicIds.isEmpty()) return Collections.emptyList();
        Set<String> allowedIds = Set.copyOf(clinicIds);

        return clinics.stream()
                .filter(ClinicPublicDTO::isOnline)
                .filter(c -> allowedIds.contains(c.getClinicId()))
                .map(c -> mapClinicWithPricing(c, latitude, longitude, packageId, false))
                .sorted(this::sortByDistance)
                .toList();
    }

    // =========================================================
    // Nearby clinics
    // =========================================================
    @Override
    public List<ClinicProcedureLinkDTO> findNearbyClinics(double latitude, double longitude) {
        String state = reverseGeoService.resolveState(latitude, longitude);
        List<ClinicPublicDTO> clinics = safeGetClinics(state, true);

        return clinics.stream()
                .map(c -> mapClinicToDTO(c, latitude, longitude, null))
                .sorted(this::sortByDistance)
                .toList();
    }

    // =========================================================
    // Nearby clinics WITH OFFERS
    // =========================================================
    @Override
    public List<ClinicProcedureLinkDTO> findNearbyClinicsWithOffers(double latitude, double longitude) {
        String state = reverseGeoService.resolveState(latitude, longitude);
        List<ClinicPublicDTO> clinics = safeGetClinics(state, true);

        return clinics.stream()
                .filter(c -> hasAnyActiveOffer(c.getClinicId()))
                .map(c -> mapClinicToDTO(c, latitude, longitude, null))
                .sorted(this::sortByDistance)
                .toList();
    }

    // =========================================================
    // Clinic details
    // =========================================================
    @Override
    public ClinicDetailsDTO getClinicDetails(String clinicId) {
        List<ProcedurePackageDTO> packages = safeGetFromClient(() ->
                procedureServiceClient.getPackagesByClinic(clinicId).getData());

        List<ProcedurePricingDTO> procedures = safeGetFromClient(() ->
                procedureServiceClient.getProceduresByClinic(clinicId).getData());

        return new ClinicDetailsDTO(packages, procedures);
    }

    // =========================================================
    // Clinic OFFERS only
    // =========================================================
    @Override
    public ClinicDetailsDTO getClinicOffers(String clinicId) {
        List<ProcedurePricingDTO> procedures = safeGetFromClient(() ->
                procedureServiceClient.getProceduresByClinic(clinicId).getData())
                .stream()
                .filter(this::isOfferActive)
                .toList();

        List<ProcedurePackageDTO> packages = safeGetFromClient(() ->
                procedureServiceClient.getPackagesByClinic(clinicId).getData())
                .stream()
                .filter(this::isOfferActive)
                .toList();

        return new ClinicDetailsDTO(packages, procedures);
    }

    // =========================================================
    // Get all packages with linked online clinics
    // =========================================================
    @Override
    public List<ProcedurePackageWithClinicsDTO> getAllPackagesWithClinics(double latitude, double longitude) {
        // 1️⃣ Resolve state from coordinates
        String state = reverseGeoService.resolveState(latitude, longitude);

        // 2️⃣ Fetch all procedure packages safely
        List<ProcedurePackageDTO> packages = safeGetFromClient(() ->
                procedureServiceClient.getAllPackages().getData());

        if (packages.isEmpty()) return Collections.emptyList();

        // 3️⃣ Fetch all clinics in the state safely
        List<ClinicPublicDTO> clinics = safeGetClinics(state, true);

        // 4️⃣ Map each package to its clinics, skipping packages with no online clinics
        return packages.stream()
                .map(pkg -> {
                    List<String> clinicIds = safeGetClinicIdsByPackage(pkg.getPackageId());
                    Set<String> allowedClinicIds = clinicIds.isEmpty() ? Set.of() : Set.copyOf(clinicIds);

                    List<ClinicProcedureLinkDTO> clinicDtos = clinics.stream()
                            .filter(ClinicPublicDTO::isOnline)
                            .filter(c -> allowedClinicIds.contains(c.getClinicId()))
                            .map(c -> mapClinicWithPricing(c, latitude, longitude, pkg.getPackageId(), false))
                            .sorted(this::sortByDistance)
                            .toList();

                    if (clinicDtos.isEmpty()) {
                        return null; // skip packages with no online clinics
                    }

                    ProcedurePackageWithClinicsDTO dto = new ProcedurePackageWithClinicsDTO();
                    dto.setPackageInfo(pkg);
                    dto.setClinics(clinicDtos);

                    return dto;
                })
                .filter(dto -> dto != null) // remove nulls
                .toList();
    }


    // =========================================================
    // Offer logic
    // =========================================================
    private boolean hasAnyActiveOffer(String clinicId) {
        return calculateMaxOfferForClinic(clinicId) != null;
    }

    private Double calculateMaxOfferForClinic(String clinicId) {
        return offerCache.computeIfAbsent(clinicId, id -> {
            double max = 0;

            for (ProcedurePricingDTO p : safeGetFromClient(() ->
                    procedureServiceClient.getProceduresByClinic(id).getData())) {
                if (isOfferActive(p)) max = Math.max(max, p.getTotalDiscountPercentage());
            }

            for (ProcedurePackageDTO p : safeGetFromClient(() ->
                    procedureServiceClient.getPackagesByClinic(id).getData())) {
                if (isOfferActive(p)) max = Math.max(max, p.getTotalDiscountPercentage());
            }

            return max > 0 ? max : null;
        });
    }

    private boolean isOfferActive(ProcedurePricingDTO p) {
        return p != null && p.isOfferActive() && p.getTotalDiscountPercentage() > 0
                && !isExpired(p.getOfferValidDate());
    }

    private boolean isOfferActive(ProcedurePackageDTO p) {
        return p != null && p.isOfferActive() && p.getTotalDiscountPercentage() > 0
                && !isExpired(p.getOfferValidDate());
    }

    private boolean isExpired(String date) {
        if (date == null || date.isBlank()) return false;
        try {
            LocalDate localDate = LocalDate.parse(date);
            LocalDateTime endOfDay = localDate.atTime(23, 59, 59);
            Instant offerInstant = endOfDay.toInstant(ZoneOffset.UTC);
            return Instant.now().isAfter(offerInstant);
        } catch (DateTimeParseException e) {
            return true;
        }
    }

    // =========================================================
    // Mapping utility
    // =========================================================
    private ClinicProcedureLinkDTO mapClinicWithPricing(
            ClinicPublicDTO clinic,
            double latitude,
            double longitude,
            String id,
            boolean isProcedure) {

        ProcedurePricingDTO pricing = null;
        try {
            if (isProcedure) {
                pricing = safeGetFromClient(() -> List.of(
                        procedureServiceClient.getPricingByProcedureForClinic(id, clinic.getClinicId()).getData()))
                        .stream().findFirst().orElse(null);
            } else {
                pricing = safeGetFromClient(() -> List.of(
                        procedureServiceClient.getPackagePricingForClinic(id, clinic.getClinicId()).getData()))
                        .stream().findFirst().orElse(null);
            }
        } catch (Exception ignored) {}

        return mapClinicToDTO(clinic, latitude, longitude, pricing);
    }

    private ClinicProcedureLinkDTO mapClinicToDTO(
            ClinicPublicDTO clinic,
            double latitude,
            double longitude,
            ProcedurePricingDTO pricing) {

        double distanceKm = calculateDistanceInKm(latitude, longitude,
                clinic.getLatitude(), clinic.getLongitude());

        String distanceStr = distanceKm < 1
                ? Math.round(distanceKm * 1000) + " M"
                : Math.round(distanceKm) + " KM";

        return ClinicProcedureLinkDTO.builder()
                .clinicId(clinic.getClinicId())
                .name(clinic.getName())
                .address(clinic.getAddress())
                .city(clinic.getCity())
                .state(clinic.getState())
                .latitude(clinic.getLatitude())
                .longitude(clinic.getLongitude())
                .contactNumber(clinic.getContactNumber())
                .whatsappNumber(clinic.getWhatsappNumber())
                .email(clinic.getEmail())
                .alternateContactNumber(clinic.getAlternateContactNumber())
                .openingTime(clinic.getOpeningTime())
                .closingTime(clinic.getClosingTime())
                .hospitalLogo(clinic.getHospitalLogo())
                .website(clinic.getWebsite())
                .walkthrough(clinic.getWalkthrough())
                .hospitalOverallRating(clinic.getHospitalOverallRating())
                .online(clinic.isOnline())
                .recommended(clinic.isRecommended())
                .subscription(clinic.getSubscription())
                .status(clinic.getStatus())
                .username(clinic.getUsername())
                .role(clinic.getRole())
                .licenseNumber(clinic.getLicenseNumber())
                .issuingAuthority(clinic.getIssuingAuthority())
                .clinicType(clinic.getClinicType())
                .medicinesSoldOnSite(clinic.getMedicinesSoldOnSite())
                .drugLicenseFormType(clinic.getDrugLicenseFormType())
                .hasPharmacist(clinic.getHasPharmacist())
                .nabhScore(clinic.getNabhScore())
                .branch(clinic.getBranch())
                .primaryContactPerson(clinic.getPrimaryContactPerson())
                .designation(clinic.getDesignation())
                .clinicManagementSoftwareUsage(clinic.getClinicManagementSoftwareUsage())
                .createdAt(clinic.getCreatedAt())
                .instagramHandle(clinic.getInstagramHandle())
                .twitterHandle(clinic.getTwitterHandle())
                .facebookHandle(clinic.getFacebookHandle())
                .doctorsList(clinic.getDoctorsList())
                .procedurePricing(pricing)
                .maxOfferPercentage(calculateMaxOfferForClinic(clinic.getClinicId()))
                .distanceInKm(distanceStr)
                .build();
    }

    // =========================================================
    // Distance & sorting utility
    // =========================================================
    private int sortByDistance(ClinicProcedureLinkDTO a, ClinicProcedureLinkDTO b) {
        return Double.compare(parseDistance(a.getDistanceInKm()), parseDistance(b.getDistanceInKm()));
    }

    private double parseDistance(String distance) {
        distance = distance.trim();
        if (distance.endsWith(" KM")) return Double.parseDouble(distance.replace(" KM", ""));
        if (distance.endsWith(" M")) return Double.parseDouble(distance.replace(" M", "")) / 1000;
        return Double.MAX_VALUE;
    }

    private double calculateDistanceInKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1))
                * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    }

    // =========================================================
    // Safe Feign utility
    // =========================================================
    private <T> List<T> safeGetFromClient(SupplierWithException<List<T>> supplier) {
        try {
            List<T> data = supplier.get();
            return data != null ? data : Collections.emptyList();
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    @FunctionalInterface
    private interface SupplierWithException<T> {
        T get() throws Exception;
    }

    private List<ClinicPublicDTO> safeGetClinics(String state, Boolean onlyOnline) {
        return safeGetFromClient(() -> adminClinicClient.getClinicsByState(state, onlyOnline).getData());
    }

    private List<String> safeGetClinicIdsByProcedure(String procedureId) {
        return safeGetFromClient(() -> procedureServiceClient.getClinicIdsByProcedure(procedureId).getData());
    }

    private List<String> safeGetClinicIdsByPackage(String packageId) {
        return safeGetFromClient(() -> procedureServiceClient.getClinicIdsByPackage(packageId).getData());
    }
}
