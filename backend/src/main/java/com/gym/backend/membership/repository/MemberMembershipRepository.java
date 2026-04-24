package com.gym.backend.membership.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gym.backend.membership.model.MemberMembership;

@Repository
public interface MemberMembershipRepository extends JpaRepository<MemberMembership, Long> {

    // Cari membership aktif milik user
    Optional<MemberMembership> findByUserIdAndStatus(
        Long userId, MemberMembership.Status status);

    // Cek apakah user punya membership aktif
    boolean existsByUserIdAndStatusAndEndDateAfter(
        Long userId, 
        MemberMembership.Status status, 
        java.time.LocalDate date
    );

    // Riwayat membership user
    List<MemberMembership> findByUserIdOrderByCreatedAtDesc(Long userId);
}