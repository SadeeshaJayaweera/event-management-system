package com.eventflow.analyticsservice.repository;

import com.eventflow.analyticsservice.model.AnalyticsSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AnalyticsSnapshotRepository extends JpaRepository<AnalyticsSnapshot, Long> {
  Optional<AnalyticsSnapshot> findTopByOrderBySnapshotDateDesc();
}
