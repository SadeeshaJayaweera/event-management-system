package com.eventflow.analyticsservice.controller;

import com.eventflow.analyticsservice.dto.CategoryCount;
import com.eventflow.analyticsservice.dto.OverviewResponse;
import com.eventflow.analyticsservice.dto.RevenuePoint;
import com.eventflow.analyticsservice.model.AnalyticsSnapshot;
import com.eventflow.analyticsservice.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

  private final AnalyticsService analyticsService;

  public AnalyticsController(AnalyticsService analyticsService) {
    this.analyticsService = analyticsService;
  }

  @GetMapping("/overview")
  public OverviewResponse overview() {
    return analyticsService.getOverview();
  }

  @GetMapping("/revenue")
  public List<RevenuePoint> revenue() {
    return analyticsService.getMonthlyRevenue();
  }

  @GetMapping("/events-by-category")
  public List<CategoryCount> eventsByCategory() {
    return analyticsService.getEventsByCategory();
  }

  @PostMapping("/snapshot")
  public ResponseEntity<AnalyticsSnapshot> triggerSnapshot() {
    AnalyticsSnapshot snapshot = analyticsService.saveSnapshot();
    return ResponseEntity.ok(snapshot);
  }

  @GetMapping("/snapshots")
  public List<AnalyticsSnapshot> getSnapshots() {
    return analyticsService.getSnapshots();
  }
}
