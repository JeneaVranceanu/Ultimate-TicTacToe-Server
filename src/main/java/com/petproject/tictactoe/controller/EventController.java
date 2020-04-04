package com.petproject.tictactoe.controller;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicLong;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.websocket.Session;

import org.slf4j.Logger;

import com.petproject.tictactoe.model.Game;
import com.petproject.tictactoe.model.Shape;
import com.petproject.tictactoe.model.Game.State;
import com.petproject.tictactoe.model.Message;
import com.petproject.tictactoe.model.Player;

@ApplicationScoped
public class EventController {

    @Inject
    Logger logger;
    @Inject
    MessageController messageController;

    private List<Player> players = Collections.synchronizedList(new ArrayList<Player>());
    private List<Game> games = Collections.synchronizedList(new ArrayList<Game>());
    private AtomicLong roomIdCounter = new AtomicLong(0L);

    public Map<Player, Message> onOpen(Session session, String username) {
        Player player = new Player(username, Shape.EMPTY, session);
        players.add(player);
        return messageController.onOpenResponse(player);
    }

    public Map<Player, Message> onMessage(String rawMessage, Session session) {
        /** Get message type */
        Message message = messageController.parseMessage(rawMessage);
        try {
            return proccessMessage(message);
        } catch (NoSuchElementException e) {
            logger.error("{}", e);
            return messageController.onErrorResponse(session);
        } catch (Exception e) {
            logger.error("{}", e);
            return messageController.onErrorResponse(session);
        }

    }

    // TODO TEST
    public Map<Player, Message> onClose(Session session, String username) {
        Map<Player, Message> onCloseResponse = new HashMap<>();
        Player disconnectedPlayer = getPlayerBySessionId(session.getId());
        if (disconnectedPlayer != null) {
            if (!isPlayerFree(disconnectedPlayer)) {
                onCloseResponse.putAll(messageController.onCloseResponse(getGameByPlayer(disconnectedPlayer)));
            }
        }
        return onCloseResponse;
    }

    // TODO TEST
    public Map<Player, Message> onError(Session session, String username, Throwable throwable) {
        Map<Player, Message> onErrorResponse = new HashMap<>();
        Player disconnectedPlayer = getPlayerBySessionId(session.getId());
        if (disconnectedPlayer != null) {
            if (!isPlayerFree(disconnectedPlayer)) {
                onErrorResponse.putAll(messageController.onCloseResponse(getGameByPlayer(disconnectedPlayer)));
            }
            removeUnavailablePlayer(disconnectedPlayer);
        }
        return onErrorResponse;
    }

    private Map<Player, Message> proccessMessage(Message message) throws NoSuchElementException {
        Game game = null;
        Player player = null;
        switch (message.getType()) {
            case ROOM_CREATE:
                player = getPlayerById(message.getPlayerId());
                game = new Game();
                game.createGame(player, getFreeRoomId(), message.getRoomName());
                games.add(game);
                return messageController.onCreateResponse(game);
            case ROOM_CONNECT:
                game = getGameByRoomId(message.getRoomId());
                player = getPlayerById(message.getPlayerId());
                if (game.getState().equals(State.CREATED)) {
                    if (isPlayerFree(player)) {
                        game.connectToGame(player);
                        return messageController.onConnectResponse(game);
                    }
                }
                throw new NoSuchElementException("Cannot connect to Game with given RoomId and PlayerId!");
            case ROOM_CLOSE:
                player = getPlayerById(message.getPlayerId());
                /** Check if player exist and Shape equals Shape.X */
                if (!Objects.isNull(player) && player.getShape().equals(Shape.X)) {
                    game = getGameByRoomId(message.getRoomId());
                    /** Check if Game in State.CREATED and PlayerX eq Player */
                    if (game.getState().equals(State.CREATED) && game.getPlayerX().equals(player)) {
                        closeGame(game);
                        return messageController.onCloseResponse(game);
                    }
                }
                // TODO Make custom Exeptions 
                throw new NoSuchElementException("Cannot close the Game with given PlayerId!");
            case TURN:
                game = getGameByRoomId(message.getRoomId());
                player = getPlayerById(message.getPlayerId());
                if (isGameInPlayStage(game) && game.playerExist(player) && game.getNextTurnPlayer().equals(player)) {
                    game.updateFieldState(message.getCellOccupied());
                    // game.checkWinCondition
                    return messageController.onTurnResponse(game);
                }
                throw new NoSuchElementException("Cannot make turn with given Player!");
            default:
                player = getPlayerById(message.getPlayerId());
                return messageController.onRoomListResponse(player, games);
        }
    }

    public void closeGame(Game game) {
        games.remove(game);
        logger.info("Close Game: {}, {}", game.getRoom(), game.info());
    }

    public List<Player> getPlayers() {
        return players;
    }

    public List<Game> getGames() {
        return games;
    }

    public Player getPlayerById(String playerId) throws NoSuchElementException {
        return players.stream().filter(p -> p.getId().equals(playerId)).findFirst().orElseThrow();
    }

    public Player getPlayerBySessionId(String sessionId) {
        return players.stream().filter(p -> p.getSession().getId().equals(sessionId)).findFirst().orElse(null);
    }
    
    public boolean isPlayerFree(Player player) {
        return games.stream().noneMatch(g -> g.playerExist(player)) && player.getShape().equals(Shape.EMPTY);
    }

    public Game getGameByRoomId(long roomId) throws NoSuchElementException {
        return games.stream().filter(g -> g.getRoom().getId() == roomId).findFirst().orElseThrow();
    }

    public Game getGameByPlayer(Player player) {
        return games.stream().filter(g -> g.playerExist(player)).findFirst().orElseThrow();
    }

    public boolean isGameInPlayStage(Game game) {
        return game.getState().equals(State.O_TURN) || game.getState().equals(State.X_TURN);
    }

    public void removeGame(Game game) {
        games.removeIf(g -> g.equals(game));
    }

    private void removePlayer(Player player) {
        players.removeIf(p -> p.equals(player));
        getGameByPlayer(player).removePlayer(player);
    }

    public void removeUnavailablePlayer(Player player) {
        Game game = getGameByPlayer(player);
        removePlayer(player);
        closeGame(game);
        logger.info("Remove unavailable Player: {} and close the Game room: {}", player.getName());
    }

    public long getCurrentRoomIdCounter() {
        return roomIdCounter.get();
    }

    public long getFreeRoomId() {
        while (games.stream().anyMatch(g -> g.getRoom().getId() == roomIdCounter.get())) {
            roomIdCounter.incrementAndGet();
        }
        return roomIdCounter.get();
    }

}