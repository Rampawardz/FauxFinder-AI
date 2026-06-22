package com.example.FauxFinderAi.Service;

import com.example.FauxFinderAi.Entity.Profile;
import com.example.FauxFinderAi.Entity.Report;
import com.example.FauxFinderAi.Entity.ReportRequest;
import com.example.FauxFinderAi.Repository.ProfileRepository;
import com.example.FauxFinderAi.Repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private ProfileRepository profileRepository;

    public Report saveReport(ReportRequest request) {
        if (request.getProfileId() == null) {
            throw new IllegalArgumentException("Profile ID is required");
        }
        if (request.getReason() == null || request.getReason().isBlank()) {
            throw new IllegalArgumentException("Report reason is required");
        }

        Optional<Profile> optionalProfile = profileRepository.findById(request.getProfileId());
        if (optionalProfile.isEmpty()) {
            throw new IllegalArgumentException("Profile not found");
        }

        Profile profile = optionalProfile.get();
        if (!Boolean.TRUE.equals(profile.getFake())) {
            throw new IllegalArgumentException("Only fake profiles can be reported");
        }

        Report report = new Report();
        report.setProfile(profile);
        report.setReporterId(request.getReporterId() == null ? 1L : request.getReporterId());
        report.setReason(request.getReason().trim());
        report.setSeverity(normalizeSeverity(request.getSeverity()));
        report.setStatus("OPEN");
        return reportRepository.save(report);
    }

    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    private String normalizeSeverity(String severity) {
        String value = severity == null ? "LOW" : severity.trim().toUpperCase();
        if (!value.equals("LOW") && !value.equals("MEDIUM") && !value.equals("HIGH")) {
            throw new IllegalArgumentException("Severity must be LOW, MEDIUM, or HIGH");
        }
        return value;
    }
}
