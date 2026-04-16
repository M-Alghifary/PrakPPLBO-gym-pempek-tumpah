package com.gym.backend.membership.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.gym.backend.auth.model.User;
import com.gym.backend.auth.repository.UserRepository;
import com.gym.backend.common.exception.BadRequestException;
import com.gym.backend.common.exception.ResourceNotFoundException;
import com.gym.backend.membership.dto.MemberMembershipResponse;
import com.gym.backend.membership.dto.MembershipPackageResponse;
import com.gym.backend.membership.model.MemberMembership;
import com.gym.backend.membership.model.MembershipPackage;
import com.gym.backend.membership.repository.MemberMembershipRepository;
import com.gym.backend.membership.repository.MembershipPackageRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MembershipService {

    private final MembershipPackageRepository packageRepository;
    private final MemberMembershipRepository memberMembershipRepository;
    private final UserRepository userRepository;

    // ── Paket ────────────────────────────────────────────────────────────

    public List<MembershipPackageResponse> getAllActivePackages() {
        return packageRepository.findByIsActiveTrue()
                .stream()
                .map(this::toPackageResponse)
                .collect(Collectors.toList());
    }

    // ── Membership Member ─────────────────────────────────────────────────

    public MemberMembershipResponse subscribe(String email, Long packageId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        // Cek apakah sudah punya membership aktif
        boolean hasActive = memberMembershipRepository
                .existsByUserIdAndStatusAndEndDateAfter(
                        user.getId(),
                        MemberMembership.Status.ACTIVE,
                        LocalDate.now()
                );

        if (hasActive) {
            throw new BadRequestException(
                    "Kamu masih memiliki membership aktif. " +
                    "Perpanjang setelah masa berlaku habis.");
        }

        MembershipPackage pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("Paket tidak ditemukan"));

        if (!pkg.getIsActive()) {
            throw new BadRequestException("Paket ini sudah tidak tersedia");
        }

        LocalDate startDate = LocalDate.now();
        LocalDate endDate = startDate.plusDays(pkg.getDurationDays());

        MemberMembership membership = MemberMembership.builder()
                .user(user)
                .membershipPackage(pkg)
                .startDate(startDate)
                .endDate(endDate)
                .status(MemberMembership.Status.ACTIVE)
                .build();

        memberMembershipRepository.save(membership);
        return toMembershipResponse(membership);
    }

    public MemberMembershipResponse getActiveMembership(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        MemberMembership membership = memberMembershipRepository
                .findByUserIdAndStatus(user.getId(), MemberMembership.Status.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Tidak ada membership aktif"));

        return toMembershipResponse(membership);
    }

    public List<MemberMembershipResponse> getMembershipHistory(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        return memberMembershipRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toMembershipResponse)
                .collect(Collectors.toList());
    }

    // ── Mapper ────────────────────────────────────────────────────────────

    private MembershipPackageResponse toPackageResponse(MembershipPackage pkg) {
        return MembershipPackageResponse.builder()
                .id(pkg.getId())
                .name(pkg.getName())
                .description(pkg.getDescription())
                .price(pkg.getPrice())
                .durationDays(pkg.getDurationDays())
                .build();
    }

    private MemberMembershipResponse toMembershipResponse(MemberMembership m) {
        long daysRemaining = ChronoUnit.DAYS.between(LocalDate.now(), m.getEndDate());

        return MemberMembershipResponse.builder()
                .id(m.getId())
                .packageName(m.getMembershipPackage().getName())
                .packagePrice(m.getMembershipPackage().getPrice())
                .durationDays(m.getMembershipPackage().getDurationDays())
                .startDate(m.getStartDate())
                .endDate(m.getEndDate())
                .status(m.getStatus().name())
                .daysRemaining(Math.max(daysRemaining, 0))
                .createdAt(m.getCreatedAt())
                .build();
    }
}