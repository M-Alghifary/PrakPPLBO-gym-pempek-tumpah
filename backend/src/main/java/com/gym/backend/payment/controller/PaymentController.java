package com.gym.backend.payment.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.gym.backend.common.dto.ApiResponse;
import com.gym.backend.payment.dto.PaymentRequest;
import com.gym.backend.payment.dto.PaymentResponse;
import com.gym.backend.payment.service.PaymentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/initiate/{packageId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> initiate(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long packageId,
            @RequestBody PaymentRequest request) {

        PaymentResponse response = paymentService.initiatePayment(
                userDetails.getUsername(), packageId, request);

        return ResponseEntity.ok(ApiResponse.success("Payment berhasil dibuat", response));
    }

    @PostMapping("/confirm/{paymentId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> confirm(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long paymentId) {

        PaymentResponse response = paymentService.confirmPayment(
                userDetails.getUsername(), paymentId);

        return ResponseEntity.ok(ApiResponse.success("Pembayaran berhasil dikonfirmasi", response));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> history(
            @AuthenticationPrincipal UserDetails userDetails) {

        List<PaymentResponse> responses = paymentService.getHistory(
                userDetails.getUsername());

        return ResponseEntity.ok(ApiResponse.success("OK", responses));
    }

    @GetMapping("/active-membership")
    public ResponseEntity<ApiResponse<Boolean>> activeMembership(
            @AuthenticationPrincipal UserDetails userDetails) {

        boolean active = paymentService.hasActiveMembership(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("OK", active));
    }
}