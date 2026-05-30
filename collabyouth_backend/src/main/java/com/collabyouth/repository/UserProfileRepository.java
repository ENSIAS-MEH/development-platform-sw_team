package com.collabyouth.repository;

import com.collabyouth.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, UUID> {

    Optional<UserProfile> findByUserId(UUID userId);

    // Eager-fetch skills in one query to avoid N+1
    @Query("""
        SELECT p FROM UserProfile p
        LEFT JOIN FETCH p.skills
        WHERE p.user.id = :userId
        """)
    Optional<UserProfile> findByUserIdWithSkills(@Param("userId") UUID userId);
}