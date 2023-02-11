package com.tdd.backend.post.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import com.tdd.backend.post.data.LocationDto;

@Table("locations")
public class Location {

	@Id
	private Long id;

	private final String latitude;
	private final String longitude;

	public Location(String latitude, String longitude) {
		this.latitude = latitude;
		this.longitude = longitude;
	}

	public LocationDto toDto() {
		return LocationDto.builder().latitude(latitude).longitude(longitude).build();
	}
}
