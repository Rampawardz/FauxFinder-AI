package com.example.FauxFinderAi.Controller;

import com.example.FauxFinderAi.Entity.PredictionResponse;
import com.example.FauxFinderAi.Entity.Profile;
import com.example.FauxFinderAi.Service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    @Autowired
    private ProfileService service;

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeProfile(@RequestBody Profile profile) {
        try {
            PredictionResponse response = service.analyzeProfile(profile);
            return ResponseEntity.ok(response);
        } catch (RuntimeException exception) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", exception.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Profile>> getAllProfiles() {
        return ResponseEntity.ok(service.getAllProfiles());
    }
}
