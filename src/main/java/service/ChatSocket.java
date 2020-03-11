package service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;

import org.slf4j.Logger;

import controller.ConnectionController;
import model.Game;
import model.Player;
import utils.Params;
import utils.ParamsParser;

import javax.websocket.Session;

@ServerEndpoint("/chat/{params}")
@ApplicationScoped
public class ChatSocket {

    Logger logger;
    ConnectionController cnController;
    Map<String, Game> sessions = new ConcurrentHashMap<>();

    public ChatSocket(Logger logger, ConnectionController connectionController) {
        this.logger = logger;
        this.cnController = connectionController;
    }

    @OnOpen
    public void onOpen(Session session, @PathParam("params") String params) {
        Game game = cnController.onOpen(session, params, sessions);
        broadcast(game, game.info());
    }

    @OnClose
    public void onClose(Session session, @PathParam("params") String params) {
        Params playerParams = ParamsParser.parseParamString(params);
        logger.info("Close ws connection with parameters: {}", params);
        broadcastAll(String.format("Player %s leave the game.", playerParams.getName()));
        removeSession(playerParams.getRoom());
        // broadcast("User " + username + " left");
    }

    @OnError
    public void onError(Session session, @PathParam("username") String username, Throwable throwable) {
        // sessions.remove(username);
        // broadcast("User " + username + " left on error: " + throwable);
    }

    @OnMessage
    public void onMessage(String message, @PathParam("username") String username) {
        // broadcast(">> " + username + ": " + message);
    }

    private void broadcast(Game game, String message) {
        playerBroadcast(game.getPlayerX(), message);
        playerBroadcast(game.getPlayerO(), message);
    }

    private void broadcastAll(String message) {
        sessions.entrySet().forEach(entry -> {
            playerBroadcast(entry.getValue().getPlayerX(), message);
            playerBroadcast(entry.getValue().getPlayerO(), message);
        });
    }

    private void playerBroadcast(Player player, String message) {
        player.getSession().getAsyncRemote().sendObject(message, result ->  {
            if (result.getException() != null) {
                logger.error("Unable to send message to {} session will be cleared", player.getRoom());
                removeSession(player.getRoom());
            }
        });
    }

    private void removeSession(String room) {
        if (room != null) {
            sessions.remove(room);
        }
    }

}