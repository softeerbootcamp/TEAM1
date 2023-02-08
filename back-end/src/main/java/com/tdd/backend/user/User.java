package com.tdd.backend.user;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import com.tdd.backend.post.model.Appointment;
import com.tdd.backend.user.data.UserCreate;

import lombok.Builder;
import lombok.Getter;

@Table("users")
@Getter
public class User {

	@Id
	private Long id;

	private final String email;
	private final String userPassword;

	private final String userName;
	private final String phoneNumber;

	@Column("tester_id")
	private Appointment appointment;

	@Builder
	private User(String email, String userName, String phoneNumber, String userPassword) {
		this.email = email;
		this.userName = userName;
		this.phoneNumber = phoneNumber;
		this.userPassword = userPassword;
	}

	public static User createUser(UserCreate userCreate) {
		return new User(userCreate.getEmail(), userCreate.getUserName(), userCreate.getPhoneNumber(),
			userCreate.getUserPassword());
	}

	public Long getId() {
		return id;
	}
}
