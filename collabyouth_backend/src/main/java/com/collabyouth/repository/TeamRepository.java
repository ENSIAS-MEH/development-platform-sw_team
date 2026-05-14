package com.collabyouth.repository;

import com.collabyouth.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TeamRepository extends JpaRepository<Team, UUID> {

    List<Team> findAllByCreatedById(UUID userId);

    // Teams the user belongs to (as member or admin)
    @Query("""
            SELECT t FROM Team t
            JOIN TeamMember tm ON tm.team.id = t.id
            WHERE tm.user.id = :userId
            """)
    List<Team> findAllByMemberId(@Param("userId") UUID userId);
}
