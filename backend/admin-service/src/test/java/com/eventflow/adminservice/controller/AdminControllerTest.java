package com.eventflow.adminservice.controller;

import com.eventflow.adminservice.dto.DashboardStats;
import com.eventflow.adminservice.service.AdminAnalyticsService;
import com.eventflow.adminservice.service.AdminEventService;
import com.eventflow.adminservice.service.AdminUserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminController.class)
class AdminControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private AdminEventService adminEventService;

  @MockBean
  private AdminUserService adminUserService;

  @MockBean
  private AdminAnalyticsService adminAnalyticsService;

  @Test
  void getDashboardStats_shouldReturnStats() throws Exception {
    DashboardStats stats = new DashboardStats(100, 45, 55, 500, 1200, 3500);
    when(adminAnalyticsService.getDashboardStats()).thenReturn(stats);

    mockMvc.perform(get("/api/admin/dashboard/stats"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalEvents").value(100))
        .andExpect(jsonPath("$.upcomingEvents").value(45))
        .andExpect(jsonPath("$.completedEvents").value(55))
        .andExpect(jsonPath("$.totalUsers").value(500))
        .andExpect(jsonPath("$.totalAttendees").value(1200))
        .andExpect(jsonPath("$.totalTicketsSold").value(3500));
  }

  @Test
  void getAllEvents_shouldReturnEventsList() throws Exception {
    when(adminEventService.getAllEvents()).thenReturn(Collections.emptyList());

    mockMvc.perform(get("/api/admin/events"))
        .andExpect(status().isOk());
  }

  @Test
  void getAllUsers_shouldReturnUsersList() throws Exception {
    when(adminUserService.getAllUsers()).thenReturn(Collections.emptyList());

    mockMvc.perform(get("/api/admin/users"))
        .andExpect(status().isOk());
  }
}
