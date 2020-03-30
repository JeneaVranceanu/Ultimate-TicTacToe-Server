package com.petproject.tictactoe.controller;

import java.nio.channels.ClosedChannelException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;

import javax.enterprise.context.ApplicationScoped;
import javax.websocket.Session;

import org.slf4j.Logger;

import com.petproject.tictactoe.model.Game;
import com.petproject.tictactoe.model.Mark;
import com.petproject.tictactoe.model.Message;
import com.petproject.tictactoe.model.Player;
import com.petproject.tictactoe.model.Field.Size;
import com.petproject.tictactoe.service.BroadcastService;

@ApplicationScoped
public class ConnectionController {

    Logger logger;
    MessageController mController;
    BroadcastService bService;

    List<Player> players = Collections.synchronizedList(new ArrayList<Player>());
    List<Game> games = Collections.synchronizedList(new ArrayList<Game>());

    public ConnectionController(Logger logger, MessageController mController, BroadcastService bService) {
        this.logger = logger;
        this.mController = mController;
        this.bService = bService;
    }

    public void onOpen(Session session, String username) {
        Player player = new Player(username, Mark.EMPTY, session);
        players.add(player);    
        try {
            bService.broadcast(mController.onOpenResponse(player));
        } catch (ClosedChannelException e) {
            removeUnavailablePlayers();
        }
    }

    public void onMessage(String rawMessage) {
        /** Get message type */
        Message message = mController.parseMessage(rawMessage);
        try {
            proccessMessage(message);
        } catch (ClosedChannelException e) {
            removeUnavailablePlayers();
        }
    }

    private void proccessMessage(Message message) throws NoSuchElementException, ClosedChannelException {
        switch (message.getType()) {
            case CREATE:
                Game gameCreate = new Game();
                Player playerX = getPlayerById(message.getPlayerId());
                if (!Objects.isNull(playerX)) {
                    gameCreate.createGame(message.getRoom(), playerX, Size.DEFAULT);
                }
                games.add(gameCreate);
                bService.broadcast(mController.onCreateResponse(gameCreate));
                logger.info("Game created: {}", gameCreate.info());
                break;
            case CONNECT:
                Game gameConnect = getGameByRoom(message.getRoom());
                Player playerO = getPlayerById(message.getPlayerId());
                gameConnect.connectToGame(playerO);
                bService.broadcast(mController.onConnectResponse(gameConnect));
                logger.info("Game started: {}", gameConnect.info());
                break;
            case TURN:
                Game game = getGameByRoom(message.getRoom());
                Player player = getPlayerById(message.getPlayerId());
                game.updateFieldState(message.getCell(), player.getMark());
                // game.checkWinCondition
                bService.broadcast(mController.onTurnResponse(game));
                logger.info("Player: {} make turn", player.getMark().getMarkName());
                break;
        }
    }

    private Player getPlayerById(String playerId) {
        return players.stream().filter(p -> p.getId().equals(playerId)).findFirst().orElseThrow();
    }

    private Game getGameByRoom(int room) {
        return games.stream().filter(g -> g.getRoom() == room).findFirst().orElseThrow();
    }

    private Game getGameByPlayerId(String playerId) {
        Player player = getPlayerById(playerId);
        return games.stream().filter(g -> (g.getPlayerO().equals(player) || g.getPlayerX().equals(player))).findFirst()
                .orElseThrow();
    }

    public void removeGameByPlayerId(String playerId) {
        games.removeIf(g -> g.equals(getGameByPlayerId(playerId)));
    }

    public void removePlayerByPlayerId(String playerId) {
        players.removeIf(p -> p.getId().equals(playerId));
    }
    
    private void removeUnavailablePlayers() {
        /** Clone list */
        List<Player> unavailable = new ArrayList<>(bService.getUnavailablePlayers());
        unavailable.forEach(p -> players.remove(p));
        unavailable.forEach(p -> games.removeIf(g -> g.equals(getGameByPlayerId(p.getId()))));
        bService.removeUnavailablePlayersFromList(unavailable);
        logger.info("Remove unavailable Players and Games if exist");
    }

}