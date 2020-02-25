import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import javax.enterprise.context.ApplicationScoped;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import javax.websocket.Session;

@ServerEndpoint("/chat/{params}")
@ApplicationScoped
public class ChatSocket {

    String field = "";
    Map<String, Game> sessions = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(Session session, @PathParam("params") String params) {
        String[] paramArray = params.split("&");
        Game game = null;
        if (!sessions.containsKey(paramArray[0])) {
            game = new Game();
            game.createGame(paramArray[0], paramArray[1], session);
            sessions.put(paramArray[0], game);
        } else {
            game = sessions.get(paramArray[0]);
            game.connectToGame(paramArray[0], paramArray[1], session);
        }

        broadcast(game);
    }

    @OnClose
    public void onClose(Session session, @PathParam("username") String username) {
        // sessions.remove(username);
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

    private void broadcast(Game game) {
        game.playerX.getSession().getAsyncRemote().sendObject(game.info(), result ->  {
                    if (result.getException() != null) {
                        System.out.println("Unable to send message: " + result.getException());
                    }
                });
        game.playerO.getSession().getAsyncRemote().sendObject(game.info(), result ->  {
            if (result.getException() != null) {
                System.out.println("Unable to send message: " + result.getException());
            }
        });
    }

}