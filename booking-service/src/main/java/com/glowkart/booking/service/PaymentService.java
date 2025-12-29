package com.glowkart.booking.service;

import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    public boolean pay(String bookingId, double amount) {
        // Simulate payment success
        return true;
    }

    public boolean refund(String bookingId, double amount) {
        // Simulate refund
        return true;
    }
}
