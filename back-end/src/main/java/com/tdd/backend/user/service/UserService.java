package com.tdd.backend.user.service;

import static com.tdd.backend.auth.jwt.JwtTokenProvider.JwtTokenRole.*;
import static com.tdd.backend.auth.jwt.JwtTokenProvider.JwtTokenStatus.*;

import java.time.LocalDate;

import java.time.LocalDate;

import java.time.LocalDate;

import org.springframework.stereotype.Service;

import com.tdd.backend.auth.data.JwtTokenPairResponse;
import com.tdd.backend.auth.encrypt.EncryptHelper;
import com.tdd.backend.auth.exception.InvalidTokenException;
import com.tdd.backend.auth.jwt.JwtTokenProvider;
import com.tdd.backend.auth.jwt.RefreshTokenStorage;
import com.tdd.backend.user.data.User;
import com.tdd.backend.user.data.UserCreate;
import com.tdd.backend.user.data.UserLogin;
import com.tdd.backend.user.exception.UnauthorizedException;
import com.tdd.backend.user.exception.UserNotFoundException;
import com.tdd.backend.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

	private final UserRepository userRepository;
	private final EncryptHelper encryptHelper;
	private final JwtTokenProvider jwtTokenProvider;

	public void save(UserCreate userCreate) {
		String encryptPwd = encryptHelper.encrypt(userCreate.getUserPassword());
		LocalDate createdAt = LocalDate.now();
		userRepository.save(User.createUser(userCreate, encryptPwd, createdAt));
	}

	public boolean isDuplicateEmail(String email) {
		return userRepository.countByEmail(email) > 0;
	}

	public JwtTokenPairResponse login(UserLogin userLogin) {
		User user = userRepository.findByEmail(userLogin.getEmail())
			.orElseThrow(UserNotFoundException::new);

		if (!encryptHelper.isMatch(userLogin.getUserPassword(), user.getUserPassword())) {
			throw new UserNotFoundException();
		}

		String accessToken = jwtTokenProvider.generateAccessToken(user.getId());
		String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());
		log.info("> access token : {}", accessToken);
		log.info("> refresh token : {}", refreshToken);

		RefreshTokenStorage.save(user.getId(), refreshToken);

		return JwtTokenPairResponse.builder()
			.accessToken(accessToken)
			.refreshToken(refreshToken)
			.build();
	}

	// TODO : RTK도 만료시 재로그인 요청 보내야함 InvalidToken이랑 다름.
	public JwtTokenPairResponse reIssueToken(String refreshToken) {
		//리프레쉬 토큰이 validate 하고 유효한 RTK라면, 새로운 ATK 재발급
		if (jwtTokenProvider.validateToken(refreshToken) == ACCESS) {
			if (!jwtTokenProvider.getRoleFromJwt(refreshToken).equals(RTK)) {
				throw new InvalidTokenException();
			}
			// ATK 재발급은 RTK의 payload에서 유저의 id를 꺼낸 뒤, Redis 인메모리에 해당 유저의 존재 유무로 결정된다.
			Long id = jwtTokenProvider.getUserIdFromJwt(refreshToken);

			//TODO : 이론적으로 인메모리에 해당하는 key (email) 이 없는 경우에 대한 방식이 적절한 지 판단
			if (!RefreshTokenStorage.isValidateUserId(id)) {
				throw new UnauthorizedException();
			}

			String newAccessToken = jwtTokenProvider.generateAccessToken(id);
			String newRefreshToken = jwtTokenProvider.generateRefreshToken(id);
			log.info(">> reissued access token : {}", newAccessToken);
			log.info(">> reissued refresh token : {}", newRefreshToken);

			return JwtTokenPairResponse.builder()
				.accessToken(newAccessToken)
				.refreshToken(newRefreshToken)
				.build();
		}
		throw new UnauthorizedException();
	}
}
