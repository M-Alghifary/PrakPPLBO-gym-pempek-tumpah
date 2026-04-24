package com.gym.backend.payment.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.gym.backend.auth.model.User;
import com.gym.backend.membership.model.MembershipPackage;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "payments")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membership_package_id", nullable = false)
    private MembershipPackage membershipPackage;

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;

    // Untuk BANK_TRANSFER: nama bank (BCA/Mandiri/BRI/BNI)
    // Untuk E_WALLET: nama wallet (GoPay/OVO/Dana/ShopeePay)
    // Untuk QRIS: null
    @Column(name = "payment_detail")
    private String paymentDetail;

    // Nomor VA untuk bank, nomor HP untuk e-wallet, token untuk QRIS
    @Column(name = "payment_code")
    private String paymentCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.status = Status.PENDING;
    }

    public enum PaymentMethod {
        BANK_TRANSFER, E_WALLET, QRIS
    }

    public enum Status {
        PENDING, SUCCESS, EXPIRED
    }
}