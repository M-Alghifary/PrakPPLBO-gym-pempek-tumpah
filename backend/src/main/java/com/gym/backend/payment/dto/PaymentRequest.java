package com.gym.backend.payment.dto;

import lombok.Data;

@Data
public class PaymentRequest {
    private String paymentMethod;  // BANK_TRANSFER / E_WALLET / QRIS
    private String paymentDetail;  // Nama bank / nama wallet / null
    private String phoneNumber;    // Untuk e-wallet
}