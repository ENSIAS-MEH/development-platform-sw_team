package com.collabyouth.dto.request;

import java.util.List;

public class CreateTeamRequest {
    private String teamName;
    private List<String> memberIds; // Modifié en String pour recevoir proprement les UUIDs du Front

    public String getTeamName() { 
        return teamName; 
    }
    public void setTeamName(String teamName) { 
        this.teamName = teamName; 
    }

    public List<String> getMembers() { 
        return memberIds; 
    }
    public void setMembers(List<String> memberIds) { 
        this.memberIds = memberIds; 
    }
}