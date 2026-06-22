package com.example.FauxFinderAi.Entity;

import lombok.Data;

@Data
public class ReportRequest {
    private Long profileId;
    private Long reporterId;
    private String reason;
    private String severity;
}
