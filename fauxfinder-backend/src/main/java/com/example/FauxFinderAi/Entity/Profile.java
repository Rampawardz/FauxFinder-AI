package com.example.FauxFinderAi.Entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "profiles")
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long profileId;

    @JsonProperty("profile pic")
    private Integer profilePic;

    @JsonProperty("nums/length username")
    private Double numsLengthUsername;

    @JsonProperty("fullname words")
    private Integer fullnameWords;

    @JsonProperty("nums/length fullname")
    private Double numsLengthFullname;

    @JsonProperty("name==username")
    private Integer nameEqualsUsername;

    @JsonProperty("description length")
    private Integer descriptionLength;

    @JsonProperty("external URL")
    private Integer externalUrl;

    @JsonProperty("private")
    @Column(name = "is_private")
    private Integer privateAccount;

    @JsonProperty("#posts")
    private Integer posts;

    @JsonProperty("#followers")
    private Integer followers;

    @JsonProperty("#follows")
    private Integer follows;

    @Column(name = "risk_score")
    private Double riskScore;

    @Column(name = "is_fake")
    private Boolean fake;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
