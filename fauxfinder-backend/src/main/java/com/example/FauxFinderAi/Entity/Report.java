package com.example.FauxFinderAi.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "reports")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long reportId;

    @ManyToOne
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(nullable = false)
    private String severity;

    @Column(nullable = false)
    private String status;

    @JsonIgnore
    @Column(name = "reporter_id")
    private Long reporterId = 1L;

    @JsonIgnore
    @Column(name = "notification_email")
    private String notificationEmail = "";

    @JsonIgnore
    @Column(name = "email_sent")
    private Boolean emailSent = false;

    @JsonIgnore
    @Column(name = "email_error", columnDefinition = "TEXT")
    private String emailError;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
