package com.petproject.tictactoe.model;

import java.util.Date;
import java.util.Objects;

import javax.json.Json;
import javax.json.JsonObject;

import com.petproject.tictactoe.utils.RandomNameGenerator;

public class Room {

    private long roomId;
    private String roomName;
    private int playersCount;
    private long createdAt;

    public Room(long roomId, String roomName, int playersCount) {
        this.roomId = roomId;
        if (Objects.isNull(roomName) || roomName.isBlank()) {
            this.roomName = RandomNameGenerator.get();
        } else {
            this.roomName = roomName;
        }
        this.playersCount = playersCount;
        this.createdAt = new Date().getTime();
    }

    public long getCreatedAt() {
        return createdAt;
    }

    public int getPlayersCount() {
        return playersCount;
    }

    public void setPlayersCount(int playerCount) {
        this.playersCount = playerCount;
    }

    public String getRoomName() {
        return roomName;
    }

    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }

    public long getId() {
        return roomId;
    }

    public void setRoomId(long roomId) {
        this.roomId = roomId;
    }

    public JsonObject toJson() {
        return Json.createObjectBuilder()
            .add("roomId", roomId)
            .add("roomName", roomName)
            .add("playersCount", playersCount)
            .add("createdAt", createdAt)
            .build();
    }

}
