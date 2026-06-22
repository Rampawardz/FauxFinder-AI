package com.example.FauxFinderAi.Service;

import com.example.FauxFinderAi.Entity.PredictionResponse;
import com.example.FauxFinderAi.Entity.Profile;
import com.example.FauxFinderAi.Repository.ProfileRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class ProfileService {

    @Autowired
    private ProfileRepository repository;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${ml.python.executable}")
    private String pythonExecutable;

    @Value("${ml.script.path}")
    private String scriptPath;

    public PredictionResponse analyzeProfile(Profile profile) {
        try {
            String requestJson = objectMapper.writeValueAsString(profile);
            String predictionJson = runPythonModel(requestJson);
            PredictionResponse prediction =
                    objectMapper.readValue(predictionJson, PredictionResponse.class);

            profile.setProfileId(null);
            profile.setRiskScore(prediction.getRiskScore());
            profile.setFake(prediction.getIsFake());

            Profile savedProfile = repository.save(profile);
            prediction.setSavedProfileId(savedProfile.getProfileId());
            return prediction;
        } catch (Exception exception) {
            throw new RuntimeException("Profile analysis failed: " + exception.getMessage(), exception);
        }
    }

    public List<Profile> getAllProfiles() {
        return repository.findAll();
    }

    private String runPythonModel(String requestJson) throws Exception {
        ProcessBuilder processBuilder = new ProcessBuilder(pythonExecutable, scriptPath);
        processBuilder.redirectError(ProcessBuilder.Redirect.INHERIT);
        Process process = processBuilder.start();

        try (OutputStreamWriter writer =
                     new OutputStreamWriter(process.getOutputStream(), StandardCharsets.UTF_8)) {
            writer.write(requestJson);
        }

        boolean completed = process.waitFor(20, TimeUnit.SECONDS);
        if (!completed) {
            process.destroyForcibly();
            throw new RuntimeException("ML model timed out");
        }

        String output = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8).trim();
        if (process.exitValue() != 0 || output.isBlank()) {
            throw new RuntimeException("ML model returned an error");
        }
        return output;
    }
}
