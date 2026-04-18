package com.gym.backend.schedule.model;

import com.gym.backend.auth.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "class_attendances",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "gym_class_id"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassAttendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gym_class_id", nullable = false)
    private GymClass gymClass;

    @Column(name = "attended_at", nullable = false)
    private LocalDateTime attendedAt;

    @PrePersist
    protected void onCreate() {
        this.attendedAt = LocalDateTime.now();
    }
}