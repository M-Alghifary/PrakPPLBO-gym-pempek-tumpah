package com.gym.backend.payment.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gym.backend.auth.model.User;
import com.gym.backend.auth.repository.UserRepository;
import com.gym.backend.common.exception.BadRequestException;
import com.gym.backend.common.exception.ResourceNotFoundException;
import com.gym.backend.membership.model.MemberMembership;
import com.gym.backend.membership.model.MembershipPackage;
import com.gym.backend.membership.repository.MemberMembershipRepository;
import com.gym.backend.membership.repository.MembershipPackageRepository;
import com.gym.backend.payment.dto.PaymentRequest;
import com.gym.backend.payment.dto.PaymentResponse;
import com.gym.backend.payment.model.Payment;
import com.gym.backend.payment.repository.PaymentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final MembershipPackageRepository packageRepository;
    private final MemberMembershipRepository memberMembershipRepository;

    @Transactional
    public PaymentResponse initiatePayment(String email, Long packageId, PaymentRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        MembershipPackage pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("Paket tidak ditemukan"));

        Payment.PaymentMethod method;
        try {
            method = Payment.PaymentMethod.valueOf(request.getPaymentMethod());
        } catch (Exception e) {
            throw new BadRequestException("Metode pembayaran tidak valid");
        }

        // Generate kode pembayaran berdasarkan metode
        String paymentCode = generatePaymentCode(method, request);

        Payment payment = Payment.builder()
                .user(user)
                .membershipPackage(pkg)
                .amount(pkg.getPrice())
                .paymentMethod(method)
                .paymentDetail(request.getPaymentDetail())
                .paymentCode(paymentCode)
                .build();

        paymentRepository.save(payment);
        return toResponse(payment);
    }

    @Transactional
    public PaymentResponse confirmPayment(String email, Long paymentId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        Payment payment = paymentRepository.findByIdAndUserId(paymentId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment tidak ditemukan"));

        if (payment.getStatus() == Payment.Status.SUCCESS) {
            throw new BadRequestException("Payment sudah dikonfirmasi sebelumnya");
        }

        // Konfirmasi pembayaran
        payment.setStatus(Payment.Status.SUCCESS);
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);

        // Aktifkan membership
        MembershipPackage pkg = payment.getMembershipPackage();
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = startDate.plusDays(pkg.getDurationDays());

        MemberMembership membership = MemberMembership.builder()
                .user(user)
                .membershipPackage(pkg)
                .payment(payment)
                .startDate(startDate)
                .endDate(endDate)
                .status(MemberMembership.Status.ACTIVE)
                .build();

        memberMembershipRepository.save(membership);
        return toResponse(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getHistory(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        return paymentRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean hasActiveMembership(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        return memberMembershipRepository
                .existsByUserIdAndStatusAndEndDateAfter(
                        user.getId(),
                        MemberMembership.Status.ACTIVE,
                        LocalDate.now());
    }

    // ── Generate kode pembayaran simulasi ─────────────────────────────────

    private String generatePaymentCode(Payment.PaymentMethod method, PaymentRequest request) {
        Random random = new Random();
        return switch (method) {
            case BANK_TRANSFER -> {
                // Generate 16 digit virtual account
                StringBuilder va = new StringBuilder();
                for (int i = 0; i < 16; i++) va.append(random.nextInt(10));
                yield va.toString();
            }
            case E_WALLET -> request.getPhoneNumber();
            case QRIS -> "QRIS-GYM-" + System.currentTimeMillis();
        };
    }

    private PaymentResponse toResponse(Payment p) {
        return PaymentResponse.builder()
                .paymentId(p.getId())
                .packageName(p.getMembershipPackage().getName())
                .amount(p.getAmount())
                .paymentMethod(p.getPaymentMethod().name())
                .paymentDetail(p.getPaymentDetail())
                .paymentCode(p.getPaymentCode())
                .status(p.getStatus().name())
                .createdAt(p.getCreatedAt())
                .paidAt(p.getPaidAt())
                .build();
    }
}