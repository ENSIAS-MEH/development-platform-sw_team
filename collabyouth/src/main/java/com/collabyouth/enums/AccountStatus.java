package com.collabyouth.enums;

public enum AccountStatus {
    PENDING,   // newly registered, awaiting admin review
    ACTIVE,    // approved and can log in
    REJECTED,  // denied by admin
    SUSPENDED  // disabled after activation
}
