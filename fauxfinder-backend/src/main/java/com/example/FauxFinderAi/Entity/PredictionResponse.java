package com.example.FauxFinderAi.Entity;

import lombok.Data;

import java.util.Map;

@Data
public class PredictionResponse {
    private Double riskScore;
    private Boolean isFake;
    private Long savedProfileId;
    private Map<String, Object> features;
}
