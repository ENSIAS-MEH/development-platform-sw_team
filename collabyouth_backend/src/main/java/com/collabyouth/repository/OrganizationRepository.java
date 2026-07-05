package com.collabyouth.repository;

import com.collabyouth.entity.Organization;
import com.collabyouth.enums.AccountStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrganizationRepository extends JpaRepository<Organization, UUID> {

    boolean existsByEmail(String email);

    Optional<Organization> findByEmail(String email);

    List<Organization> findByStatus(AccountStatus status);
}