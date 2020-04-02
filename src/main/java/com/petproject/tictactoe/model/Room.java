package com.petproject.tictactoe.model;

public class Room {

    private long roomId;
    private String roomName;
    private int playerCount;
    private long createdAt;

    public Room(long roomId, String roomName, int playerCount, long createdAt) {
        this.roomId = roomId;
        this.roomName = roomName;
        this.playerCount = playerCount;
        this.createdAt = createdAt;
    }

    public long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(long createdAt) {
        this.createdAt = createdAt;
    }

    public int getPlayerCount() {
        return playerCount;
    }

    public void setPlayerCount(int playerCount) {
        this.playerCount = playerCount;
    }

    public String getRoomName() {
        return roomName;
    }

    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }

    public long getRoomId() {
        return roomId;
    }

    public void setRoomId(long roomId) {
        this.roomId = roomId;
    }

}
