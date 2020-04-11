package com.petproject.tictactoe.controller;

import javax.enterprise.context.ApplicationScoped;

import com.petproject.tictactoe.model.Game;
import com.petproject.tictactoe.model.Game.State;

@ApplicationScoped
public class WinConditionController {

    public State checkWinCondition(Game game) {
        if (!(game.getState().equals(State.WIN_O) || game.getState().equals(State.WIN_X)) 
            && game.getField().isFull()) {
                game.setState(State.DRAW);
        }
        return game.getState();
    }

}