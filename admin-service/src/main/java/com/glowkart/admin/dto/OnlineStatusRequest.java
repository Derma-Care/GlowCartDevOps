package com.glowkart.admin.dto;

import lombok.Data;

@Data
public class OnlineStatusRequest {
    private boolean online;  // <-- change from isOnline to online
}
