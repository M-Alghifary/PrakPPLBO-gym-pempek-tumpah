package com.gym.backend.admin.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gym.backend.admin.dto.AdminMemberResponse;
import com.gym.backend.admin.dto.ReportResponse;
import com.gym.backend.auth.model.User;
import com.gym.backend.auth.repository.UserRepository;
import com.gym.backend.common.exception.BadRequestException;
import com.gym.backend.common.exception.ResourceNotFoundException;
import com.gym.backend.membership.model.MemberMembership;
import com.gym.backend.membership.repository.MemberMembershipRepository;
import com.gym.backend.membership.repository.MembershipPackageRepository;
import com.gym.backend.schedule.dto.GymClassResponse;
import com.gym.backend.schedule.model.GymClass;
import com.gym.backend.schedule.repository.ClassBookingRepository;
import com.gym.backend.schedule.repository.GymClassRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final MemberMembershipRepository memberMembershipRepository;
    private final MembershipPackageRepository packageRepository;
    private final GymClassRepository gymClassRepository;
    private final ClassBookingRepository bookingRepository;

    // ── Member management ─────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AdminMemberResponse> getAllMembers() {
        return userRepository.findAll()
                .stream()
                .map(user -> {
                    boolean hasActiveMembership = memberMembershipRepository
                            .existsByUserIdAndStatusAndEndDateAfter(
                                    user.getId(),
                                    MemberMembership.Status.ACTIVE,
                                    LocalDate.now()
                            );

                    String membershipStatus = hasActiveMembership ? "ACTIVE" : "INACTIVE";

                    return AdminMemberResponse.builder()
                            .id(user.getId())
                            .name(user.getName())
                            .email(user.getEmail())
                            .role(user.getRole().name())
                            .hasMembership(hasActiveMembership)
                            .membershipStatus(membershipStatus)
                            .joinedAt(user.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateUserRole(Long userId, String role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        try {
            User.Role newRole = User.Role.valueOf(role.toUpperCase());
            user.setRole(newRole);
            userRepository.save(user);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Role tidak valid. Pilihan: MEMBER, ADMIN, TRAINER, OWNER");
        }
    }

    // ── Class management ──────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<GymClassResponse> getAllClasses() {
        return gymClassRepository.findAll()
                .stream()
                .map(this::toClassResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void cancelClass(Long classId) {
        GymClass gymClass = gymClassRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Kelas tidak ditemukan"));

        if (gymClass.getStatus() == GymClass.Status.CANCELLED) {
            throw new BadRequestException("Kelas sudah dibatalkan sebelumnya");
        }

        gymClass.setStatus(GymClass.Status.CANCELLED);
        gymClassRepository.save(gymClass);
    }

    // ── Reports ───────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public ReportResponse getReport() {
        long totalMembers = userRepository.count();

        long activeMembers = userRepository.findAll()
                .stream()
                .filter(user -> memberMembershipRepository
                        .existsByUserIdAndStatusAndEndDateAfter(
                                user.getId(),
                                MemberMembership.Status.ACTIVE,
                                LocalDate.now()
                        ))
                .count();

        long totalClasses = gymClassRepository.count();
        long totalBookings = bookingRepository.count();

        // Total revenue dari semua membership yang pernah aktif
        BigDecimal totalRevenue = memberMembershipRepository.findAll()
                .stream()
                .map(m -> m.getMembershipPackage().getPrice())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Kelas yang paling banyak di-booking
        String mostPopularClass = bookingRepository.findAll()
                .stream()
                .collect(Collectors.groupingBy(
                        b -> b.getGymClass().getName(),
                        Collectors.counting()
                ))
                .entrySet()
                .stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Belum ada data");

        return ReportResponse.builder()
                .totalMembers(totalMembers)
                .activeMembers(activeMembers)
                .totalClasses(totalClasses)
                .totalBookings(totalBookings)
                .totalRevenue(totalRevenue)
                .mostPopularClass(mostPopularClass)
                .build();
    }

    // ── Mapper ────────────────────────────────────────────────────────────

    private GymClassResponse toClassResponse(GymClass c) {
        return GymClassResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .description(c.getDescription())
                .trainerName(c.getTrainer() != null ? c.getTrainer().getName() : "TBA")
                .startTime(c.getStartTime())
                .endTime(c.getEndTime())
                .maxCapacity(c.getMaxCapacity())
                .currentCapacity(c.getCurrentCapacity())
                .remainingSlots(c.getRemainingSlots())
                .status(c.getStatus().name())
                .build();
    }
}