package com.petproject.tictactoe.model;

import java.util.Objects;

public class Game {

    private Field field;
    private State state;
    private Room room;
    private Player playerX;
    private Player playerO;
    private Player nextTurnPlayer;

    public Game() {
        this.state = State.INITIAL;
    }

    public void createGame(Player playerX, long roomId, String roomName) {
        field = new Field();
        this.playerX = playerX;
        playerX.setShape(Shape.X);
        nextTurnPlayer = playerX;
        this.room = new Room(roomId, roomName, 1);
        state = State.CREATED;
    }

    public void connectToGame(Player playerO) {
        this.playerO = playerO;
        playerO.setShape(Shape.O);
        state = State.X_TURN;
        this.room.setPlayersCount(2);
    }

    public void updateFieldState(Cell cell) {
        if (field.canFillCell(cell)) {
            field.fillCell(cell);
            if (cell.getShape().equals(Shape.X)) {
                state = State.O_TURN;
                nextTurnPlayer = playerO;
            } else {
                state = State.X_TURN;
                nextTurnPlayer = playerX;
            }
        }
    }

    public String info() {

        String xState = Objects.isNull(playerX) ? "X is not connected" : playerX.toString();
        String oState = Objects.isNull(playerO) ? "O is not connected" : playerO.toString();

        return String.format("Game info: \nPlayerX: %s\nPlayerO: %s\nField: %s\nState: %s \nNext turn: %s", xState,
                oState, field.toString(), state.name(),
                nextTurnPlayer.getShape().getShapeName().concat(" " + nextTurnPlayer.getName()));
    }

    public Player getNextTurnPlayer() {
        return nextTurnPlayer;
    }

    public Player getPlayerX() {
        return playerX;
    }

    public Player getPlayerO() {
        return playerO;
    }

    public Field getField() {
        return field;
    }

    public State getState() {
        return state;
    }

    public boolean isEnded() {
        return this.state.equals(State.WIN_X) 
            || this.state.equals(State.WIN_O)
            || this.state.equals(State.DRAW)
            || this.state.equals(State.DISCONNECTED);
    }

    public void setState(State state) {
        this.state = state;
    }

    public Room getRoom() {
        return room;
    }

    public void removePlayer(Player player) {
        if (player.equals(playerX)) {
            playerX = null;
        } else {
            playerO = null;
        }
    }

    public boolean playerExist(Player player) {
        return ((playerX != null && playerX.equals(player)) || (playerO != null && playerO.equals(player)));
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        Game g = (Game) o;
        return field.toString().equals(g.getField().toString()) &&
            state.equals(g.getState()) &&
            room.toJson().equals(g.getRoom().toJson()) &&
            playerX.equals(g.getPlayerX()) && 
            playerO.equals(g.getPlayerO()) &&
            nextTurnPlayer.equals(g.getNextTurnPlayer());

    }

    public enum State {

        INITIAL, CREATED, X_TURN, O_TURN, WIN_X, WIN_O, DRAW, DISCONNECTED;

    }

}