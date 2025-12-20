package com.glowkart.notification.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@Component
public class FirebaseConfig {

    @Value("${firebase.service-account-path}")
    private String serviceAccountPath;

    @PostConstruct
    public void init() throws IOException {
        InputStream serviceAccount;

        if (serviceAccountPath.startsWith("classpath:")) {
            serviceAccount = this.getClass().getClassLoader()
                    .getResourceAsStream(serviceAccountPath.substring(10));
        } else {
            serviceAccount = new FileInputStream(serviceAccountPath);
        }

        if (serviceAccount == null) {
            throw new IllegalStateException("Firebase service account file not found at " + serviceAccountPath);
        }

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build();

        if (FirebaseApp.getApps().isEmpty()) {
            FirebaseApp.initializeApp(options);
        }
    }
}

