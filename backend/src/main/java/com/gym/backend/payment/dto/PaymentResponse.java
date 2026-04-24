package com.gym.backend.payment.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentResponse {
    private Long paymentId;
    private String packageName;
    private BigDecimal amount;
    private String paymentMethod;
    private String paymentDetail;
    private String paymentCode;      // VA / nomor HP / QR token
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
}