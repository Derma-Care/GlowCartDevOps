package com.glowkart.admin.service;

import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.Base64;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.glowkart.admin.config.S3PresignedUrlUtil;
import com.glowkart.admin.dto.DashboardAdsFileRequestDto;
import com.glowkart.admin.dto.DashboardAdsResponseDto;
import com.glowkart.admin.model.DashboardAds;
import com.glowkart.admin.repo.DashboardAdsRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardAdsService {

    private final DashboardAdsRepository dashboardAdsRepository;
    private final S3Client s3Client;
    private final S3PresignedUrlUtil presignedUrlUtil;

    @Value("${aws.bucketName}")
    private String bucketName;

    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
    private static final Set<String> IMAGE_EXT = Set.of(".jpg", ".jpeg", ".png", ".gif");
    private static final Set<String> VIDEO_EXT = Set.of(".mp4", ".mov", ".avi");
    private static final Duration URL_DURATION = Duration.ofMinutes(15);

    // ----------------- CREATE -----------------
    public DashboardAdsResponseDto uploadFile(DashboardAdsFileRequestDto dto) {

        validateRequest(dto);

        byte[] fileBytes = decodeBase64(dto.getData());
        String extension = getFileExtension(dto.getFilename(), dto.getType());
        String key = generateS3Key(dto.getFilename(), fileBytes);

        uploadToS3(key, fileBytes, dto.getType(), extension);

        DashboardAds ad = new DashboardAds();
        ad.setType(dto.getType().toLowerCase());
        ad.setS3Key(key);
        ad.setTitle(dto.getTitle());
        dashboardAdsRepository.save(ad);

        return createResponse(ad);
    }

    // ----------------- READ -----------------
    public List<DashboardAdsResponseDto> getAllAds() {
        return dashboardAdsRepository.findAll().stream()
                .map(this::createResponse)
                .collect(Collectors.toList());
    }

    public DashboardAdsResponseDto getAdById(String id) {
        DashboardAds ad = dashboardAdsRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ad not found"));
        return createResponse(ad);
    }

    // ----------------- UPDATE -----------------
    public DashboardAdsResponseDto updateAd(String id, DashboardAdsFileRequestDto dto) {
        DashboardAds existingAd = dashboardAdsRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ad not found"));

        // Delete old file
        deleteFromS3(existingAd.getS3Key());

        // Validate & upload new content
        validateRequest(dto);
        byte[] fileBytes = decodeBase64(dto.getData());
        String extension = getFileExtension(dto.getFilename(), dto.getType());
        String key = generateS3Key(dto.getFilename(), fileBytes);

        uploadToS3(key, fileBytes, dto.getType(), extension);

        existingAd.setType(dto.getType().toLowerCase());
        existingAd.setS3Key(key);
        existingAd.setTitle(dto.getTitle());
        dashboardAdsRepository.save(existingAd);

        return createResponse(existingAd);
    }

    // ----------------- DELETE -----------------
    public void deleteAd(String id) {
        DashboardAds ad = dashboardAdsRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ad not found"));

        deleteFromS3(ad.getS3Key());
        dashboardAdsRepository.delete(ad);
    }

    // ----------------- Helpers -----------------
    private DashboardAdsResponseDto createResponse(DashboardAds ad) {
        // Generate presigned URL
        String url = presignedUrlUtil.generatePresignedUrl(bucketName, ad.getS3Key(), URL_DURATION);

        // Extract the original filename from S3 key
        String filename = ad.getS3Key().substring(ad.getS3Key().indexOf('-') + 1);

        return new DashboardAdsResponseDto(
                ad.getId(),
                ad.getType(),
                url,
                ad.getTitle(),
                filename
        );
    }

    private void uploadToS3(String key, byte[] fileBytes, String type, String extension) {
        PutObjectRequest putReq = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(getContentType(type, extension))
                .build();

        s3Client.putObject(putReq, RequestBody.fromBytes(fileBytes));
    }

    private void deleteFromS3(String key) {
        if (key != null) {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build());
        }
    }

    private String generateS3Key(String filename, byte[] fileBytes) {
        String sanitized = filename.replaceAll("\\s+", "_");
        String hash = getFileHash(fileBytes).substring(0, 8);
        return "dashboard-ads/" + hash + "-" + sanitized;
    }

    private String getFileHash(byte[] fileBytes) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(fileBytes);
            BigInteger bi = new BigInteger(1, digest);
            String hash = bi.toString(16);
            while (hash.length() < 32) {
                hash = "0" + hash;
            }
            return hash;
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("MD5 algorithm not found", e);
        }
    }

    private void validateRequest(DashboardAdsFileRequestDto dto) {
        if (dto.getType() == null || dto.getFilename() == null || dto.getData() == null || dto.getTitle() == null || dto.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Type, filename, data, and title are required");
        }

        String type = dto.getType().toLowerCase();
        if (!type.equals("image") && !type.equals("video")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Type must be image or video");
        }

        String ext = getFileExtension(dto.getFilename(), type);

        if (type.equals("image") && !IMAGE_EXT.contains(ext)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid image file extension");
        }

        if (type.equals("video") && !VIDEO_EXT.contains(ext)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid video file extension");
        }
    }

    private byte[] decodeBase64(String base64) {
        try {
            byte[] bytes = Base64.getDecoder().decode(base64);
            if (bytes.length > MAX_FILE_SIZE) {
                throw new ResponseStatusException(HttpStatusCode.valueOf(413), "File exceeds 50 MB");
            }
            return bytes;
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid Base64 data");
        }
    }

    private String getFileExtension(String filename, String type) {
        int index = filename.lastIndexOf('.');
        if (index > 0) {
            return filename.substring(index).toLowerCase();
        }
        return type.equals("video") ? ".mp4" : ".png";
    }

    private String getContentType(String type, String ext) {
        return switch (type.toLowerCase()) {
            case "video" -> switch (ext) {
                case ".mp4" -> "video/mp4";
                case ".mov" -> "video/quicktime";
                case ".avi" -> "video/x-msvideo";
                default -> "application/octet-stream";
            };
            default -> switch (ext) {
                case ".jpg", ".jpeg" -> "image/jpeg";
                case ".png" -> "image/png";
                case ".gif" -> "image/gif";
                default -> "application/octet-stream";
            };
        };
    }
}
