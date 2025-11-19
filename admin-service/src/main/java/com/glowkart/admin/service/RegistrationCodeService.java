package com.glowkart.admin.service;

import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.glowkart.admin.dto.RegistrationRequestDTO;
import com.glowkart.admin.dto.RegistrationResponseDTO;
import com.glowkart.admin.model.RegistrationCode;
import com.glowkart.admin.repo.RegistrationCodeRepository;
import com.glowkart.admin.service.RegistrationCodeService.RegistrationResponseDTOWithCode;

import jakarta.mail.internet.MimeMessage;

@Service
public class RegistrationCodeService {

    private static final String CODE_PREFIX = "NGK-";

    @Autowired
    private RegistrationCodeRepository repo;

    @Autowired
    private JavaMailSender mailSender;

    // Generate and save batch of codes
    public List<RegistrationCode> generateAndSaveBatch(int batchSize) {
        Set<String> existingCodes = repo.findAll()
                .stream()
                .map(RegistrationCode::getCode)
                .collect(Collectors.toSet());

        Set<RegistrationCode> newCodes = new HashSet<>();
        Random random = new Random();
        int minDigits = 6;
        int maxDigits = 16;

        while (newCodes.size() < batchSize) {
            int length = minDigits + random.nextInt(maxDigits - minDigits + 1);
            String numericPart = generateRandomNumberString(length, random);
            String code = CODE_PREFIX + numericPart;

            if (!existingCodes.contains(code) && newCodes.stream().noneMatch(c -> c.getCode().equals(code))) {
                newCodes.add(new RegistrationCode(code));
            }
        }

        repo.saveAll(newCodes);
        return newCodes.stream().collect(Collectors.toList());
    }

    // Verify a registration code
    public RegistrationResponseDTO verifyCode(RegistrationRequestDTO dto) {

        RegistrationCode reg = repo.findByCode(dto.getCode());

        if (reg == null) {
            return new RegistrationResponseDTO(dto.getCode(), false, false);
        }

        // If code is not used, mark used = true
        if (!reg.isUsed()) {
            reg.setUsed(true);
            repo.save(reg);
        }

        // Always return success = true if code exists
        return new RegistrationResponseDTO(reg.getCode(), true, true);
    }



    // Get all codes
    public List<RegistrationResponseDTOWithCode> getAllCodes() {
        return repo.findAll()
                .stream()
                .map(reg -> new RegistrationResponseDTOWithCode(reg.getCode(), reg.isUsed()))
                .collect(Collectors.toList());
    }

    // Helper: random numeric string
    private String generateRandomNumberString(int length, Random random) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append(random.nextInt(10));
        }
        if (sb.charAt(0) == '0') {
            sb.setCharAt(0, (char) ('1' + random.nextInt(9)));
        }
        return sb.toString();
    }

    // Send codes as Excel attachment via email
    public void sendCodesByEmail(List<RegistrationCode> codes, String emailTo) throws Exception {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Registration Codes");

        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("Code");
        header.createCell(1).setCellValue("Used");

        for (int i = 0; i < codes.size(); i++) {
            RegistrationCode reg = codes.get(i);
            Row row = sheet.createRow(i + 1);
            row.createCell(0).setCellValue(reg.getCode());
            row.createCell(1).setCellValue(reg.isUsed() ? "Yes" : "No");
        }

        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);

        ByteArrayResource excelResource;
        try (java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream()) {
            workbook.write(out);
            workbook.close();
            excelResource = new ByteArrayResource(out.toByteArray());
        }

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(emailTo);
        helper.setSubject("GlowKart Registration Codes");
        helper.setText("Please find attached the registration codes Excel file.");
        helper.addAttachment("RegistrationCodes.xlsx", excelResource);

        mailSender.send(message);
    }

    // DTO for listing all codes with used status
    public static class RegistrationResponseDTOWithCode {
        private String code;
        private boolean used;

        public RegistrationResponseDTOWithCode(String code, boolean used) {
            this.code = code;
            this.used = used;
        }

        public String getCode() { return code; }
        public boolean isUsed() { return used; }
    }
}
