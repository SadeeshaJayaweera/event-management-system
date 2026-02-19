package com.eventflow.analyticsservice.dto;

public class RevenuePoint {

  private String name;
  private double revenue;

  public RevenuePoint(String name, double revenue) {
    this.name = name;
    this.revenue = revenue;
  }

  public String getName() {
    return name;
  }

  public double getRevenue() {
    return revenue;
  }
}
