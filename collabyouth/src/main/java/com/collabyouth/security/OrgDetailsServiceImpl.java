package com.collabyouth.security;

import java.util.List;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.collabyouth.entity.Organization;
import com.collabyouth.repository.OrganizationRepository;


@Service("orgDetailsService")
public class OrgDetailsServiceImpl implements UserDetailsService {

    private final OrganizationRepository organizationRepository;

    public OrgDetailsServiceImpl(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Organization org = organizationRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Organization not found: " + email));

        return new User(
                org.getEmail(),
                org.getPasswordHash(),
                List.of(new SimpleGrantedAuthority("ROLE_ORG"))
        );
    }
}
