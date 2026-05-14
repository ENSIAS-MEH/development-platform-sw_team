package com.collabyouth.repository;

import com.collabyouth.entity.TeamMember;
import com.collabyouth.enums.TeamRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, UUID> {

    List<TeamMember> findAllByTeamId(UUID teamId);

    List<TeamMember> findAllByUserId(UUID userId);

    Optional<TeamMember> findByTeamIdAndUserId(UUID teamId, UUID userId);

    boolean existsByTeamIdAndUserId(UUID teamId, UUID userId);

    boolean existsByTeamIdAndUserIdAndTeamRole(UUID teamId, UUID userId, TeamRole teamRole);

    int countByTeamId(UUID teamId);
}
