package com.collabyouth.repository;

import com.collabyouth.entity.UserProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface StudentSearchRepository extends JpaRepository<UserProfile, UUID> {

    @Query(value = """
        SELECT DISTINCT up.*
		FROM user_profiles up
		LEFT JOIN user_skills us ON up.id = us.user_profile_id   -- LEFT
		LEFT JOIN skills sk ON sk.id = us.skill_id               -- LEFT
		JOIN users u ON u.id = up.user_id
		WHERE u.role = 'STUDENT'
          AND u.status = 'ACTIVE'
          AND u.id <> :excludedUserId
          AND (
                CAST(:q AS text) IS NULL OR
                LOWER(u.first_name) LIKE LOWER('%' || CAST(:q AS text) || '%') OR
                LOWER(u.last_name)  LIKE LOWER('%' || CAST(:q AS text) || '%') OR
                LOWER(u.email)      LIKE LOWER('%' || CAST(:q AS text) || '%') OR
                LOWER(up.bio)       LIKE LOWER('%' || CAST(:q AS text) || '%')
              )
          AND (CAST(:domain AS text) IS NULL OR LOWER(up.domain) = LOWER(CAST(:domain AS text)))
          AND (CAST(:availability AS text) IS NULL OR up.availability = CAST(:availability AS text))
          AND (
                CAST(:skill AS text) IS NULL OR
                EXISTS (
                  SELECT 1 FROM user_skills us2
                  JOIN skills sk2 ON sk2.id = us2.skill_id
                  WHERE LOWER(sk2.name) = LOWER(CAST(:skill AS text))
                    AND up.id = us2.user_profile_id
                )
              )
        ORDER BY up.updated_at DESC
        """,
        countQuery = """
        SELECT COUNT(DISTINCT up.id)
		FROM user_profiles up
		LEFT JOIN user_skills us ON up.id = us.user_profile_id   -- LEFT
		LEFT JOIN skills sk ON sk.id = us.skill_id               -- LEFT
		JOIN users u ON u.id = up.user_id
		WHERE u.role = 'STUDENT'
          AND u.status = 'ACTIVE'
          AND u.id <> :excludedUserId
          AND (
                CAST(:q AS text) IS NULL OR
                LOWER(u.first_name) LIKE LOWER('%' || CAST(:q AS text) || '%') OR
                LOWER(u.last_name)  LIKE LOWER('%' || CAST(:q AS text) || '%') OR
                LOWER(u.email)      LIKE LOWER('%' || CAST(:q AS text) || '%') OR
                LOWER(up.bio)       LIKE LOWER('%' || CAST(:q AS text) || '%')
              )
          AND (CAST(:domain AS text) IS NULL OR LOWER(up.domain) = LOWER(CAST(:domain AS text)))
          AND (CAST(:availability AS text) IS NULL OR up.availability = CAST(:availability AS text))
          AND (
                CAST(:skill AS text) IS NULL OR
                EXISTS (
                  SELECT 1 FROM user_skills us2
                  JOIN skills sk2 ON sk2.id = us2.skill_id
                  WHERE LOWER(sk2.name) = LOWER(CAST(:skill AS text))
                    AND up.id = us2.user_profile_id
                )
              )
        """,
        nativeQuery = true)
    Page<UserProfile> searchStudents(
            @Param("q")              String q,
            @Param("domain")         String domain,
            @Param("availability")   String availability,
            @Param("skill")          String skill,
            @Param("excludedUserId") UUID excludedUserId,
            Pageable pageable
    );

    @Query(value = """
       SELECT DISTINCT up.*
	   FROM user_profiles up
	   LEFT JOIN user_skills us ON up.id = us.user_profile_id   -- LEFT
	   LEFT JOIN skills sk ON sk.id = us.skill_id               -- LEFT
	   JOIN users u ON u.id = up.user_id
	   WHERE u.role = 'STUDENT'
          AND u.status = 'ACTIVE'
          AND u.id <> :excludedUserId
          AND EXISTS (
              SELECT 1 FROM user_skills us2
              JOIN skills sk2 ON sk2.id = us2.skill_id
              WHERE sk2.name = ANY(CAST(:skillNames AS text[]))
                AND up.id = us2.user_profile_id
          )
        ORDER BY up.updated_at DESC
        """,
        nativeQuery = true)
    Page<UserProfile> findSuggestedPartners(
            @Param("excludedUserId") UUID excludedUserId,
            @Param("skillNames")     String[] skillNames,
            Pageable pageable
    );
}