package com.collabyouth.repository;
import com.collabyouth.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, UUID> {
    
    @Query("SELECT tm FROM TeamMember tm JOIN FETCH tm.user WHERE tm.team.id = :teamId")
    List<TeamMember> findAllByTeamId(@Param("teamId") UUID teamId);
    
    long countByTeamId(UUID teamId);
    
    java.util.Optional<TeamMember> findByTeamIdAndUserId(UUID teamId, UUID userId);
    
    boolean existsByTeamIdAndUserId(UUID teamId, UUID userId);
    
    long countByUserId(UUID userId);
}