// 
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

    @Query("SELECT tm.team FROM TeamMember tm WHERE tm.user.id = :studentId")
    List<Team> findTeamsByStudentId(@Param("studentId") UUID studentId);
}