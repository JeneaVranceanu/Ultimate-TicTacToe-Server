package controller;

import java.util.Map;

import javax.enterprise.context.ApplicationScoped;
import javax.websocket.Session;

import org.slf4j.Logger;

import model.Game;
import utils.Params;
import utils.ParamsParser;

@ApplicationScoped
public class ConnectionController {

    Logger logger;

    public ConnectionController(Logger logger) {
        this.logger = logger;
    }

    public Game onOpen(Session session, String params, Map<String, Game> sessions) {
        Params playerParams = ParamsParser.parseParamString(params);
        logger.info("Open ws connection with parameters: {}", params);

        Game game = null;
        if (!sessions.containsKey(playerParams.getRoom())) {
            game = new Game();
            game.createGame(playerParams.getRoom(), playerParams.getName(), session);
            sessions.put(playerParams.getRoom(), game);
            logger.info("Player X with Name: {} create game with Room: {}", playerParams.getName(), playerParams.getRoom());
        } else {
            game = sessions.get(playerParams.getRoom());
            game.connectToGame(playerParams.getRoom(), playerParams.getName(), session);
            logger.info("Player O with Name: {} connect to game with Room: {}", playerParams.getName(), playerParams.getRoom());
        }
        return game;
    }
    
}