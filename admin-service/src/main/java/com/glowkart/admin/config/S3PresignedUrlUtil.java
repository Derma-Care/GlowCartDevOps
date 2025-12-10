package com.glowkart.admin.config;


import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
@Component
public class S3PresignedUrlUtil {

    private final Region region;
    private final AwsBasicCredentials awsCreds;

    public S3PresignedUrlUtil(@Value("${aws.accessKeyId}") String accessKey,
                              @Value("${aws.secretAccessKey}") String secretKey,
                              @Value("${aws.region}") String regionStr) {
        this.region = Region.of(regionStr);
        this.awsCreds = AwsBasicCredentials.create(accessKey, secretKey);
    }

    public String generatePresignedUrl(String bucketName, String key, Duration duration) {
        try (S3Presigner presigner = S3Presigner.builder()
                .region(region)
                .credentialsProvider(StaticCredentialsProvider.create(awsCreds))
                .build()) {

            var getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            var presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(duration)
                    .getObjectRequest(getObjectRequest)
                    .build();

            return presigner.presignGetObject(presignRequest).url().toString();
        }
    }
}


