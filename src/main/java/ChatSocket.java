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

import utils.Params;
import utils.ParamsParser;

import javax.websocket.Session;

@ServerEndpoint("/chat/{params}")
@ApplicationScoped
public class ChatSocket {

    @Inject
    Logger logger;

    String field = "";
    Map<String, Game> sessions = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(Session session, @PathParam("params") String params) {
        Params playerParams = ParamsParser.parseParamString(params);
        logger.info("Open ws connection with parameters: {}", params);

        Game game = null;
        if (!sessions.containsKey(playerParams.getIp())) {
            game = new Game();
            game.createGame(playerParams.getIp(), playerParams.getName(), session);
            sessions.put(playerParams.getIp(), game);
            logger.info("Player X with Name: {} create game for IP: {}", playerParams.getName(), playerParams.getIp());
        } else {
            game = sessions.get(playerParams.getIp());
            game.connectToGame(playerParams.getIp(), playerParams.getName(), session);
            logger.info("Player O with Name: {} connect to game by IP: {}", playerParams.getName(), playerParams.getIp());
        }

        broadcast(game, game.info());
    }

    @OnClose
    public void onClose(Session session, @PathParam("params") String params) {
        Params playerParams = ParamsParser.parseParamString(params);
        logger.info("Close ws connection with parameters: {}", params);
        broadcastAll(String.format("Player %s leave the game.", playerParams.getName()));
        removeSession(playerParams.getIp());
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
        playerBroadcast(game.playerX, message);
        playerBroadcast(game.playerO, message);
    }

    private void broadcastAll(String message) {
        sessions.entrySet().forEach(entry -> {
            playerBroadcast(entry.getValue().playerX, message);
            playerBroadcast(entry.getValue().playerO, message);
        });
    }

    private void playerBroadcast(Player player, String message) {
        player.getSession().getAsyncRemote().sendObject(message, result ->  {
            if (result.getException() != null) {
                logger.error("Unable to send message to {} session will be cleared", player.ip);
                removeSession(player.ip);
            }
        });
    }

    private void removeSession(String ip) {
        if (ip != null) {
            sessions.remove(ip);
        }
    }

}