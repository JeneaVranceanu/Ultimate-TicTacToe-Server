package com.petproject.tictactoe.model;

import java.util.Objects;

import com.petproject.tictactoe.model.Field.Size;

public class Game {

    private Field field;
    private State state;
    private int room;
    private Player playerX;
    private Player playerO;

    public Game() {
        this.state = State.INIT;
    }

    public void createGame(int room, Player playerX, Size fieldSize) {
        field = new Field(fieldSize);
        this.playerX = playerX;
        playerX.setMark(Mark.X);
        this.room = room;
        state = State.WAIT;
    }

    public void connectToGame(Player playerO) {
        this.playerO = playerO;
        playerO.setMark(Mark.O);
        state = State.START;
    }

    public void updateFieldState(int cell, Mark mark) {
        if (field.canSetMark(cell)) {
            field.setMark(mark, cell);
            if (mark.equals(Mark.X)) {
                state = State.O_TURN;
            } else {
                state = State.X_TURN;
            }
        }
    }

    public String info() {

        String xState = Objects.isNull(playerX) ? "X is not connected" : playerX.toString();
        String oState = Objects.isNull(playerO) ? "O is not connected" : playerO.toString();

        return String.format("Game info: \nPlayerX: %s\nPlayerO: %s\nField: %s\nState: %s", xState, oState,
                field.toString(), state.name());
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

    public int getRoom() {
        return room;
    }

    public enum State {

        INIT("INIT"), WAIT("WAIT"), START("START"), X_TURN("X_TURN"), O_TURN("O_TURN"), END("END");

        private String state;

        State(String state) {
            this.state = state;
        }

        public String getState() {
            return state;
        }
    }

}