package com.example.FauxFinderAi.Controller;

import com.example.FauxFinderAi.Entity.Report;
import com.example.FauxFinderAi.Entity.ReportRequest;
import com.example.FauxFinderAi.Service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService service;

    @PostMapping
    public ResponseEntity<?> saveReport(@RequestBody ReportRequest request) {
        try {
            Report report = service.saveReport(request);
            return ResponseEntity.status(201).body(report);
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", exception.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Report>> getAllReports() {
        return ResponseEntity.ok(service.getAllReports());
    }
}
